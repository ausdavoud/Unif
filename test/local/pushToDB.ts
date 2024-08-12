import { queueDB } from "../../src/db/connect";
import { ObjectType } from "deta/dist/types/types/basic";
import { getCookie, isCookieValid } from "../../src/lms/cookie";
import {
    createMessageBody,
    findFeedMessages,
} from "../../src/lms/groupMessage";
import { getGroupNames } from "../../src/lms/groupName";
import { getGroupPageContent } from "../../src/lms/requests";

export function testPushMessage() {
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
                messages.push(
                    createMessageBody(feedElement, "code for lesson")
                );
            });
            return messages as ObjectType[];
        })
        .then((messages) => {
            return queueDB.putMany(messages);
        })
        .then((res) => {
            console.log("Objects were put successfully,");
            return res.processed.items;
        })
        .catch((err) => {
            console.error(
                "Error in sending objects to the deta base: queueDB."
            );
            throw err;
        });
}
// testUpdateDeta()
