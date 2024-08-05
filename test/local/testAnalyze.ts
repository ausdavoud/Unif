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
            const messages: object[] = [];
            feedElements.forEach((feedElement) => {
                messages.push(createMessageBody(feedElement));
            });
            return messages as ObjectType[];
        })
        .then((messages) => {
            return messages[0];
        })
        .then((message) => {
            const { author, text } = message;
            const msg_db = queueDB
                .fetch({ author: author, text: text })
                .then((msg_db) => [msg_db, message]);
            return msg_db;
        })
        .then(([msg_db, message]) => {
            if (msg_db.count == 0)
                throw new Error("Message not found in Detabase!");
            // Possible cause of error:
            const items = msg_db.items as ObjectType[];
            items.sort((a, b) => {
                return (
                    new Date(b.dateUpdated as string).getTime() -
                    new Date(a.dateUpdated as string).getTime()
                );
            });
            const lastMessage = items[0];
            return [lastMessage, message];
        })
        .then(([lastMessage, message]) => {
            // Possible cause of error
            const lastMessageCasted = lastMessage as unknown as Message;
            const messageCasted = message as unknown as Message;
            if (!lastMessage || !message)
                throw new Error(
                    "Type casting of newMessage and OldMessage Failed."
                );
            if (isNewMessageChanged(lastMessageCasted, messageCasted)) {
                addMessageHeaderFooter(lastMessageCasted, messageCasted);
                return lastMessageCasted
            }
            throw new Error("New message was the same as old message in db")
        })
        .then(newMessage => queueDB.put(newMessage as unknown as ObjectType))
        .then(console.log)
        .catch(console.log);
}

// testAnalyzeMessages()
