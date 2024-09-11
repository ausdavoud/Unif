import { publicQueueDB } from "../../src/db/mongodb/connect";
import {
  fetchMessagesWithNonStoredAttachment,
  incrementErrorCount,
} from "../../src/db/dbService";
import { getCookie, isCookieValid } from "../../src/lms/commonUtils/cookie";
import { getFileBuffer } from "../../src/lms/commonUtils/fileClient";
import { storeFile } from "../../src/db/dbService";
import { fileDB } from "../../src/db/mongodb/connect";
import { constructAttachmentNameForDBStorage } from "../../src/lms/commonUtils/helpers";

export async function testDownloadStoreFile() {
  const username = process.env.LMS_USERNAME || "";
  const password = process.env.LMS_PASSWORD || "";
  console.log("username", username);
  console.log("password", password);

  const cookie = await getCookie(username, password);
  if (!isCookieValid(cookie)) {
    throw new Error("Cookie is not valid.");
  }
  const idNameLinkTuples = await fetchMessagesWithNonStoredAttachment(
    publicQueueDB
  );

  idNameLinkTuples.slice(1, 2).forEach(async (message) => {
    const { _id, attachmentName, attachmentLink } = message;
    try {
      const fullAttachmentLink = `http://lms.ui.ac.ir${attachmentLink}`;
      const attachmentBuffer = await getFileBuffer(fullAttachmentLink, cookie);
      const fullAttachmentName = constructAttachmentNameForDBStorage(
        attachmentName,
        attachmentLink
      );
      const uploadResult = await storeFile(
        fileDB,
        attachmentBuffer,
        fullAttachmentName
      );
    } catch (error) {
      await incrementErrorCount(publicQueueDB, _id);
    }
  });
}

testDownloadStoreFile();
