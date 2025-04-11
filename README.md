# Deepl Translate Bot (Telegram)

🤖 A simple Telegram bot that automatically translates text between two fixed languages (e.g. Russian and English) using
the DeepL API.

## Tech Stack

- TypeScript
- `node-telegram-bot-api`
- `deepl-node`
- `dotenv`
- ESLint + Prettier
- Husky + lint-staged

## Installation

```bash
  yarn
  cp .env.example .env
  # Add your tokens to .env
```

### Install Git hooks (once after cloning)

```bash
  npx husky install
```

## Development

```bash
  yarn dev
```

## Production build

```bash
  yarn build
  yarn start
```

## Linting & Formatting

```bash
  yarn lint
  yarn format
```

## Pre-commit check

Before each commit, `eslint` and `prettier` will run automatically on staged `.ts`/`.tsx` files via `lint-staged`.

## Language Behavior

The bot supports one fixed language pair in both directions. For example:

- From English (`en`) to Russian (`ru`)
- From Russian (`ru`) to English (`en-US`)

The bot uses auto-detection to determine the input language and translates to the other in the predefined pair. You can
adjust this language pair in the code.
