import TelegramBot from 'node-telegram-bot-api';
import * as dotenv from 'dotenv';
import * as deepl from 'deepl-node';

dotenv.config();

// Initialize Telegram bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN as string, { polling: true });

// Initialize DeepL translator
const translator = new deepl.Translator(process.env.DEEPL_API_KEY as string);

// Simple language detection based on alphabet
function detectSourceLang(text: string): deepl.SourceLanguageCode | null {
  if (/[а-яА-ЯёЁ]/.test(text)) return 'ru';
  if (/[a-zA-Z]/.test(text)) return 'en';
  return null;
}

// Supported translation pairs
const LANGUAGE_PAIRS: Partial<Record<deepl.SourceLanguageCode, deepl.TargetLanguageCode>> = {
  ru: 'en-US',
  en: 'ru',
};

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text) return;

  try {
    const sourceLang = detectSourceLang(text);

    if (!sourceLang || !LANGUAGE_PAIRS[sourceLang]) {
      await bot.sendMessage(
        chatId,
        '⚠️ Unable to detect the message language or it is not supported.',
      );
      return;
    }

    const targetLang = LANGUAGE_PAIRS[sourceLang];
    const result = await translator.translateText(text, sourceLang, targetLang);

    await bot.sendMessage(chatId, result.text);
  } catch (error) {
    console.error('Translation error:', error);
    await bot.sendMessage(chatId, '❌ An error occurred during translation.');
  }
});
