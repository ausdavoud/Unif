import fs from "fs";
import { createMessageBody } from "../../src/lms/PublicMessage/messageParser";
import { findFeedMessages } from "../../src/lms/PublicMessage/messageParser";
import {
  getFreshCookie,
  isCookieValid,
} from "../../src/lms/commonUtils/cookie";
import { getGroupCodes } from "../../src/lms/PublicMessage/groupCodeScraper";
import { getGroupPageContent } from "../../src/lms/commonUtils/urlClient";
import env from "../../src/env";

export function testLocalHTML() {
  const sampleHTML = fs.readFileSync("./src/lms/exampleGroupFeed.txt", {
    encoding: "utf-8",
  });
  const feedElements = findFeedMessages(sampleHTML);
  const msgBody = createMessageBody(feedElements[2], "code for mohasebat elmi");
}

export function testFindFeedMessages() {
  const username = env.LMS_USERNAME;
  const password = env.LMS_PASSWORD;
  console.log("username", username);
  console.log("password", password);
  return (
    getFreshCookie(username, password)
      .then((cookie) => {
        if (!isCookieValid(cookie)) throw new Error();
        return cookie;
      })
      .then((cookie) => {
        return getGroupCodes(cookie).then((groupNames) => [groupNames, cookie]);
        // cuz we need cookie for the next .then
      })
      // .then(([groupNames, cookie]) =>  getGroupFeed(groupNames[0], cookie))
      .then(([groupNames, cookie]) =>
        getGroupPageContent(groupNames[0], cookie)
      )
      .then(findFeedMessages)
      .catch((err) => {
        console.error("There was an error in extracting Group feed", err);
        err.handled = true;
        throw err;
      })
      .then((feedElements) => {
        return createMessageBody(feedElements[0], "lesson code here...");
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
