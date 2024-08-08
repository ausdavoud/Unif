import { FetchResponse } from "deta/dist/types/types/base/response";
import { Message } from "../lms/messageInterface";
import { queueDB } from "./connect";

export function fetchByAuthorText(newMessageInFeed: Message) {
    const { author, text } = newMessageInFeed
    const oldAndNewMessages: Promise<[Message, FetchResponse]>  = queueDB.fetch({ author: author, text: text })
        .then(oldMessagesInDB => {
            if (oldMessagesInDB.count == 0) {
                throw new Error("No message in DB.")
            }
            return [newMessageInFeed, oldMessagesInDB]
        })
    
    return oldAndNewMessages
}