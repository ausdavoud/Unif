import { fetchByAuthorDate, welcomeMessageExists } from "../../db/dbService";
import { privateQueueDB, privateSentDB } from "../../db/mongodb/connect";
import { constructWelcomeText } from "../commonUtils/helpers";
import { PrivateMessage } from "../commonUtils/messageTypes";
import {
  extractInboxMessages,
  getPrivateInbox,
} from "../PrivateMessage/messageParser";

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
