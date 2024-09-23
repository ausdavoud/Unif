import { fetchByQuery, existsInDB, putToDB } from "../../db/dbService";
import {
  privateQueueDB,
  privateSentDB,
  publicQueueDB,
  publicSentDB,
} from "../../db/mongodb/connect";
import { constructWelcomeText } from "../commonUtils/helpers";
import { PrivateMessage, PublicMessage } from "../commonUtils/messageTypes";
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
  privateMessages.forEach(async (privateMessage) => {
    const { author, sentAt } = privateMessage;
    const query = {
      author,
      sentAt,
    };
    console.log("Fetching sent messages with the same author and date.");
    const fetchedMessagesInSentDB: PrivateMessage[] = await fetchByQuery(
      privateSentDB,
      query
    );
    let fetchedMessages = [];
    if (fetchedMessagesInSentDB.length !== 0) {
      console.log(
        `Found ${fetchedMessagesInSentDB.length} similar sent private message(s)`
      );
      fetchedMessages = fetchedMessagesInSentDB;
    } else {
      console.log(
        "No similar sent private messages were found. Searching in queue..."
      );
      const fetchedMessagesInQueueDB = await fetchByQuery(
        privateQueueDB,
        query
      );
      fetchedMessages = fetchedMessagesInQueueDB;
    }
    if (fetchedMessages.length !== 0) {
      console.log(
        "Similar queued private messages were found. " +
          "This private message was not new."
      );
      return;
    }
    console.log("No similar message was found in private queue either.");
    console.log("New private message found. Inserting into queue.");
    newPrivateMessagesCount += 1;
    const response = await privateQueueDB.create(privateMessage);
    console.log("New private message inserted into the queue.");
  });

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
  const query = {
    author: "یونیف",
  };
  console.log("Handling Welcome Message");
  const isWelcomeInQueue = await existsInDB(publicSentDB, query);
  const isWelcomeInSent = await existsInDB(publicQueueDB, query);
  if (!isWelcomeInQueue && !isWelcomeInSent) {
    console.log("No welcome message found. Creating one...");
    const text = constructWelcomeText(
      publicMessagesCount,
      privateMessagesCount
    );
    const welcomeMessage: PublicMessage = {
      groupName: "unif",
      author: "یونیف",
      sentAt: "یک روز زیبا و خنک",
      createdAt: new Date(),
      header: "پیام خوش آمدگویی",
      text: text,
      hasAttachment: false,
      isAttachmentLarge: false,
      isAttachmentStored: false,
      isAttachmentSent: false,
      attachmentDownloadErrorCount: 0,
      attachmentUploadErrorCount: 0,
      isExercise: false,
      isExerciseFinished: false,
    };
    console.log("Inserting welcome message to the queue.");
    await putToDB(publicQueueDB, welcomeMessage);
  }
}
