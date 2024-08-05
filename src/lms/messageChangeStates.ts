import { Message } from "./messageInterface";

export function onIsExerciseChange(newMessage: Message) {
    if (newMessage.isExercise) {
        newMessage.header = newMessage.author
        + " "
        + "تمرین"
        + " "
        + newMessage.exerciseName
        + " "
        + "را به پیام قبلی خود اضافه کرد.";
    }
    else {
        newMessage.header = newMessage.author 
        + " "
        + "تمرین را از پیام خود حذف کرد."
    }

}

export function onIsExerciseFinishedChange(newMessage: Message) {
    if (newMessage.isExerciseFinished) {
        newMessage.header = "مهلت ارسال تمرین"
        + " "
        + newMessage.exerciseName
        + " "
        + "به پایان رسید."
    }
    if (!newMessage.isExerciseFinished) {
        newMessage.header = "مهلت ارسال تمرین"
        + " "
        + newMessage.exerciseName
        + " "
        + "تمدید شد."
    }
}

export function onHasAttachmentChange(newMessage: Message, oldMessage: Message, hasMajorChange: boolean, minorChanges: string[]) {
    if (newMessage.hasAttachment) {
        if (hasMajorChange) {
            minorChanges.push("افزودن فایل پیوست")
        }
        else {
            newMessage.header = newMessage.author
            + " "
            + "فایل پیوست"
            + " "
            + newMessage.attachmentName
            + " "
            + "را به پیام قبلی خود افزود."
        }
    }
    else {
        if (hasMajorChange){
            minorChanges.push("حذف فایل پیوست")
        }
        else {
            newMessage.header = newMessage.author
            + " "
            + "فایل پیوست"
            + " "
            + oldMessage.attachmentName
            + " "
            + "را از پیام خود حذف کرد."
        }
    }
}

export function onExerciseDeadlineChange(newMessage: Message, hasMajorChange: boolean, minorChanges: string[]) {
    if (newMessage.isExerciseFinished) {
        if (hasMajorChange){
            minorChanges.push("تغییر مهلت ارسال تمرین")
        }
        else {
            newMessage.header = newMessage.author
            + " "
            + "مهلت ارسال تمرین"
            + " "
            + newMessage.exerciseName
            + " "
            + "را تغییر داد، اما مهلت همچنان تمام شده است."
        }
    }
    else {
        // exercise is not finished, but deadline has changed
        if (hasMajorChange) {
            minorChanges.push("تغییر مهلت ارسال تمرین")
        }
        else {
            newMessage.header = newMessage.author
            + " "
            + "مهلت ارسال تمرین"
            + " "
            + newMessage.exerciseName
            + " "
            + "را تغییر داد."
        }
    }
}

export function onAttachmentLinkAndTextChange(newMessage:Message, hasMajorChange: boolean, minorChanges: string[]) {
    if (hasMajorChange) {
        minorChanges.push('آپلود فایل پیوست جدید')
    }
    else {
        newMessage.header = newMessage.author 
        + " "
        + "فایل پیوست جدیدی را آپلود کرد."
    }
}

export function onAttachmentLinkChange(newMessage:Message, hasMajorChange: boolean, minorChanges: string[]) {
    if (hasMajorChange) {
        minorChanges.push("تغییر لینک فایل پیوست")
    }
    else {
        newMessage.header = newMessage.author
        + " "
        + "لینک فایل پیوست را تغییر داد."
    }
}


export function onAttachmentTextChange(newMessage:Message, hasMajorChange: boolean, minorChanges: string[]) {
    if (hasMajorChange) {
        minorChanges.push("تغییر نام فایل پیوست")
    }
    else {
        newMessage.header = newMessage.author
        + " "
        + "نام فایل پیوست را تغییر داد."
    }
}

export function onIsExerciseNameChange(newMessage: Message, hasMajorChange: boolean, minorChanges: string[]) {
    if (hasMajorChange) {
        minorChanges.push('تغییر نام تمرین')
    }
    else {
        newMessage.header = newMessage.author
        + " "
        + "نام تمرین را به"
        + " "
        + newMessage.exerciseName
        + " "
        + "تغییر داد."
    }
}

export function onIsExerciseStartChange(newMessage: Message, hasMajorChange: boolean, minorChanges: string[]) {
    if (hasMajorChange) {
        minorChanges.push('تغییر زمان شروع تمرین')
    }
    else {
        newMessage.header = newMessage.author
        + " "
        + "زمان شروع تمرین را به"
        + " "
        + newMessage.exerciseStart
        + " "
        + "تغییر داد."
    }
}
