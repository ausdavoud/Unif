import env from "../../src/env";
import {
  getFreshCookie,
  isCookieValid,
} from "../../src/lms/commonUtils/cookie";

function testLogin() {
  const username = env.LMS_USERNAME;
  const password = env.LMS_PASSWORD;
  console.log("username", username);
  console.log("password", password);
  const cookie = getFreshCookie(username, password)
    .then(isCookieValid)
    .then(console.log)
    .catch(console.log);
}
// testLogin()
