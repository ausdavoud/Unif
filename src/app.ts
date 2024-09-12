import {
  getQueuedAttachments,
  incrementErrorCount,
  storeFile,
} from "./db/dbService";
import { cookieDB, publicQueueDB } from "./db/mongodb/connect";
import env from "./env";
import { handleCookieRetrieval } from "./lms/commonUtils/cookie";
import { getFileBuffer } from "./lms/commonUtils/fileClient";
import { constructAttachmentNameForDBStorage } from "./lms/commonUtils/helpers";
import { uploadFiles } from "./lms/services/files";
import {
  handleWelcomeMessage,
  processPrivateMessages,
} from "./lms/services/privateMessage";

import { processPublicMessages } from "./lms/services/publicMessages";

async function lmsService() {
  const cookie = await handleCookieRetrieval(cookieDB);
  const { publicMessagesCount } = await processPublicMessages(cookie);
  const { privateMessagesCount } = await processPrivateMessages(cookie);
  await handleWelcomeMessage(publicMessagesCount, privateMessagesCount);
}

async function fileService() {
  const cookie = await handleCookieRetrieval(cookieDB);
  const idNameLinkTuples = await getQueuedAttachments(publicQueueDB);
  await uploadFiles(idNameLinkTuples, cookie);
}

async function messengerService() {}
