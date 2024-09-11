import { PublicMessage } from "../lms/commonUtils/messageTypes";
import { Model } from "mongoose";

export async function fetchByAuthorText(
  dbSession: typeof Model,
  newMessageInFeed: PublicMessage
) {
  const { author, text } = newMessageInFeed;
  const oldMessagesInDB = await dbSession.find({
    author: author,
    text: text,
  });

  return oldMessagesInDB;
}

export async function putToDB(dbSession: typeof Model, data: any) {
  const insertResult = await dbSession.create(data);
  return insertResult;
}

export async function fetchMessagesWithNonStoredAttachment(
  dbSession: typeof Model
) {
  const maxTry = process.env.MAX_TRY || 3;
  const idNameLinkPairs = await dbSession
    .find({
      hasAttachment: true,
      isAttachmentStored: false,
      isAttachmentLarge: false,
      attachmentStorageErrorCount: { $lt: +maxTry },
    })
    .select("id attachmentName attachmentLink");

  return idNameLinkPairs;
}

export async function storeFile(
  dbSession: typeof Model,
  buffer: Buffer,
  name: string
) {
  const storageResult = await dbSession.create({ name: name, data: buffer });
  return storageResult;
}

export async function incrementErrorCount(dbSession: typeof Model, id: any) {
  return await dbSession.findByIdAndUpdate(id, {
    $inc: { attachmentStorageErrorCount: 1 },
  });
}
