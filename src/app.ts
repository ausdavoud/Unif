import { Bot } from "grammy";

import env from "./env";
import { MyContext, setupBot } from "./messanger/telegram";
import { fileService, lmsService, messengerService } from "./services";
import {
  privateQueueDB,
  publicQueueDB,
  publicSentDB,
} from "./db/mongodb/connect";

async function main() {
  const bot = new Bot<MyContext>(env.BOT_TOKEN);
  await setupBot(bot);
  bot.start();

  // await lmsService();
  // await fileService();
  await messengerService(bot);
}

main();
