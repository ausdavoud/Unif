import { InlineKeyboard } from "grammy";
import { PrivateMessage, PublicMessage } from "../lms/commonUtils/messageTypes";

export function publicMessageToHTML(message: PublicMessage) {
  const author = `👤  ${message.author}`;
  const header = message.header ? `\n\n▫️<b>${message.header}</b>` : "";
  const text = `\n\n✍🏻  ${message.text}`;
  const footer = message.footer
    ? `\n\nتغییرات جزئی: \n${message.footer.join("\n- ")}`
    : "";
  let exerciseDescription = "";
  if (message.isExercise) {
    exerciseDescription =
      `\n\nنام تمرین: ${message.exerciseName}\n` +
      `زمان شروع: ${message.exerciseStart}\n` +
      `مهلت ارسال: ${message.exerciseDeadline}` +
      message.isExerciseFinished
        ? `(پایان یافته) `
        : "";
  }
  let attachmentDescription = "";
  if (message.hasAttachment) {
    attachmentDescription = `\n\nفایل: <a href="${message.attachmentLink}">${message.attachmentName}</a>`;
  }
  const date = `\n\n🕑  ${message.sentAt}`;
  const whiteSpace = "‌";

  const messageHTML =
    `${author}` +
    `${header}` +
    `${text}` +
    `${footer}` +
    `${exerciseDescription}` +
    `${attachmentDescription}` +
    `${date}` +
    `\n${whiteSpace}`;

  return messageHTML;
}

export function privateMessageToHTML(message: PrivateMessage) {
  const text = `📬  پیام شخصی از <b>${message.author}</b>`;
  const date = `🕑  ${message.sentAt}`;
  const whiteSpace = "‌";

  const messageHTML = `${text}` + `\n\n${date}` + `\n${whiteSpace}`;
  return messageHTML;
}

export function createLinkButton(text: string, url: string) {
  const keyboard = new InlineKeyboard().url(text, url);
  return keyboard;
}
