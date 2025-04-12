# DeepL Translate Telegram Bot

🤖 **Telegram bot for automatic text translation between two predefined languages using the DeepL API.**

---

## Features

- **Automatic Language Detection:**
    - Detects the input language from the predefined language pair and automatically translates to the other language.

- **Simple Setup:**
    - Minimalistic configuration with easy-to-manage `.env` file.

- **Robust Error Handling:**
    - Clear and informative messages for translation issues.

---

## Tech Stack

- **Language & Platform:** TypeScript, Node.js
- **Telegram Bot:** [`node-telegram-bot-api`](https://github.com/yagop/node-telegram-bot-api)
- **Translation Service:** [DeepL API](https://www.deepl.com/docs-api)
- **Language Detection:** [`franc-min`](https://github.com/wooorm/franc)
- **Environment Configuration:** [`dotenv`](https://github.com/motdotla/dotenv)
- **Linting & Formatting:** ESLint, Prettier
- **Git Hooks:** Husky, lint-staged
- **Process Manager:** [PM2](https://pm2.keymetrics.io/)

---

## Installation

Clone the repository and install dependencies:

```bash
  git clone https://github.com/your-username/deepl-translate-bot-telegram.git
  cd deepl-translate-bot-telegram
  yarn
  cp .env.example .env
  # Add your TELEGRAM_BOT_TOKEN and DEEPL_API_KEY to .env
```

Initialize Git hooks (once after cloning):

```bash
  npx husky install
```

---

## Development

Start in development mode (watch for file changes):

```bash
  yarn dev
```

---

## Production

Build and run for production:

```bash
  yarn build
  yarn start
```

For deployment, consider using PM2:

```bash
  pm2 start ecosystem.config.js
```

---

## Linting & Formatting

Manually lint and format your code:

```bash
  yarn lint
  yarn format
```

Linting and formatting also run automatically on staged files before each commit (configured via `husky` and
`lint-staged`).

---

## Language Pair

By default, the bot translates:

- English (`en`) ↔ Russian (`ru`)

To adjust this pair, update the language pair configuration in the source code:

```typescript
const PAIR: [Language, Language] = ['ru', 'en'];
```

---

## Bot Commands

The bot automatically translates text messages. Use `/start` to get basic information about the bot.

Example `/start` message:

> 🇺🇸 **This bot automatically translates between Russian and English. Simply send any text, and the bot will translate
it to the other language.**  
> 🇷🇺 **Этот бот автоматически переводит сообщения с русского на английский и наоборот. Просто отправьте текст, и бот
переведёт его на другой язык.**

---

## License

This project is open source and available under the MIT License.

