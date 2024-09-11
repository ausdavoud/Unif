import { getCookie, isCookieValid } from "../../src/lms/commonUtils/cookie";

function testLogin() {
  const username = process.env.LMS_USERNAME || "";
  const password = process.env.LMS_PASSWORD || "";
  console.log("username", username);
  console.log("password", password);
  const cookie = getCookie(username, password)
    .then(isCookieValid)
    .then(console.log)
    .catch(console.log);
}
// testLogin()
