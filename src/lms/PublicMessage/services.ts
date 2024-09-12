import {
  fetchByAuthorDate,
  fetchByAuthorText,
  putToDB,
  welcomeMessageExists,
} from "../../db/dbService";
import {
  privateQueueDB,
  privateSentDB,
  publicQueueDB,
  publicSentDB,
} from "../../db/mongodb/connect";
import { constructWelcomeText, getLatestByDate } from "../commonUtils/helpers";
import { PrivateMessage } from "../commonUtils/messageTypes";
import { getGroupPageContent } from "../commonUtils/urlClient";
import {
  extractInboxMessages,
  getPrivateInbox,
} from "../PrivateMessage/messageParser";
import { addMessageHeaderFooter, hasMessageChanged } from "./changeHandler";
import { getGroupCodes } from "./groupCodeScraper";
import { createMessageBody, findFeedMessages } from "./messageParser";

export async function processPublicMessages(cookie: string) {
  console.log("START --- Public Message Service");
  console.log("Public Message Service was triggered.");

  // Getting group codes
  console.log("Retrieving group codes.");
  const groupCodes = await getGroupCodes(cookie);
  if (groupCodes.length === 0) {
    throw new Error("No groups found in lms homepage.");
  }
  console.log(`A total of ${groupCodes.length} groups (classes) was found.`);
  // const groupNames = ["/group/100593"];
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

      console.log("Fetching queued messages with the same author and text.");
      const fetchedMessagesInSentDB = await fetchByAuthorText(
        publicSentDB,
        newMessageInFeed
      );
      console.log("Fetching sent messages with the same author and text.");
      const fetchedMessagesInQueueDB = await fetchByAuthorText(
        publicQueueDB,
        newMessageInFeed
      );
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

export async function processPrivateMessages(cookie: string) {
  console.log("START --- Private Message Service");
  console.log("Private Message Service was triggered.");
  console.log("Fetching page content for Private Inbox.");
  const inboxPageContent = await getPrivateInbox(cookie);
  console.log("Page content for Private Inbox was fetched.");
  console.log("Extracting private messages from the page content.");
  const privateMessages = extractInboxMessages(inboxPageContent);
  const privateMessagesCount = privateMessages.length;
  let newPrivateMessagesCount = 0;
  console.log(`A total of ${privateMessagesCount} private messages was found.`);
  privateMessages.forEach(
    async (privateMessage: {
      author: string;
      sentAt: string;
      header: string;
      title: string;
      link: string;
      createdAt: Date;
    }) => {
      console.log("Fetching sent messages with the same author and date.");
      const fetchedMessagesInSentDB = await fetchByAuthorDate(
        privateSentDB,
        privateMessage
      );
      let fetchedMessages = [];
      if (fetchedMessagesInSentDB) {
        console.log(
          `Found ${fetchedMessagesInSentDB.length} similar private message(s)`
        );
        fetchedMessages = fetchedMessagesInSentDB;
      } else {
        console.log(
          "No similar sent private messages were found. Searching in queue..."
        );
        const fetchedMessagesInQueueDB = await fetchByAuthorDate(
          privateQueueDB,
          privateMessage
        );
        fetchedMessages = fetchedMessagesInQueueDB;
      }
      if (fetchedMessages) {
        console.log(
          "No similar queued private messages were found either. " +
            "This private message was not new."
        );
        return;
      }

      console.log("New private message found. Inserting into queue.");
      newPrivateMessagesCount += 1;
      const response = await privateQueueDB.create(privateMessage);
      console.log("New private message inserted into the queue.");
    }
  );

  console.log(
    `A total of ${privateMessagesCount} private message found in inbox, ` +
      `${newPrivateMessagesCount} was(were) new.`
  );
  console.log("END --- Private Message Service");

  return { privateMessagesCount };
}

export async function handleWelcomeMessage(
  publicMessagesCount: number,
  privateMessagesCount: number
) {
  if (
    !welcomeMessageExists(privateSentDB) &&
    !welcomeMessageExists(privateQueueDB)
  ) {
    console.log("No welcome message found. Creating one...");
    const text = constructWelcomeText(
      publicMessagesCount,
      privateMessagesCount
    );
    const welcomeMessage: PrivateMessage = {
      author: "یونیف",
      sentAt: "یک روز زیبا و خنک",
      header: text,
      title: "پیام خوش‌آمد گویی",
      link: "dnosrati.com",
      createdAt: new Date(),
    };
    console.log("Inserting welcome message to the queue.");
    await privateQueueDB.create(welcomeMessage);
  }
}
