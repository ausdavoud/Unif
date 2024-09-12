import { PublicMessage } from "./messageTypes";

const nameSplitter = "@@@";

function sortByDate(messageList: PublicMessage[]) {
  messageList.sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export function getLatestByDate(messageList: PublicMessage[]) {
  sortByDate(messageList);
  return messageList[0];
}

export function constructAttachmentNameForDBStorage(
  attachmentName: string,
  attachmentLink: string
) {
  // name will be like Homework4.docx@@@363e9083_32.docx
  const fileName = `${attachmentName}${nameSplitter}${attachmentLink
    .split("/")
    .pop()}`;
  return fileName;
}

export function extractNameFromFullDBName(fullAttachmentName: string) {
  return fullAttachmentName.split(nameSplitter).at(0);
}


export function constructWelcomeText(publicMessagesCount: number, privateMessagesCount: number) {
  let text = "";
  if (publicMessagesCount === 0 && privateMessagesCount === 0) {
    text =
      "ربات فعال شد ولی فعلا در LMS خبری نیست! به محض دریافت اولین پیام، مطلع خواهید شد.";
  } else if (publicMessagesCount === 0 && privateMessagesCount !== 0) {
    text =
      "ربات فعال و " +
      `${privateMessagesCount} پیام در صندوق شخصی یافت شد` +
      "ولی فعال در آبشار خبری نیست. به محض دریافت پیام‌های بعدی مطلع خواهید شد.";
  } else if (publicMessagesCount !== 0 && privateMessagesCount === 0) {
    text =
      "ربات فعال و " +
      `${publicMessagesCount} پیام در آبشار شناسایی شدند. به محض دریافت پیام‌های بعدی مطلع خواهید شد.`;
  } else {
    text =
      `${publicMessagesCount} پیام در آبشار و ${privateMessagesCount} پیام در صندوق شخصی شناسایی شدند.` +
      "به محض دریافت پیام‌های بعدی مطلع خواهید شد.";
  }

  return text
}