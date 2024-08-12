import { FetchResponse } from "deta/dist/types/types/base/response";
import { Message } from "../lms/messageInterface";
import { queueDB } from "./connect";
import Base from "deta/dist/types/base";

export async function fetchByAuthorText(
    newMessageInFeed: Message
): Promise<FetchResponse> {
    const { author, text } = newMessageInFeed;
    const oldMessagesInDB = await queueDB.fetch({ author: author, text: text });

    return oldMessagesInDB;
}

export async function putToDB(dbSession: Base, data: any) {
    const insertResult = await dbSession.put(data);
    return insertResult;
}
