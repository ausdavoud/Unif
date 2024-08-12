import { ObjectType } from "deta/dist/types/types/basic";

export interface Message extends ObjectType {
    key?: string;
    groupName: string;
    author: string;
    header?: string;
    text: string;
    footer?: string;
    date: string;
    hasAttachment: boolean;
    isAttachmentLarge: boolean;
    isAttachmentStored: boolean;
    isAttachmentSent: boolean;
    attachmentStorageErrorCount: number;
    attachmentName: string;
    attachmentLink: string;
    isExercise: boolean;
    exerciseName: string;
    exerciseStart: string;
    exerciseDeadline: string;
    isExerciseFinished: boolean;
    dateUpdated: string;
}
