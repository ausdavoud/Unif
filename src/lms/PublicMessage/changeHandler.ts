import { PublicMessage } from "../commonUtils/messageTypes";
import {
  onIsExercise,
  onIsExerciseFinished,
  onExerciseDeadline,
  onHasAttachment,
  onAttachmentLinkAndText,
  onAttachmentLink,
  onAttachmentName,
  onExerciseName,
  onExerciseStart,
} from "./microChangeHandlers";

export function addMessageHeaderFooter(
  newMessage: PublicMessage,
  oldMessage: PublicMessage
) {
  if (!oldMessage) {
    newMessage.header = `پیام جدید از ${newMessage.author}`;
    return;
  }
  const {
    isExerciseChanged,
    isExerciseFinishedChanged,
    isExerciseDeadlineChanged,
    isHasAttachmentChanged,
    isAttachmentLinkChanged,
    isAttachmentNameChanged,
    isExerciseNameChanged,
    isExerciseStartChanged,
  } = isXChanged(oldMessage, newMessage);

  let hasMajorChange = false;
  const minorChanges: string[] = [];

  if (isExerciseChanged) {
    onIsExercise(newMessage, oldMessage);
    hasMajorChange = true;
    return undefined;
  }
  if (isExerciseFinishedChanged) {
    onIsExerciseFinished(newMessage, oldMessage);
    hasMajorChange = true;
  }
  if (isExerciseDeadlineChanged && !isExerciseFinishedChanged) {
    // if isExerciseFinishedChange is true,
    // change in exercise deadline is already handled.
    onExerciseDeadline(newMessage, hasMajorChange, minorChanges);
    hasMajorChange = true;
  }
  if (isHasAttachmentChanged) {
    onHasAttachment(newMessage, oldMessage, hasMajorChange, minorChanges);
    hasMajorChange = true;
  } else if (isAttachmentLinkChanged && isAttachmentNameChanged) {
    onAttachmentLinkAndText(newMessage, hasMajorChange, minorChanges);
    hasMajorChange = true;
  } else if (isAttachmentLinkChanged) {
    onAttachmentLink(newMessage, hasMajorChange, minorChanges);
    hasMajorChange = true;
  } else if (isAttachmentNameChanged) {
    onAttachmentName(newMessage, hasMajorChange, minorChanges);
    hasMajorChange = true;
  } else if (newMessage.hasAttachment) {
    // why don't we just put true? Because the old message
    // might still be in queue, hence its attachment is not
    // sent yet.
    newMessage.isAttachmentSent = oldMessage.isAttachmentSent;
    newMessage.isAttachmentLarge = oldMessage.isAttachmentLarge;
    newMessage.isAttachmentStored = oldMessage.isAttachmentStored;
    newMessage.attachmentDownloadErrorCount =
      oldMessage.attachmentUploadErrorCount;
  }
  if (isExerciseNameChanged) {
    onExerciseName(newMessage, hasMajorChange, minorChanges);
    hasMajorChange = true;
  }
  if (isExerciseStartChanged) {
    onExerciseStart(newMessage, hasMajorChange, minorChanges);
    hasMajorChange = true;
  }

  const whiteSpace = "‌";
  if (minorChanges) {
    const footerText = `${minorChanges.join("\n- ")} \n${whiteSpace}`;
    newMessage.footer = footerText;
  }
}

function isXChanged(oldMessage: PublicMessage, newMessage: PublicMessage) {
  return {
    isExerciseChanged: oldMessage.isExercise !== newMessage.isExercise,
    isExerciseFinishedChanged:
      oldMessage.isExerciseFinished !== newMessage.isExerciseFinished,
    isExerciseDeadlineChanged:
      oldMessage.exerciseDeadline !== newMessage.exerciseDeadline,
    isHasAttachmentChanged:
      oldMessage.hasAttachment !== newMessage.hasAttachment,
    isAttachmentLinkChanged:
      oldMessage.attachmentLink !== newMessage.attachmentLink,
    isAttachmentNameChanged:
      oldMessage.attachmentName !== newMessage.attachmentName,
    isExerciseNameChanged: oldMessage.exerciseName !== newMessage.exerciseName,
    isExerciseStartChanged:
      oldMessage.exerciseStart !== newMessage.exerciseStart,
  };
}

export function hasMessageChanged(
  newMessage: PublicMessage,
  oldMessage: PublicMessage
) {
  if (!oldMessage) {
    console.log("No old message from DB.");
    return true;
  }
  const {
    isExerciseChanged,
    isExerciseFinishedChanged,
    isExerciseDeadlineChanged,
    isHasAttachmentChanged,
    isAttachmentLinkChanged,
    isAttachmentNameChanged,
    isExerciseNameChanged,
    isExerciseStartChanged,
  } = isXChanged(oldMessage, newMessage);

  const isChanged =
    isExerciseChanged ||
    isExerciseFinishedChanged ||
    isExerciseDeadlineChanged ||
    isHasAttachmentChanged ||
    isAttachmentLinkChanged ||
    isAttachmentNameChanged ||
    isExerciseNameChanged ||
    isExerciseStartChanged;
  return isChanged;
}
