import {
  fetchByAuthorDate,
  fetchByAuthorText,
  getLatestCookie,
  insertNewCookie,
  putToDB,
  updateCookie,
  welcomeMessageExists,
} from "./db/dbService";
import {
  cookieDB,
  privateQueueDB,
  privateSentDB,
  publicQueueDB,
  publicSentDB,
} from "./db/mongodb/connect";
import env from "./env";
import { getFreshCookie, isCookieValid } from "./lms/commonUtils/cookie";
import {
  constructWelcomeText,
  getLatestByDate,
} from "./lms/commonUtils/helpers";
import { PrivateMessage } from "./lms/commonUtils/messageTypes";
import { getGroupPageContent } from "./lms/commonUtils/urlClient";
import {
  extractInboxMessages,
  getPrivateInbox,
} from "./lms/PrivateMessage/messageParser";
import {
  addMessageHeaderFooter,
  hasMessageChanged,
} from "./lms/PublicMessage/changeHandler";
import { getGroupCodes } from "./lms/PublicMessage/groupCodeScraper";
import {
  createMessageBody,
  findFeedMessages,
} from "./lms/PublicMessage/messageParser";

async function publicMessageService() {
  const username = env.LMS_USERNAME;
  const password = env.LMS_PASSWORD;

  // Handling cookie
  let cookie = await getLatestCookie(cookieDB);
  if (!isCookieValid(cookie)) {
    console.log("Last cookie in database was not valid, refreshing cookie...");
    cookie = await getFreshCookie(username, password);
    if (!isCookieValid(cookie)) {
      throw new Error("New cookie was not valid either. Stopping process...");
    }
    console.log("Cookie was refreshed.");
    await updateCookie(cookieDB, cookie);
    console.log("Cookie was saved in database.");
  }

  // Getting group codes
  const groupNames = await getGroupCodes(cookie);
  // const groupNames = ["/group/100593"];
  let publicMessagesCount = 0;
  groupNames.forEach(async (groupName) => {
    const groupPageContent = await getGroupPageContent(groupName, cookie);
    const feedMessages = findFeedMessages(groupPageContent);
    if (feedMessages.length == 0) {
      console.log(`${groupName}'s feed is entirely empty.`);
      return;
    }
    publicMessagesCount += feedMessages.length;

    feedMessages.forEach(async (feedMessage) => {
      const newMessageInFeed = createMessageBody(feedMessage, groupName);
      const fetchedMessagesInSentDB = await fetchByAuthorText(
        publicQueueDB,
        newMessageInFeed
      );
      const fetchedMessagesInQueueDB = await fetchByAuthorText(
        publicQueueDB,
        newMessageInFeed
      );
      const fetchedMessages = fetchedMessagesInSentDB.concat(
        fetchedMessagesInQueueDB
      );
      const oldMessageInDB = getLatestByDate(fetchedMessages);
      if (!hasMessageChanged(newMessageInFeed, oldMessageInDB)) {
        console.log("New message(lms) and old message(db) are the same.");
        return;
      }
      addMessageHeaderFooter(newMessageInFeed, oldMessageInDB);
      const putResult = await putToDB(publicQueueDB, newMessageInFeed);
      const putMsg = putResult
        ? `Message with key ${putResult._id} from ${newMessageInFeed.author} was saved.`
        : `Failed saving message from ${newMessageInFeed.author} to QueueDB.`;
    });
  });

  const inboxPageContent = await getPrivateInbox(cookie);
  const privateMessages = extractInboxMessages(inboxPageContent);

  const privateMessagesCount = privateMessages.length;
  privateMessages.forEach(async (privateMessage) => {
    const fetchedMessagesInSentDB = await fetchByAuthorDate(
      privateSentDB,
      privateMessage
    );
    const fetchedMessagesInQueueDB = await fetchByAuthorDate(
      privateQueueDB,
      privateMessage
    );

    const fetchedMessages = fetchedMessagesInSentDB.concat(
      fetchedMessagesInQueueDB
    );

    if (fetchedMessages) {
      return;
    }

    const response = await privateQueueDB.create(privateMessage);
  });

  if (
    !welcomeMessageExists(privateSentDB) &&
    !welcomeMessageExists(privateQueueDB)
  ) {
    const text = constructWelcomeText(
      publicMessagesCount,
      privateMessagesCount
    );
    const welcomeMessage: PrivateMessage = {
      author: "یونیف",
      sentAt: "روز ازل",
      header: text,
      title: "پیام خوش‌آمد گویی",
      link: "dnosrati.com",
      createdAt: new Date(),
    };
    await privateQueueDB.create(welcomeMessage);
  }
}

async function fileDownloadService() {}
async function messengerService() {}
