import { publicQueueDB } from "../../src/db/mongodb/connect";
import {
  getQueuedAttachments,
  incrementErrorCount,
} from "../../src/db/dbService";
import {
  getFreshCookie,
  isCookieValid,
} from "../../src/lms/commonUtils/cookie";
import { getFileBuffer } from "../../src/lms/commonUtils/fileClient";
import { storeFile } from "../../src/db/dbService";
import { fileDB } from "../../src/db/mongodb/connect";
import { constructAttachmentNameForDBStorage } from "../../src/lms/commonUtils/helpers";
import env from "../../src/env";
import { PublicMessage } from "../../src/lms/commonUtils/messageTypes";

export async function testDownloadStoreFile() {
  const username = env.LMS_USERNAME;
  const password = env.LMS_PASSWORD;
  console.log("username", username);
  console.log("password", password);

  const cookie = await getFreshCookie(username, password);
  if (!isCookieValid(cookie)) {
    throw new Error("Cookie is not valid.");
  }
  const idNameLinkTuples = await getQueuedAttachments();

  idNameLinkTuples.slice(1, 2).forEach(async (message) => {
    const { _id, attachmentName, attachmentLink } = message;
    try {
      const attachmentBuffer = await getFileBuffer(attachmentLink!, cookie);
      const attachmentNameInDB = constructAttachmentNameForDBStorage(
        attachmentName!,
        attachmentLink!
      );
      const uploadResult = await storeFile(
        attachmentBuffer,
        attachmentNameInDB
      );
    } catch (error) {
      await incrementErrorCount(_id);
    }
  });
}

testDownloadStoreFile();
