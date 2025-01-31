import mongoose from "mongoose";
import env from "../../env";
import {
  PrivateMessage,
  PublicMessage,
} from "../../lms/commonUtils/messageTypes";

const { Schema, model } = mongoose;

// Message Schema
export const publicQueueMessageSchema = new Schema<PublicMessage>({
  groupName: { type: String, required: true },
  author: { type: String, required: true },
  header: { type: String },
  text: { type: String, required: true },
  footer: { type: [String] },
  sentAt: { type: String, required: true },
  hasAttachment: { type: Boolean, required: true },
  isAttachmentLarge: { type: Boolean, required: true },
  isAttachmentStored: { type: Boolean, required: true },
  isAttachmentSent: { type: Boolean, required: true },
  attachmentDownloadErrorCount: { type: Number, required: true },
  attachmentUploadErrorCount: { type: Number, required: true },
  attachmentName: { type: String },
  attachmentLink: { type: String },
  isExercise: { type: Boolean, required: true },
  exerciseName: { type: String },
  exerciseStart: { type: String },
  exerciseDeadline: { type: String },
  isExerciseFinished: { type: Boolean, required: true },
  createdAt: { type: Date, required: true },
});

export const privateMessageSchema = new Schema<PrivateMessage>({
  author: { type: String, required: true },
  sentAt: { type: String, required: true },
  title: { type: String, required: true },
  header: { type: String },
  link: { type: String, required: true },
  createdAt: { type: Date, required: true },
});

// Message models
export const publicQueueDB = model<PublicMessage>(
  "PublicQueueMessage",
  publicQueueMessageSchema
);

export const publicSentDB = model<PublicMessage>(
  "PublicSentMessage",
  publicQueueMessageSchema
);

export const privateQueueDB = model<PrivateMessage>(
  "PrivateQueueMessage",
  privateMessageSchema
);

export const privateSentDB = model<PrivateMessage>(
  "PrivateSentMessage",
  privateMessageSchema
);

const cookieSchema = new Schema({ cookie: String, updatedAt: Date });
export const cookieDB = model("cookie", cookieSchema);

const fileSchema = new Schema({ name: String, data: Buffer });
export const fileDB = model("File", fileSchema);

const chatIdSchema = new Schema({
  name: String,
  chatId: { type: Number, required: true },
});
export const chatIdDB = model("chatId", chatIdSchema);

// DB connection
const dbName = "unif";
mongoose.connect(env.MONGODB_URI, { dbName: dbName });
