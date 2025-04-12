import TelegramBot from 'node-telegram-bot-api';
import { CodedError, translate, TranslateErrorEnum } from './utils/deepl-translate';
import { Language } from './utils/lang-detect';
import { TELEGRAM_BOT_TOKEN } from './config/env';

/* -------------------------------------------------------------------------- */
/*  Step1. Telegram‑bot initialization                                       */
/* -------------------------------------------------------------------------- */

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

/* -------------------------------------------------------------------------- */
/*  Step2. Fixed language pair (edit if needed)                              */
/* -------------------------------------------------------------------------- */

const PAIR: [Language, Language] = ['ru', 'en']; // Russian ↔ English

/* -------------------------------------------------------------------------- */
/*  Step3. Handle every incoming message                                     */
/* -------------------------------------------------------------------------- */

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  if (!text) return; // ignore non‑text updates

  // command entry processing
  if (text.startsWith('/start')) {
    await bot.sendMessage(
      chatId,
      `🤖 This bot automatically translates between Russian and English.\n` +
        `Just send a message in one language, and it will be translated to the other.\n\n` +
        `🤖 Этот бот автоматически переводит между русским и английским языком.\n` +
        `Просто отправьте сообщение на одном из языков, и он переведёт его на другой.`,
    );
    return;
  }

  try {
    // translate() auto‑detects which side of the pair the text belongs to
    const { translated } = await translate(text, ...PAIR);
    await bot.sendMessage(chatId, translated);
  } catch (err: unknown) {
    const e = err as CodedError; // we control what translate() throws

    console.error('\n[❌ Translate error]');
    if (e.code) console.error(`Code: ${e.code}`);
    console.error(`Message: ${e.message}\n`);

    const reply =
      e?.code === TranslateErrorEnum.LANG_DETECT
        ? '⚠️ Could not detect the language of the message for the selected pair.'
        : '❌ Translation error occurred.';

    await bot.sendMessage(chatId, reply);
  }
});
