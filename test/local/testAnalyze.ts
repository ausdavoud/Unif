import { queueDB } from "../../src/db/connect";
import { getCookie, isCookieValid } from "../../src/lms/cookie";
import { getGroupNames } from "../../src/lms/groupName";
import { ArrayType, ObjectType } from "deta/dist/types/types/basic";
import { getGroupPageContent } from "../../src/lms/requests";
import {
    findFeedMessages,
    createMessageBody,
} from "../../src/lms/groupMessage";
import { Message } from "../../src/lms/messageInterface";
import {
    addMessageHeaderFooter,
    isNewMessageChanged,
} from "../../src/lms/messageAnalyze";
import { sortByDate} from "../../src/lms/utils";

export function testAnalyzeMessages() {
    const username = process.env.lmsUsername || "";
    const password = process.env.lmsPassword || "";
    console.log("username", username);
    console.log("password", password);
    return getCookie(username, password)
        .then((cookie) => {
            if (!isCookieValid(cookie)) throw new Error();
            return cookie;
        })
        .then((cookie) => {
            return getGroupNames(cookie).then((groupNames) => [
                groupNames,
                cookie,
            ]);
            // cuz we need cookie for the next .then
        })
        .then(([groupNames, cookie]) => {
            return getGroupPageContent(groupNames[0], cookie);
        })
        .then(findFeedMessages)
        .then((feedElements) => {
            const newMessagesInFeed: object[] = [];
            feedElements.forEach((feedElement) => {
                newMessagesInFeed.push(createMessageBody(feedElement));
            });
            return newMessagesInFeed as ObjectType[];
        })
        .then((newMessagesInFeed) => {
            if (newMessagesInFeed.length == 0) {
                throw new Error('No message in feed.')
            }
            return newMessagesInFeed[0];
        })
        .then((newMessageInFeed) => {
            const { author, text } = newMessageInFeed;
            const oldAndNewMessages = queueDB
                .fetch({ author: author, text: text })
                .then((oldMessagesInDB) => {
                    if (oldMessagesInDB.count == 0)
                        throw new Error("Message not found in Detabase!");
                    return [newMessageInFeed, oldMessagesInDB]
                });
            return oldAndNewMessages;
        })
        .then(([newMessageInFeed, oldMessagesInDB]) => {
            // Possible cause of error:
            const items = oldMessagesInDB.items as ObjectType[];
            sortByDate(items)
            const lastMessageInDB = items[0];

            // Possible cause of error
            const newMessageInFeedCasted = newMessageInFeed as unknown as Message;
            const lastMessageInDBCasted = lastMessageInDB as unknown as Message;
            if (isNewMessageChanged(newMessageInFeedCasted, lastMessageInDBCasted)) {
                addMessageHeaderFooter(newMessageInFeedCasted, lastMessageInDBCasted);
                return newMessageInFeedCasted
            }
            throw new Error("New message was the same as old message in db.")
        })
        .then(newMessage => queueDB.put(newMessage as unknown as ObjectType))
        .then(console.log)
        .catch(console.log);
}

// testAnalyzeMessages()
