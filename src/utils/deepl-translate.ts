import * as deepl from 'deepl-node';
import { TargetLanguageCode } from 'deepl-node';
import { detectPair, Language } from './lang-detect';
import { DEEPL_API_KEY } from '../config/env';

export enum TranslateErrorEnum {
  LANG_DETECT = 'LANG_DETECT',
}

export interface CodedError extends Error {
  code?: TranslateErrorEnum;
}

// Single shared DeepL translator instance
const translator = new deepl.Translator(DEEPL_API_KEY);

/**
 * DeepL requires a regional variant when English is the *target* language.
 * This helper upgrades plain `en` to `en-US` (switch to `en-GB` if you prefer).
 * For every other language we can forward the two‑letter code unchanged.
 */
function checkTargetLanguage(lang: Language): TargetLanguageCode {
  // Explicitly check for 'en' and return 'en-US', else just return the code
  if (lang === 'en') {
    return 'en-US';
  }
  return lang as TargetLanguageCode; // For other languages, it matches 1:1
}

/**
 * Translate `text` **within a fixed bilingual pair** `a ↔ b`.
 *
 * 1.  Detects which of the two languages the text is written in.
 * 2.  Chooses the opposite language as the translation target.
 * 3.  Calls DeepL and returns the translated string plus the actual
 *     source/target codes that were sent to the API.
 *
 * Throws an Error when language detection fails ("unknown").
 */
export async function translate(
  text: string,
  a: Language,
  b: Language,
): Promise<{
  translated: string;
  source: Language;
  target: TargetLanguageCode;
}> {
  // ── 1. Detect source language inside the given pair
  const sourceLanguage = detectPair(text, a, b);
  if (sourceLanguage === 'unknown') {
    const err: CodedError = new Error('Unable to detect language for the provided pair');
    err.code = TranslateErrorEnum.LANG_DETECT;
    throw err;
  }

  // ── 2. Determine the opposite language as target
  const targetLanguage = checkTargetLanguage(sourceLanguage === a ? b : a);

  // ── 3. Perform translation via DeepL
  const result = await translator.translateText(text, sourceLanguage, targetLanguage);

  return { translated: result.text, source: sourceLanguage, target: targetLanguage };
}
