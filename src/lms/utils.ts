import { Message } from "./messageInterface";

function sortByDate(messageList: Message[]) {
    messageList.sort((a, b) => {
        return (
            new Date(b.dateUpdated as string).getTime() -
            new Date(a.dateUpdated as string).getTime()
        );
    });
}

export function getLatestByDate(messageList: Message[]) {
    sortByDate(messageList);
    return messageList[0];
}
