import env from "../../src/env";
import { getFreshCookie } from "../../src/lms/commonUtils/cookie";
import { getGroupCodes } from "../../src/lms/PublicMessage/groupCodeScraper";

async function testGetGroupNames() {
  const username = env.LMS_USERNAME;
  const password = env.LMS_PASSWORD;
  const groupNames = getFreshCookie(username, password)
    .then(getGroupCodes)
    .then(console.log);
}
// testGetGroupNames()
