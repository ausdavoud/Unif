import { Message } from "./messageInterface";
import {
    onIsExerciseChange,
    onIsExerciseFinishedChange,
    onExerciseDeadlineChange,
    onHasAttachmentChange,
    onAttachmentLinkAndTextChange,
    onAttachmentLinkChange,
    onAttachmentTextChange,
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
        onIsExerciseChange(newMessage);
        hasMajorChange = true;
        return undefined;
    }
    if (isExerciseFinishedChanged) {
        onIsExerciseFinishedChange(newMessage);
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
        onAttachmentTextChange(newMessage, hasMajorChange, minorChanges);
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
    const isExerciseChanged = oldMessage.isExercise != newMessage.isExercise;
    const isExerciseFinishedChanged =
        oldMessage.isExerciseFinished != newMessage.isExerciseFinished;
    const isExerciseDeadlineChanged =
        oldMessage.exerciseDeadline != newMessage.exerciseDeadline;
    const isHasAttachmentChanged =
        oldMessage.hasAttachment != newMessage.hasAttachment;
    const isAttachmentLinkChanged =
        oldMessage.attachmentLink != newMessage.attachmentLink;
    const isAttachmentNameChanged =
        oldMessage.attachmentName != newMessage.attachmentName;
    const isExerciseNameChanged =
        oldMessage.exerciseName != newMessage.exerciseName;
    const isExerciseStartChanged =
        oldMessage.exerciseStart != newMessage.exerciseStart;

    return {
        isExerciseChanged,
        isExerciseFinishedChanged,
        isExerciseDeadlineChanged,
        isHasAttachmentChanged,
        isAttachmentLinkChanged,
        isAttachmentNameChanged,
        isExerciseNameChanged,
        isExerciseStartChanged,
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
