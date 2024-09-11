import { getCookie } from "../../src/lms/commonUtils/cookie";
import { getGroupCodes } from "../../src/lms/PublicMessage/groupCodeScraper";

async function testGetGroupNames() {
  const username = process.env.LMS_USERNAME || "";
  const password = process.env.LMS_PASSWORD || "";
  const groupNames = getCookie(username, password)
    .then(getGroupCodes)
    .then(console.log);
}
// testGetGroupNames()
