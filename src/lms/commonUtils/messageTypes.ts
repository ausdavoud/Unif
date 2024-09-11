export type PublicMessage = {
  _id?: string;
  groupName: string;
  author: string;
  header?: string;
  text: string;
  footer?: string;
  sentAt: string;
  hasAttachment: boolean;
  isAttachmentLarge: boolean;
  isAttachmentStored: boolean;
  isAttachmentSent: boolean;
  attachmentStorageErrorCount: number;
  attachmentName?: string;
  attachmentLink?: string;
  isExercise: boolean;
  exerciseName?: string;
  exerciseStart?: string;
  exerciseDeadline?: string;
  isExerciseFinished: boolean;
  createdAt: Date;
};

export type PrivateMessage = {
  author: string;
  sentAt: string;
  title: string;
  link: string;
  createdAt: Date;
};
