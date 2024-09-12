import { PrivateMessage, PublicMessage } from "../lms/commonUtils/messageTypes";
import { Model } from "mongoose";
import env from "../env";

export async function welcomeMessageExists(dbSession: typeof Model) {
  return !!dbSession.exists({ author: "unif" });
}

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

export async function fetchByAuthorDate(
  dbSession: typeof Model,
  message: PrivateMessage
) {
  const { author, sentAt } = message;
  const oldMessageInDB = await dbSession.findOne({
    author: author,
    sentAt: sentAt,
  });

  return oldMessageInDB;
}

export async function putToDB(dbSession: typeof Model, data: any) {
  const insertResult = await dbSession.create(data);
  return insertResult;
}

export async function fetchMessagesWithNonStoredAttachment(
  dbSession: typeof Model
) {
  const idNameLinkPairs = await dbSession
    .find({
      hasAttachment: true,
      isAttachmentStored: false,
      isAttachmentLarge: false,
      attachmentDownloadErrorCount: { $lt: +env.MAX_DOWNLOAD_TRY },
    })
    .sort("attachmentDownloadErrorCount")
    .select("_id attachmentName attachmentLink");

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
    $inc: { attachmentDownloadErrorCount: 1 },
  });
}

export async function getLatestCookie(dbSession: typeof Model) {
  const cookie = await dbSession.findOne({});
  return cookie;
}

export async function insertNewCookie(dbSession: typeof Model, cookie: string) {
  return await dbSession.create({ cookie: cookie, updatedAt: new Date() });
}

export async function updateCookie(dbSession: typeof Model, cookie: string) {
  return await dbSession.findOneAndReplace(
    {},
    { cookie: cookie, updateAt: new Date() }
  );
}
