import { Bot } from "grammy";
import {
  fetchByQuery,
  getChatIDs,
  getQueuedAttachments,
  moveQueueToSent,
} from "./db/dbService";
import {
  cookieDB,
  privateQueueDB,
  privateSentDB,
  publicQueueDB,
  publicSentDB,
} from "./db/mongodb/connect";
import { handleCookieRetrieval } from "./lms/commonUtils/cookie";
import { uploadFiles } from "./lms/services/file";
import {
  handleWelcomeMessage,
  processPrivateMessages,
} from "./lms/services/privateMessage";

import { PrivateMessage, PublicMessage } from "./lms/commonUtils/messageTypes";
import { processPublicMessages } from "./lms/services/publicMessage";
import {
  privateMessageSender,
  publicMessageSender,
  welcomeMessageSender,
} from "./messanger/messageSenders";
import { MyContext } from "./messanger/telegram";

export async function lmsService() {
  const cookie = await handleCookieRetrieval(cookieDB);
  const { publicMessagesCount } = await processPublicMessages(cookie);
  const { privateMessagesCount } = await processPrivateMessages(cookie);
  await handleWelcomeMessage(publicMessagesCount, privateMessagesCount);
}

export async function fileService() {
  const cookie = await handleCookieRetrieval(cookieDB);
  const idNameLinkTuples = await getQueuedAttachments();
  console.log("fetched idNameLinkTuples");
  await uploadFiles(idNameLinkTuples, cookie);
}

export async function messengerService(bot: Bot<MyContext>) {
  console.log("START ---- Messenger Service");
  console.log("Fetching Chat Ids");
  const chatIDs = await getChatIDs();
  if (chatIDs.length === 0) {
    console.log("No Chat Ids Specified.");
    return;
  }

  console.log("Fetching Public Messages");
  const publicQueueMessages: PublicMessage[] = await fetchByQuery(
    publicQueueDB,
    {}
  );
  console.log(
    `fetched ${publicQueueMessages.length} new public queued messages`
  );

  console.log("Fetching Private Messages");
  const privateQueueMessages: PrivateMessage[] = await fetchByQuery(
    privateQueueDB,
    {}
  );
  console.log(
    `fetched ${privateQueueMessages.length} new private queued messages`
  );

  if (publicQueueMessages.length === 0 && privateQueueMessages.length === 0) {
    console.log("Finishing because no messages were in queue.");
    return;
  }

  let isWelcomeMessageQueued = false;
  if (publicQueueMessages.length !== 0) {
    const welcomeMessages = publicQueueMessages.filter(
      (msg) => msg.author === "یونیف"
    );
    isWelcomeMessageQueued = welcomeMessages.length !== 0;

    if (isWelcomeMessageQueued) {
      console.log("Welcome Message is queued");
      console.log("sending welcome message...");
      await welcomeMessageSender(welcomeMessages[0], bot, chatIDs);
    } else {
      console.log("No welcome message found.");
      console.log("Sending public messages.");
      await publicMessageSender(publicQueueMessages, bot, chatIDs);
    }
    console.log("moving public messages to sentDB");
    await moveQueueToSent(publicQueueDB, publicSentDB, publicQueueMessages);
  }
  if (privateQueueMessages.length !== 0) {
    console.log("sending private messages");
    if (!isWelcomeMessageQueued) {
      await privateMessageSender(privateQueueMessages, bot, chatIDs);
    }
    console.log("moving private messages to sentDB");
    await moveQueueToSent(privateQueueDB, privateSentDB, privateQueueMessages);
  }
}
