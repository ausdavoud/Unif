import { existsInDB, setChatID, unsetChatId } from "../db/dbService";
import { chatIdDB } from "../db/mongodb/connect";
import { Bot, Context, GrammyError, HttpError } from "grammy";
import env from "../env";

interface BotConfig {
  isOwner: boolean;
}

export type MyContext = Context & {
  config: BotConfig;
};

export async function setupBot(bot: Bot<MyContext>) {
  bot.use(async (ctx, next) => {
    ctx.config = {
      isOwner: ctx.from?.id === env.OWNER_ID,
    };
    await next();
  });

  bot.command("start", async (ctx) => {
    await ctx.reply("سلام به ربات خوش اومدید!");
  });

  bot.command("help", async (ctx) => {
    await ctx.reply("راهنمای استفاده از ربات");
  });

  bot.command("chat_id", async (ctx) => {
    await ctx.reply(`<code>${ctx.from?.id}</code>`, {
      parse_mode: "HTML",
    });
  });

  bot.command("set", async (ctx) => {
    if (!ctx.config.isOwner) {
      await ctx.reply("شما مجاز به انجام این کار نیستید.");
      return;
    }
    const chatId = ctx.chatId;
    const chatName = ctx.chat.first_name || ctx.chat.title;
    if (await existsInDB(chatIdDB, { chatId })) {
      ctx.reply("این چت قبلا به لیست اضافه شده است.");
    } else {
      await setChatID(chatId, chatName);
      const msg =
        "این چت با شماره " +
        `<code>${chatId}</code> ` +
        "به لیست چت‌ها اضافه شد.";
      await ctx.reply(msg, {
        parse_mode: "HTML",
      });
    }
  });

  bot.command("unset", async (ctx) => {
    if (!ctx.config.isOwner) {
      await ctx.reply("شما مجاز به انجام این کار نیستید.");
      return;
    }
    const chatId = ctx.chatId;
    if (!(await existsInDB(chatIdDB, { chatId }))) {
      ctx.reply("این چت فعال نیست.");
    } else {
      await unsetChatId(chatId);
      const msg =
        "این چت با شماره" + `<code>${chatId}</code> ` + "از لیست چت‌ها حذف شد.";
      await ctx.reply(msg, {
        parse_mode: "HTML",
      });
    }
  });

  try {
    await bot.api.setMyCommands([
      { command: "start", description: "شروع کار ربات" },
      { command: "help", description: "نمایش راهنما" },
      { command: "chat_id", description: "نمایش آیدی منحصر به فرد این چت" },
      { command: "set", description: "ارسال پیام‌های LMS در این چت" },
      { command: "unset", description: "توقف ارسال پیام در این چت" },
    ]);
  } catch {
    console.log("Could not Set bot commands in the menu");
  }

  setupBotErrorHandler(bot);
}

function setupBotErrorHandler(bot: Bot<MyContext>) {
  bot.catch((err) => {
    const ctx = err.ctx;
    console.error(`Error while handling update ${ctx.update.update_id}:`);
    const e = err.error;
    if (e instanceof GrammyError) {
      console.error("Error in request:", e.description);
    } else if (e instanceof HttpError) {
      console.error("Could not contact Telegram:", e);
    } else {
      console.error("Unknown error:", e);
    }
  });
}
