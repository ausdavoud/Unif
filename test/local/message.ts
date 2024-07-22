import fs from "fs";
import { createMessageBody } from "../../src/lms/groupMessage";
import { findFeedMessages } from "../../src/lms/groupMessage";
import { getCookie, isCookieValid } from "../../src/lms/cookie";
import { getGroupNames } from "../../src/lms/groupName";
import { getGroupPageContent } from "../../src/lms/requests";

export function testLocalHTML() {
    const sampleHTML = fs.readFileSync("./src/lms/exampleGroupFeed.txt", {
        encoding: "utf-8",
    });
    const feedElements = findFeedMessages(sampleHTML);
    const msgBody = createMessageBody(feedElements[2]);
}

export function testFindFeedMessages() {
    const username = process.env.lmsUsername || "";
    const password = process.env.lmsPassword || "";
    console.log("username", username);
    console.log("password", password);
    return (
        getCookie(username, password)
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
            // .then(([groupNames, cookie]) =>  getGroupFeed(groupNames[0], cookie))
            .then(([groupNames, cookie]) =>
                getGroupPageContent(groupNames[0], cookie)
            )
            .then(findFeedMessages)
            .catch((err) => {
                console.error(
                    "There was an error in extracting Group feed",
                    err
                );
                err.handled = true;
                throw err;
            })
            .then((feedElements) => {
                return createMessageBody(feedElements[0]);
            })
            .catch((err) => {
                if (err.handled) return;
                console.error(
                    "An error occurred during finding feed message of a group."
                );
                throw err;
            })
    );
}
// testFindFeedMessages()
