import { ObjectId } from "mongoose";

export type PublicMessage = {
  _id?: ObjectId;
  groupName: string;
  author: string;
  header?: string;
  text: string;
  footer?: string[];
  sentAt: string;
  hasAttachment: boolean;
  isAttachmentLarge: boolean;
  isAttachmentStored: boolean;
  isAttachmentSent: boolean;
  attachmentDownloadErrorCount: number;
  attachmentUploadErrorCount: number;
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
  _id?: ObjectId;
  author: string;
  sentAt: string;
  header: string;
  title: string;
  link: string;
  createdAt: Date;
};
