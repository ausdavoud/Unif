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
