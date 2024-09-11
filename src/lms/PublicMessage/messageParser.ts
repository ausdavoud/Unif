import * as cheerio from "cheerio";
import { PublicMessage } from "../commonUtils/messageTypes";

export function findFeedMessages(groupPageContent: string) {
  const feedMessages: string[] = [];
  const $ = cheerio.load(groupPageContent);
  $('div[class="feed_item_body"]').each((i, elem) => {
    const elementHTML = $(elem).html();
    if (elementHTML != null) {
      feedMessages.push(elementHTML);
    }
  });
  return feedMessages;
}

export function createMessageBody(
  feedElement: string,
  groupName: string
): PublicMessage {
  // Extract message text and shape the overall structure to store in db;
  const $ = cheerio.load(feedElement);
  const author = $('a[class~="feed_item_username"]').text();
  const textBody = $('span[class="feed_item_bodytext"]');
  const textSpan = textBody.find('span[class="view_more"][style^="display"]');
  const textElement = textSpan.text() === "" ? textBody : textSpan;
  const text = textElement.text().trim();
  const sentAt = $('span[class="timestamp"]').text();
  const attachment = $('div[class="feed_item_attachments"]');
  let hasAttachment = false;
  let isAttachmentLarge = false;
  let isAttachmentStored = false;
  const isAttachmentSent = false;
  const attachmentStorageErrorCount = 0;
  let attachmentName;
  let attachmentLink;
  let isExercise = false;
  let isExerciseFinished = false;
  let exerciseName;
  let exerciseStart;
  let exerciseDeadline;
  let createdAt = new Date();

  if (attachment.length != 0) {
    const attachmentSpans = $(attachment).find("span");
    if (attachmentSpans.length == 0) {
      // It's just an attachment, not an exercise
      // It has no spans, just an anchor tag
      hasAttachment = true;
      const anchorTag = attachment.find("a");
      attachmentName = anchorTag.text();
      attachmentLink = anchorTag.attr("href")!;
    } else {
      isExercise = true;
      // title
      exerciseName = attachmentSpans.eq(0).text();
      // delete 'title : ' part
      exerciseName = exerciseName.slice(exerciseName.indexOf(":") + 1).trim();
      // attachment
      if (attachmentSpans.eq(1).has("a")) {
        const anchorTag = attachmentSpans.eq(1).find("a");
        hasAttachment = true;
        attachmentName = anchorTag.text();
        attachmentLink = anchorTag.attr("href")!;
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
    groupName,
    author,
    text,
    sentAt: sentAt,
    hasAttachment,
    isAttachmentStored,
    isAttachmentLarge,
    isAttachmentSent,
    attachmentStorageErrorCount,
    attachmentName,
    attachmentLink,
    isExercise,
    exerciseName,
    exerciseStart,
    exerciseDeadline,
    isExerciseFinished,
    createdAt: createdAt,
  };

  return msgBody;
}
