import { queueDB } from "../../src/db/connect";
import { getCookie, isCookieValid } from "../../src/lms/cookie";
import { getGroupNames } from "../../src/lms/groupName";
import { ArrayType, ObjectType } from "deta/dist/types/types/basic";
import { getGroupPageContent } from "../../src/lms/requests";
import {
    findFeedMessages,
    createMessageBody,
} from "../../src/lms/groupMessage";
import { Message } from "../../src/lms/messageInterface";
import {
    addMessageHeaderFooter,
    messagesAreDifferent,
} from "../../src/lms/messageAnalyze";
import { getLatestByDate } from "../../src/lms/utils";
import { fetchByAuthorText, putToDB } from "../../src/db/dbInterface";

export async function testAsyncAnalyze() {
    const username = process.env.lmsUsername || "";
    const password = process.env.lmsPassword || "";
    console.log("username", username);
    console.log("password", password);

    const cookie = await getCookie(username, password);
    if (!isCookieValid(cookie)) {
        throw new Error("Cookie is not valid.");
    }
    const groupNames = await getGroupNames(cookie);
    groupNames.forEach(async (groupName) => {
        const groupPageContent = await getGroupPageContent(groupName, cookie);
        const feedMessages = findFeedMessages(groupPageContent);
        if (feedMessages.length == 0) {
            console.log(`No old or new message in ${groupName}'s feed.`);
            return;
        }

        feedMessages.forEach(async (feedMessage) => {
            const newMessageInFeed = createMessageBody(feedMessage, groupName);
            const fetchedMessages = await fetchByAuthorText(newMessageInFeed);
            const oldMessagesInDB =
                fetchedMessages.items as unknown as Message[];
            const oldMessageInDB = getLatestByDate(oldMessagesInDB);
            if (!messagesAreDifferent(newMessageInFeed, oldMessageInDB)) {
                console.log(
                    "New message(lms) and old message(db) are the same."
                );
                return;
            }
            addMessageHeaderFooter(newMessageInFeed, oldMessageInDB);
            const putResult = await putToDB(queueDB, newMessageInFeed);
            const putMsg = putResult
                ? `Message with key ${putResult["key"]} from ${newMessageInFeed.author} was put in QueueDB.`
                : `Failed putting message from ${newMessageInFeed.author} to QueueDB.`;
            console.log(putMsg);
        });
    });
}

// testAsyncAnalyze()
