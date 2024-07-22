import { getCookie } from "../../src/lms/cookie";
import { getGroupNames } from "../../src/lms/groupName";

async function testGetGroupNames() {
    const username = process.env.lmsUsername || "";
    const password = process.env.lmsPassword || "";
    const groupNames = getCookie(username, password)
        .then(getGroupNames)
        .then(console.log);
}
// testGetGroupNames()
