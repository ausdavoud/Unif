import { FilterQuery, Model, ObjectId } from "mongoose";
import env from "../env";
import { PrivateMessage, PublicMessage } from "../lms/commonUtils/messageTypes";
import { chatIdDB, cookieDB, fileDB, publicQueueDB } from "./mongodb/connect";

export async function existsInDB<T>(
  dbSession: Model<T>,
  query: FilterQuery<T>
) {
  const exists = await dbSession.exists(query);
  return !!exists;
}

export async function fetchByQuery<T>(
  dbSession: Model<T>,
  query: FilterQuery<T>
): Promise<T[]> {
  try {
    const oldMessagesInDB = await dbSession.find(query);
    return oldMessagesInDB;
  } catch (e) {
    return [];
  }
}

export async function putToDB<T>(dbSession: Model<T>, data: T) {
  const insertResult = await dbSession.create(data);
  return insertResult;
}

export async function getQueuedAttachments() {
  const idNameLinkPairs = await publicQueueDB
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

export async function storeFile(buffer: Buffer, name: string) {
  const storageResult = await fileDB.create({ name: name, data: buffer });
  return storageResult;
}

export async function incrementErrorCount(id: ObjectId) {
  return await publicQueueDB.findByIdAndUpdate(id, {
    $inc: { attachmentDownloadErrorCount: 1 },
  });
}

export async function getLatestCookie() {
  const cookie = await cookieDB.findOne({});
  return cookie ? cookie.cookie! : "";
}

export async function insertNewCookie(cookie: string) {
  return await cookieDB.create({ cookie: cookie, updatedAt: new Date() });
}

export async function updateCookie(cookie: string) {
  return await cookieDB.findOneAndReplace(
    {},
    { cookie: cookie, updatedAt: new Date() }
  );
}

export async function getFileByName(fileName: string) {
  const file = await fileDB.findOne({ name: fileName });
  if (!file || !(file instanceof fileDB)) {
    console.log(file);
    return { err: `File named ${fileName} does not exists.` };
  }
  return { data: file };
}

export async function setIsStoredToTrue(_id: ObjectId) {
  return await publicQueueDB.findByIdAndUpdate(_id, {
    isAttachmentStored: true,
  });
}

export async function setIsSentToTrue(_id: ObjectId) {
  return await fileDB.findByIdAndUpdate(_id, {
    isAttachmentSent: true,
  });
}

export async function getChatIDs() {
  const chatIdObjects = await chatIdDB.find({});
  const chatIDs = chatIdObjects.map((obj) => {
    return obj.chatId || 0;
  });
  return chatIDs;
}

export async function setChatID(chatId: number, name?: string) {
  return await chatIdDB.create({
    chatId: chatId,
    name: name,
  });
}

export async function unsetChatId(chatId: number) {
  return await chatIdDB.findOneAndDelete({
    chatId: chatId,
  });
}

export async function moveQueueToSent<T>(
  queueDbSession: Model<T>,
  sentDbSession: Model<T>,
  messages: PublicMessage[] | PrivateMessage[]
) {
  console.log(`moving ${messages.length} message to archive`);
  messages.forEach(async (message) => {
    await queueDbSession.findByIdAndDelete(message._id);
    //@ts-ignore
    const { _id, ...rest } = message._doc;
    await sentDbSession.create(rest);
  });
}

export async function isWelcomeMessageQueued() {
  return await publicQueueDB.exists({ author: "یونیف" });
}
