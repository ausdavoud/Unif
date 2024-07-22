"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findFeedMessages = findFeedMessages;
exports.createMessageBody = createMessageBody;
const cheerio = __importStar(require("cheerio"));
function findFeedMessages(groupPageContent) {
    const feedMessages = [];
    const $ = cheerio.load(groupPageContent);
    $('div[class="feed_item_body"]').each((i, elem) => {
        const elementHTML = $(elem).html();
        if (elementHTML != null) {
            feedMessages.push(elementHTML);
        }
    });
    return feedMessages;
}
function createMessageBody(feedElement) {
    // Extract message text and shape the overall structure to store in db;
    const $ = cheerio.load(feedElement);
    const author = $('a[class~="feed_item_username"]').text();
    const textBody = $('span[class="feed_item_bodytext"]');
    const textSpan = textBody.find('span[class="view_more"][style^="display"]');
    const textElement = textSpan.text() === "" ? textBody : textSpan;
    const text = textElement.text().trim();
    const date = $('span[class="timestamp"]').text();
    const attachment = $('div[class="feed_item_attachments"]');
    let hasAttachment = false;
    let isAttachmentLarge = false;
    let isAttachmentStored = false;
    let attachmentName;
    let attachmentLink;
    let isExercise = false;
    let isExerciseFinished = false;
    let exerciseName;
    let exerciseStart;
    let exerciseDeadline;
    if (attachment.length != 0) {
        const attachmentSpans = $(attachment).find("span");
        if (attachmentSpans.length == 0) {
            // It's just an attachment, not an exercise
            // It has no spans, just an anchor tag
            hasAttachment = true;
            const anchorTag = attachment.find("a");
            attachmentName = anchorTag.text();
            attachmentLink = anchorTag.attr("href");
        }
        else {
            isExercise = true;
            // title
            exerciseName = attachmentSpans.eq(0).text();
            // delete 'title : ' part
            exerciseName = exerciseName
                .slice(exerciseName.indexOf(":") + 1)
                .trim();
            // attachment
            if (attachmentSpans.eq(1).has("a")) {
                const anchorTag = attachmentSpans.eq(1).find("a");
                hasAttachment = true;
                attachmentName = anchorTag.text();
                attachmentLink = anchorTag.attr("href");
            }
            // start
            exerciseStart = attachmentSpans.eq(2).text();
            exerciseStart = exerciseStart
                .slice(exerciseStart.indexOf(":") + 1)
                .trim();
            // deadline
            exerciseDeadline = attachmentSpans.eq(3).text();
            exerciseDeadline = exerciseDeadline
                .slice(exerciseDeadline.indexOf(":") + 1)
                .trim();
            if (exerciseDeadline.includes("پایان")) {
                isExerciseFinished = true;
            }
        }
    }
    const msgBody = {
        author,
        text,
        date,
        hasAttachment,
        isAttachmentStored,
        isAttachmentLarge,
        attachmentName,
        attachmentLink,
        isExercise,
        exerciseName,
        exerciseStart,
        exerciseDeadline,
        isExerciseFinished,
    };
    return msgBody;
}
