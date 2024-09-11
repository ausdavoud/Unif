import { publicQueueDB } from "../../src/db/mongodb/connect";
import { getCookie, isCookieValid } from "../../src/lms/commonUtils/cookie";
import { getGroupCodes } from "../../src/lms/PublicMessage/groupCodeScraper";
import { getGroupPageContent } from "../../src/lms/commonUtils/urlClient";
import {
  findFeedMessages,
  createMessageBody,
} from "../../src/lms/PublicMessage/messageParser";
import { PublicMessage } from "../../src/lms/commonUtils/messageTypes";
import {
  addMessageHeaderFooter,
  messagesAreDifferent as hasMessageChanged,
} from "../../src/lms/PublicMessage/changeHandler";
import { getLatestByDate } from "../../src/lms/commonUtils/helpers";
import { fetchByAuthorText, putToDB } from "../../src/db/dbService";

export async function testAsyncAnalyze() {
  const username = process.env.LMS_USERNAME || "";
  const password = process.env.LMS_PASSWORD || "";
  console.log("username", username);
  console.log("password", password);

  const cookie = await getCookie(username, password);
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
      const fetchedMessages = await fetchByAuthorText(
        publicQueueDB,
        newMessageInFeed
      );
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
