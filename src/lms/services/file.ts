import {
  incrementErrorCount,
  setIsStoredToTrue,
  storeFile,
} from "../../db/dbService";
import { publicQueueDB } from "../../db/mongodb/connect";
import { getFileBuffer } from "../commonUtils/fileClient";
import { constructAttachmentNameForDBStorage } from "../commonUtils/helpers";

export async function uploadFiles(idNameLinkTuples: any[], cookie: string) {
  let fileCount = 1;
  console.log(`idNameLinkTuples is ${idNameLinkTuples.length} long.`);
  idNameLinkTuples.forEach(async (message) => {
    const { _id, attachmentName, attachmentLink } = message;
    try {
      console.log(`Getting [${fileCount}] file buffer of ${attachmentName}`);
      const attachmentBuffer = await getFileBuffer(attachmentLink, cookie);
      const attachmentNameInDB = constructAttachmentNameForDBStorage(
        attachmentName,
        attachmentLink
      );
      const uploadResult = await storeFile(
        attachmentBuffer,
        attachmentNameInDB
      );
      await setIsStoredToTrue(message._id);
    } catch (error) {
      await incrementErrorCount(_id);
    }

    fileCount += 1;
  });
}
