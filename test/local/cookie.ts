import { getCookie, isCookieValid } from "../../src/lms/cookie";

function testLogin() {
    const username = process.env.lmsUsername || "";
    const password = process.env.lmsPassword || "";
    console.log("username", username);
    console.log("password", password);
    const cookie = getCookie(username, password)
        .then(isCookieValid)
        .then(console.log)
        .catch(console.log);
}
// testLogin()
