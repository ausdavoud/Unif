import { fetchByQuery, putToDB } from "../../src/db/dbService";
import { publicQueueDB } from "../../src/db/mongodb/connect";
import env from "../../src/env";
import {
  getFreshCookie,
  isCookieValid,
} from "../../src/lms/commonUtils/cookie";
import { getLatestByDate } from "../../src/lms/commonUtils/helpers";
import { getGroupPageContent } from "../../src/lms/commonUtils/urlClient";
import {
  addMessageHeaderFooter,
  hasMessageChanged,
} from "../../src/lms/PublicMessage/changeHandler";
import {
  createMessageBody,
  findFeedMessages,
} from "../../src/lms/PublicMessage/messageParser";

export async function testAsyncAnalyze() {
  const username = env.LMS_USERNAME;
  const password = env.LMS_PASSWORD;
  console.log("username", username);
  console.log("password", password);

  const cookie = await getFreshCookie(username, password);
  if (!isCookieValid(cookie)) {
    throw new Error("Cookie is not valid.");
  }
  // const groupNames = await getGroupCodes(cookie);
  const groupNames = ["/group/100593"];
  groupNames.forEach(async (groupName) => {
    const groupPageContent = await getGroupPageContent(groupName, cookie);

    const feedMessages = findFeedMessages(groupPageContent);
    if (feedMessages.length == 0) {
      console.log(`No old or new message in ${groupName}'s feed.`);
      return;
    }

    feedMessages.forEach(async (feedMessage) => {
      const newMessageInFeed = createMessageBody(feedMessage, groupName);
      const { author, text } = newMessageInFeed;
      const query = {
        author,
        text,
      };
      const fetchedMessages = await fetchByQuery(publicQueueDB, query);
      const oldMessagesInDB = fetchedMessages;
      const oldMessageInDB = getLatestByDate(oldMessagesInDB);
      if (!hasMessageChanged(newMessageInFeed, oldMessageInDB)) {
        console.log("New message(lms) and old message(db) are the same.");
        return;
      }
      addMessageHeaderFooter(newMessageInFeed, oldMessageInDB);
      const putResult = await putToDB(publicQueueDB, newMessageInFeed);
      const putMsg = putResult
        ? `Saved message with key ${putResult._id} from ${newMessageInFeed.author}.`
        : `Failed saving message from ${newMessageInFeed.author} to QueueDB.`;
      console.log(putMsg);
    });
  });
}

testAsyncAnalyze();
