import env from "../../src/env";
import {
  getFreshCookie,
  isCookieValid,
} from "../../src/lms/commonUtils/cookie";
import {
  extractInboxMessages,
  getPrivateInbox,
} from "../../src/lms/PrivateMessage/messageParser";

export async function testPrivate() {
  const username = env.LMS_USERNAME;
  const password = env.LMS_PASSWORD;
  console.log("username", username);
  console.log("password", password);

  const cookie = await getFreshCookie(username, password);
  if (!isCookieValid(cookie)) {
    throw new Error("Cookie is not valid.");
  }
  const pageContent = await getPrivateInbox(cookie);
  const messages = extractInboxMessages(pageContent);
  console.log(messages);
}

testPrivate();
