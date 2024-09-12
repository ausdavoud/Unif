import { incrementErrorCount, storeFile } from "../../db/dbService";
import { publicQueueDB } from "../../db/mongodb/connect";
import { getFileBuffer } from "../commonUtils/fileClient";
import { constructAttachmentNameForDBStorage } from "../commonUtils/helpers";

export async function uploadFiles(idNameLinkTuples: any[], cookie: string) {
  idNameLinkTuples.forEach(async (message) => {
    const { _id, attachmentName, attachmentLink } = message;
    try {
      const attachmentBuffer = await getFileBuffer(attachmentLink, cookie);
      const attachmentNameInDB = constructAttachmentNameForDBStorage(
        attachmentName,
        attachmentLink
      );
      const uploadResult = await storeFile(
        publicQueueDB,
        attachmentBuffer,
        attachmentNameInDB
      );
    } catch (error) {
      await incrementErrorCount(publicQueueDB, _id);
    }
  });
}
