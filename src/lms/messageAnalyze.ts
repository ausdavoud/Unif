import { Message } from "./messageInterface";
import {
    onIsExerciseChange,
    onIsExerciseFinishedChange,
    onExerciseDeadlineChange,
    onHasAttachmentChange,
    onAttachmentLinkAndTextChange,
    onAttachmentLinkChange,
    onAttachmentNameChange,
    onIsExerciseNameChange,
    onIsExerciseStartChange,
} from "./messageChangeStates";

export function addMessageHeaderFooter(
    newMessage: Message,
    oldMessage: Message
) {
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
        onIsExerciseChange(newMessage, oldMessage);
        hasMajorChange = true;
        return undefined;
    }
    if (isExerciseFinishedChanged) {
        onIsExerciseFinishedChange(newMessage, oldMessage);
        hasMajorChange = true;
    }
    if (isExerciseDeadlineChanged && !isExerciseFinishedChanged) {
        // if isExerciseFinishedChange is true,
        // change in exercise deadline is already handled.
        onExerciseDeadlineChange(newMessage, hasMajorChange, minorChanges);
        hasMajorChange = true;
    }
    if (isHasAttachmentChanged) {
        onHasAttachmentChange(
            newMessage,
            oldMessage,
            hasMajorChange,
            minorChanges
        );
        hasMajorChange = true;
    } else if (isAttachmentLinkChanged && isAttachmentNameChanged) {
        onAttachmentLinkAndTextChange(newMessage, hasMajorChange, minorChanges);
        hasMajorChange = true;
    } else if (isAttachmentLinkChanged) {
        onAttachmentLinkChange(newMessage, hasMajorChange, minorChanges);
        hasMajorChange = true;
    } else if (isAttachmentNameChanged) {
        onAttachmentNameChange(newMessage, hasMajorChange, minorChanges);
        hasMajorChange = true;
    } else if (newMessage.hasAttachment) {
        // why don't we just put true? Because the old message
        // might still be in queue, hence its attachment is not
        // sent yet.
        newMessage.isAttachmentSent = oldMessage.isAttachmentSent;
        newMessage.isAttachmentLarge = oldMessage.isAttachmentLarge;
        newMessage.isAttachmentStored = oldMessage.isAttachmentStored;
        newMessage.attachmentStorageErrorCount =
            oldMessage.attachmentStorageErrorCount;
    }
    if (isExerciseNameChanged) {
        onIsExerciseNameChange(newMessage, hasMajorChange, minorChanges);
        hasMajorChange = true;
    }
    if (isExerciseStartChanged) {
        onIsExerciseStartChange(newMessage, hasMajorChange, minorChanges);
        hasMajorChange = true;
    }

    const whiteSpace = "‌";
    const footerText =
        minorChanges.length > 0
            ? minorChanges.join("\n- ") + "\n" + whiteSpace
            : "";

    newMessage.footer = footerText;
}

function isXChanged(oldMessage: Message, newMessage: Message) {
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
        isExerciseNameChanged:
            oldMessage.exerciseName !== newMessage.exerciseName,
        isExerciseStartChanged:
            oldMessage.exerciseStart !== newMessage.exerciseStart,
    };
}

export function isNewMessageChanged(newMessage: Message, oldMessage: Message) {
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
