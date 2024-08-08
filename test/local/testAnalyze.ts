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
    messagesAreDifferent,
} from "../../src/lms/messageAnalyze";
import { getLatestByDate } from "../../src/lms/utils";
import { fetchByAuthorText } from "../../src/db/tools";

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
                throw new Error("No message in feed.");
            }
            return newMessagesInFeed[0];
        })
        .then((newMessageInFeed) =>
            fetchByAuthorText(newMessageInFeed as unknown as Message)
        )
        .then((newAndOldMessages) => {
            const [newMessageInFeed, oldMessagesInDB] = newAndOldMessages;
            // Possible cause of error:
            const items = oldMessagesInDB.items as ObjectType[];
            const lastMessageInDB = getLatestByDate(items);

            // Possible cause of error
            const newMessageInFeedCasted =
                newMessageInFeed as unknown as Message;
            const lastMessageInDBCasted = lastMessageInDB as unknown as Message;
            if (
                messagesAreDifferent(
                    newMessageInFeedCasted,
                    lastMessageInDBCasted
                )
            ) {
                addMessageHeaderFooter(
                    newMessageInFeedCasted,
                    lastMessageInDBCasted
                );
                return newMessageInFeedCasted;
            }
            throw new Error("New message was the same as old message in db.");
        })
        .then((newMessage) => queueDB.put(newMessage as unknown as ObjectType))
        .then(console.log)
        .catch(console.log);
}

// testAnalyzeMessages()
