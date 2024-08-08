import { Message } from "./messageInterface";

/* Naming convention:
    Put space after each row of line, so that 
    the next line won't need a starting space.
*/

export function onIsExerciseChange(newMessage: Message, oldMessage: Message) {
    // `message` is the message which still has the exercise name on it.
    const message = newMessage.isExercise ? newMessage : oldMessage;
    const exerciseName = message.exerciseName ? `${message.exerciseName} ` : "";
    const action = newMessage.isExercise ? "اضافه کرد" : "حذف کرد";

    // note the removal of space between `exerciseName` and `را`
    newMessage.header = `${newMessage.author} تمرین ${exerciseName}را ${action}.`;
}

export function onIsExerciseFinishedChange(
    newMessage: Message,
    oldMessage: Message
) {
    // no need to check for majorChange. If action above is reached,
    // it breaks the checking of other changes. Check main code for more info.

    const exerciseName = newMessage.exerciseName
        ? `${newMessage.exerciseName} `
        : "";
    const action = newMessage.isExerciseFinished
        ? "به پایان رسید."
        : "تمدید شد.";
    newMessage.header = `مهلت ارسال تمرین ${exerciseName}${action}`;
}

export function onHasAttachmentChange(
    newMessage: Message,
    oldMessage: Message,
    hasMajorChange: boolean,
    minorChanges: string[]
) {
    const minorAction = newMessage.hasAttachment ? "افزودن" : "حذف";
    const majorAction = newMessage.hasAttachment ? "اضافه کرد." : "حذف کرد.";
    const message = newMessage.hasAttachment ? newMessage : oldMessage;
    const attachmentName = message.attachmentName
        ? `${message.attachmentName} `
        : "";

    if (hasMajorChange) {
        minorChanges.push(`${minorAction} فایل پیوست`);
    } else {
        newMessage.header = `${newMessage.author} فایل پیوست ${attachmentName}را ${majorAction}`;
    }
}

export function onExerciseDeadlineChange(
    newMessage: Message,
    hasMajorChange: boolean,
    minorChanges: string[]
) {
    const exerciseName = newMessage.exerciseName
        ? `${newMessage.exerciseName} `
        : "";
    const alertIfStillFinished = newMessage.isExerciseFinished
        ? "اما مهلت همچنان تمام شده است."
        : "";
    if (hasMajorChange) {
        minorChanges.push("تغییر مهلت ارسال تمدید");
    } else {
        newMessage.header = `${newMessage.author} مهلت ارسال تمرین ${exerciseName}را تغییر داد. ${alertIfStillFinished}`;
    }
}

export function onAttachmentLinkAndTextChange(
    newMessage: Message,
    hasMajorChange: boolean,
    minorChanges: string[]
) {
    const attachmentName = newMessage.attachmentName
        ? `به نام ${newMessage.attachmentName} `
        : "";
    if (hasMajorChange) {
        minorChanges.push("آپلود فایل پیوست جدید");
    } else {
        newMessage.header = `${newMessage.author} فایل پیوست جدیدی ${attachmentName}را آپلود کرد.`;
    }
}

export function onAttachmentLinkChange(
    newMessage: Message,
    hasMajorChange: boolean,
    minorChanges: string[]
) {
    if (hasMajorChange) {
        minorChanges.push("تغییر لینک فایل پیوست");
    } else {
        newMessage.header = `${newMessage.author} لینک فایل پیوست را تغییر داد.`;
    }
}

export function onAttachmentNameChange(
    newMessage: Message,
    hasMajorChange: boolean,
    minorChanges: string[]
) {
    if (hasMajorChange) {
        minorChanges.push("تغییر نام فایل پیوست");
    } else {
        newMessage.header = `${newMessage.author} نام فایل پیوست را تغییر داد.`;
    }
}

export function onIsExerciseNameChange(
    newMessage: Message,
    hasMajorChange: boolean,
    minorChanges: string[]
) {
    const nameAndAction = newMessage.exerciseName
        ? `به ${newMessage.exerciseName} تغییر داد.`
        : `حذف کرد.`;
    if (hasMajorChange) {
        minorChanges.push("تغییر نام تمرین");
    } else {
        newMessage.header = `${newMessage.author} نام تمرین را ${nameAndAction}`;
    }
}

export function onIsExerciseStartChange(
    newMessage: Message,
    hasMajorChange: boolean,
    minorChanges: string[]
) {
    if (hasMajorChange) {
        minorChanges.push("تغییر زمان شروع تمرین");
    } else {
        newMessage.header = `${newMessage.author} زمان شروع تمرین را به ${newMessage.exerciseStart} تغییر داد.`;
    }
}
