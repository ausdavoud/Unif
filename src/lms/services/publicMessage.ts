import { fetchByQuery, putToDB } from "../../db/dbService";
import { publicQueueDB, publicSentDB } from "../../db/mongodb/connect";
import { getLatestByDate } from "../commonUtils/helpers";
import { getGroupPageContent } from "../commonUtils/urlClient";
import {
  addMessageHeaderFooter,
  hasMessageChanged,
} from "../PublicMessage/changeHandler";
import { getGroupCodes } from "../PublicMessage/groupCodeScraper";
import {
  createMessageBody,
  findFeedMessages,
} from "../PublicMessage/messageParser";

export async function processPublicMessages(cookie: string) {
  console.log("START --- Public Message Service");
  console.log("Public Message Service was triggered.");

  // Getting group codes
  console.log("Retrieving group codes.");
  let groupCodes = await getGroupCodes(cookie);
  if (groupCodes.length === 0) {
    throw new Error("No groups found in lms homepage.");
  }
  console.log(`A total of ${groupCodes.length} groups (classes) was found.`);
  // groupCodes = ["/group/100593"];
  let publicMessagesCount = 0;
  let newPublicMessagesCount = 0;
  groupCodes.forEach(async (groupCode) => {
    console.log(`Fetching page content for group code ${groupCode}.`);
    const groupPageContent = await getGroupPageContent(groupCode, cookie);
    console.log(`Page content for ${groupCode} was fetched.`);
    const feedMessages = findFeedMessages(groupPageContent);
    if (feedMessages.length == 0) {
      console.log(`${groupCode}'s feed is entirely empty.`);
      return;
    }
    console.log(
      `Group ${groupCode} had a total of ${feedMessages.length} messages.`
    );
    publicMessagesCount += feedMessages.length;

    feedMessages.forEach(async (feedMessage) => {
      const newMessageInFeed = createMessageBody(feedMessage, groupCode);

      const { author, text } = newMessageInFeed;
      const query = {
        author,
        text,
      };
      console.log("Fetching queued messages with the same author and text.");
      const fetchedMessagesInSentDB = await fetchByQuery(publicSentDB, query);
      console.log("Fetching sent messages with the same author and text.");
      const fetchedMessagesInQueueDB = await fetchByQuery(publicQueueDB, query);
      const fetchedMessages = fetchedMessagesInSentDB.concat(
        fetchedMessagesInQueueDB
      );
      console.log(
        `A total of ${fetchedMessages.length} similar public messages found.`
      );
      const oldMessageInDB = getLatestByDate(fetchedMessages);
      if (!hasMessageChanged(newMessageInFeed, oldMessageInDB)) {
        console.log("New message(lms) and old message(db) are the same.");
        return;
      }
      newPublicMessagesCount += 1;
      console.log(`New/Updated message detected in group ${groupCode}`);
      console.log("Adding metadata to the new message.");
      addMessageHeaderFooter(newMessageInFeed, oldMessageInDB);
      console.log("Inserting new/updated message into the queue.");
      const putResult = await putToDB(publicQueueDB, newMessageInFeed);
      const putMsg = putResult
        ? `Message with key ${putResult._id} from ${newMessageInFeed.author} was saved.`
        : `Failed saving message from ${newMessageInFeed.author} to QueueDB.`;
    });
  });
  console.log(
    `Public Message Service Finished. A total of ${publicMessagesCount} was found, ` +
      `${newPublicMessagesCount} was(were) new.`
  );
  console.log("END --- PUBLIC Message Service");

  return { publicMessagesCount };
}
