import { cookieDB } from "./db/mongodb/connect";
import env from "./env";
import { handleCookieRetrieval } from "./lms/commonUtils/cookie";

import {
  handleWelcomeMessage,
  processPrivateMessages,
  processPublicMessages,
} from "./lms/PublicMessage/services";

async function lmsService() {
  const username = env.LMS_USERNAME;
  const password = env.LMS_PASSWORD;

  const cookie = await handleCookieRetrieval(cookieDB, username, password);

  const { publicMessagesCount } = await processPublicMessages(cookie);
  const { privateMessagesCount } = await processPrivateMessages(cookie);
  await handleWelcomeMessage(publicMessagesCount, privateMessagesCount);
}

async function fileService() {}
async function messengerService() {}

lmsService();
