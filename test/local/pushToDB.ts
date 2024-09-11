import { publicQueueDB } from "../../src/db/mongodb/connect";
import { ObjectType } from "deta/dist/types/types/basic";
import { getCookie, isCookieValid } from "../../src/lms/commonUtils/cookie";
import {
  createMessageBody,
  findFeedMessages,
} from "../../src/lms/PublicMessage/messageParser";
import { getGroupCodes } from "../../src/lms/PublicMessage/groupCodeScraper";
import { getGroupPageContent } from "../../src/lms/commonUtils/urlClient";

export function testPushMessage() {
  const username = process.env.LMS_USERNAME || "";
  const password = process.env.LMS_PASSWORD || "";
  console.log("username", username);
  console.log("password", password);
  return getCookie(username, password)
    .then((cookie) => {
      if (!isCookieValid(cookie)) throw new Error();
      return cookie;
    })
    .then((cookie) => {
      return getGroupCodes(cookie).then((groupNames) => [groupNames, cookie]);
      // cuz we need cookie for the next .then
    })
    .then(([groupNames, cookie]) => {
      return getGroupPageContent(groupNames[0], cookie);
    })
    .then(findFeedMessages)
    .then((feedElements) => {
      const messages: object[] = [];
      feedElements.forEach((feedElement) => {
        messages.push(createMessageBody(feedElement, "code for lesson"));
      });
      return messages as ObjectType[];
    })
    .then((messages) => {
      return publicQueueDB.insertMany(messages);
    })
    .then((res) => {
      console.log("Objects were put successfully,");
      return res;
    })
    .catch((err) => {
      console.error("Error in sending objects to the deta base: queueDB.");
      throw err;
    });
}
// testUpdateDeta()
