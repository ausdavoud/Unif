import { Bot, InputFile } from "grammy";
import {
  fetchByQuery,
  getFileByName,
  moveQueueToSent,
  setIsSentToTrue,
} from "../db/dbService";
import {
  privateQueueDB,
  privateSentDB,
  publicQueueDB,
  publicSentDB,
} from "../db/mongodb/connect";
import {
  constructAttachmentNameForDBStorage,
  extractNameFromFullDBName,
} from "../lms/commonUtils/helpers";
import { PrivateMessage, PublicMessage } from "../lms/commonUtils/messageTypes";
import {
  createLinkButton,
  privateMessageToHTML,
  publicMessageToHTML,
} from "./messageFormatters";
import { MyContext } from "./telegram";
import env from "../env";

export async function publicMessageSender(
  publicQueueMessages: PublicMessage[],
  bot: Bot<MyContext>,
  chatIDs: number[]
) {
  chatIDs.forEach(async (chatId) => {
    let isSent = false;
    publicQueueMessages.forEach(async (message) => {
      const text = publicMessageToHTML(message);
      if (message.hasAttachment) {
        if (message.isAttachmentStored) {
          //send message with attachment and move to sent
          const fileNameInDB = constructAttachmentNameForDBStorage(
            message.attachmentName!,
            message.attachmentLink!
          );
          const { data, err } = await getFileByName(fileNameInDB);
          if (!data) {
            console.log(err);
            return;
          }
          const name = extractNameFromFullDBName(data.name!);
          await bot.api.sendDocument(chatId, new InputFile(data.data!, name), {
            caption: text,
            parse_mode: "HTML",
          });
          isSent = true;
        } else if (
          message.isAttachmentLarge ||
          message.attachmentDownloadErrorCount >= env.MAX_DOWNLOAD_TRY ||
          message.attachmentUploadErrorCount >= env.MAX_UPLOAD_TRY
        ) {
          // send message without attachment
          await bot.api.sendMessage(chatId, text, {
            parse_mode: "HTML",
          });
          isSent = true;
        }
        return;
      } else {
        await bot.api.sendMessage(chatId, text, {
          parse_mode: "HTML",
        });
        isSent = true;
      }
      // We don't care if it's sent to other chats or not! :D
      if (isSent) {
        await setIsSentToTrue(message._id!);
      }
    });
  });
}

export async function privateMessageSender(
  privateQueueMessages: PrivateMessage[],
  bot: Bot<MyContext>,
  chatIDs: number[]
) {
  chatIDs.forEach(async (chatId) => {
    privateQueueMessages.forEach(async (message) => {
      const text = privateMessageToHTML(message);
      const keyboard = createLinkButton("مشاهده پیام در LMS", message.link);
      await bot.api.sendMessage(chatId, text, {
        parse_mode: "HTML",
        reply_markup: keyboard,
      });
    });
  });
}

export async function welcomeMessageSender(
  welcomeMessage: PublicMessage,
  bot: Bot<MyContext>,
  chatIDs: number[]
) {
  chatIDs.forEach(async (chatId) => {
    await bot.api.sendMessage(chatId, publicMessageToHTML(welcomeMessage), {
      parse_mode: "HTML",
    });
  });
}
