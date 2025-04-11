import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import * as deepl from 'deepl-node';

dotenv.config();

// Telegram bot initialization
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN as string, {
  polling: true, // Enables long polling mode
});

// DeepL API translator initialization
const translator = new deepl.Translator(process.env.DEEPL_API_KEY as string);

// Define allowed language pairs for translation (in both directions)
const LANGUAGE_PAIRS: [deepl.SourceLanguageCode, deepl.TargetLanguageCode][] = [
  ['en', 'ru'],
  ['ru', 'en-US'],
];

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text) return; // Skip empty messages

  try {
    // Attempt to translate to each allowed target language
    for (const [sourceLang, targetLang] of LANGUAGE_PAIRS) {
      const result = await translator.translateText(text, sourceLang, targetLang);

      // Only proceed if detected source matches the current sourceLang
      if (result.detectedSourceLang.toLowerCase() === sourceLang.toLowerCase()) {
        await bot.sendMessage(chatId, result.text);
        return;
      }
    }

    // If none of the allowed pairs matched
    await bot.sendMessage(chatId, '⚠️ Message is not in one of the supported language pairs.');
  } catch (error) {
    console.error('Translation error:', error);
    await bot.sendMessage(chatId, '❌ An error occurred during translation.');
  }
});
