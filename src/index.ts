import TelegramBot from 'node-telegram-bot-api';
import * as dotenv from 'dotenv';
import { CodedError, translate, TranslateErrorEnum } from './utils/deepl-translate';
import { Language } from './utils/lang-detect';

dotenv.config();

/* -------------------------------------------------------------------------- */
/*  Step1. Telegram‑bot initialization                                       */
/* -------------------------------------------------------------------------- */

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN as string, { polling: true });

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

  try {
    // translate() auto‑detects which side of the pair the text belongs to
    const { translated } = await translate(text, ...PAIR);
    await bot.sendMessage(chatId, translated);
  } catch (err: unknown) {
    console.error('Translate error:', err);

    const e = err as CodedError; // we control what translate() throws

    const reply =
      e?.code === TranslateErrorEnum.LANG_DETECT
        ? '⚠️ Could not detect the language of the message for the selected pair.'
        : '❌ Translation error occurred.';

    await bot.sendMessage(chatId, reply);
  }
});
