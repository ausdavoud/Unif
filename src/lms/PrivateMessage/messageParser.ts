import env from "../../env";
import { PrivateMessage } from "../commonUtils/messageTypes";
import { getPageContent } from "../commonUtils/urlClient";
import * as cheerio from "cheerio";

export async function getPrivateInbox(cookie: string) {
  const privatePageContent = await getPageContent(env.INBOX_URL, cookie);
  return privatePageContent;
}

export function extractInboxMessages(pageContent: string) {
  const $ = cheerio.load(pageContent);
  const privateMessages: PrivateMessage[] = [];
  $(".messages_list ul li").each((i, elem) => {
    // author: .messages_list ul li div:nth-of-type(2) div:nth-of-type(2)
    // sentAt: .messages_list ul li div:nth-of-type(2) div:nth-of-type(2) span span
    // title, link: .messages_list ul li div:nth-of-type(3) p a
    let author = $(elem)
      .find("div:nth-of-type(2) div:nth-of-type(2)")
      .clone()
      .find("span")
      .remove()
      .end()
      .text()
      .trim();
    let sentAt = $(elem)
      .find("div:nth-of-type(2) div:nth-of-type(2) span span")
      .text();
    let title = $(elem).find("div:nth-of-type(3) p a").text();
    let link = $(elem).find("div:nth-of-type(3) p a").attr("href")!;
    link = env.BASE_URL + link;
    const header = `یک پیام خصوصی جدید از ${author}`;

    let privateMessage = {
      author,
      sentAt,
      header,
      title,
      link,
      createdAt: new Date(),
    };
    privateMessages[i] = privateMessage;
  });
  return privateMessages;
}
