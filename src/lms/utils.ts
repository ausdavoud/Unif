import { ObjectType } from "deta/dist/types/types/basic";

export function sortByDate(messageList: ObjectType[]) {
    messageList.sort((a, b) => {
        return (
            new Date(b.dateUpdated as string).getTime() -
            new Date(a.dateUpdated as string).getTime()
        );
    });
}