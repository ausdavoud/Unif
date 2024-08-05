export interface Message {
    author: string;
    header: string;
    footer: string;
    text: string;
    date: string;
    hasAttachment: boolean;
    isAttachmentLarge: boolean;
    isAttachmentStored: boolean;
    isAttachmentSent: boolean;
    attachmentStorageErrorCount: number;
    attachmentName: boolean;
    attachmentLink: boolean;
    isExercise: boolean;
    exerciseName: string;
    exerciseStart: string;
    exerciseDeadline: string;
    isExerciseFinished: boolean;
    dateUpdated: string,
}