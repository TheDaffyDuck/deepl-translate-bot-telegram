/**
 * Lightweight language‑pair detector for ru, en, es, it, de, fr.
 *
 * Detection cascade (fast → accurate):
 *   1. Script check (Cyrillic vs Latin) – works when one language is Russian.
 *   2. Unique diacritics per language (ñ, ß, ç, etc.).
 *   3. Stop‑word counts for the two languages.
 *   4. franc‑min n‑gram model as fallback, whitelisted to the pair.
 *
 * All functions return two‑letter codes exactly matching DeepL docs.
 * Swap franc‑min for fastText if you need higher accuracy on short, diacritic‑stripped
 * texts – see notes at bottom.
 */

import { franc } from 'franc-min';

export type Language = 'ru' | 'en' | 'es' | 'it' | 'de' | 'fr';

/* -------------------------------------------------------------------------- */
/*  Step 1. Cyrillic vs Latin                                                 */

/* -------------------------------------------------------------------------- */

function detectByScript(text: string): 'ru' | 'latin' | null {
  let cyr = 0,
    lat = 0;
  for (const ch of text) {
    const code = ch.codePointAt(0)!;
    if ((code >= 0x0400 && code <= 0x04ff) || (code >= 0x0500 && code <= 0x052f)) cyr++;
    else if ((code >= 0x0041 && code <= 0x005a) || (code >= 0x0061 && code <= 0x007a)) lat++;
  }
  if (cyr && !lat) return 'ru';
  if (lat && !cyr) return 'latin';
  return null;
}

/* -------------------------------------------------------------------------- */
/*  Step 2. Unique diacritics                                                 */
/* -------------------------------------------------------------------------- */

const UNIQUE: Record<Language, string> = {
  ru: 'ё',
  en: '',
  es: 'ñáéíóúü¿¡',
  it: 'àèéìòù',
  de: 'äöüß',
  fr: 'àâçéèêëîïôûùüœ',
};

function hitUnique(text: string, lang: Language): boolean {
  const chars = UNIQUE[lang];
  if (!chars) return false;
  return [...text].some((ch) => chars.includes(ch));
}

/* -------------------------------------------------------------------------- */
/*  Step 3. Stop‑words                                                        */
/* -------------------------------------------------------------------------- */

const STOPS: Record<Language, readonly string[]> = {
  ru: ['и', 'не', 'это', 'на', 'что', 'я', 'он', 'она', 'мы', 'вы'],
  en: ['the', 'and', 'to', 'of', 'is', 'in', 'that', 'for', 'it', 'on'],
  es: ['el', 'la', 'de', 'que', 'y', 'en', 'los', 'se', 'con', 'para'],
  it: ['il', 'la', 'che', 'di', 'e', 'in', 'per', 'del', 'una', 'le'],
  de: ['der', 'die', 'und', 'zu', 'den', 'das', 'nicht', 'von', 'sie', 'ist'],
  fr: ['le', 'la', 'et', 'de', 'que', 'les', 'des', 'est', 'en', 'pour'],
};

function countStops(text: string, lang: Language): number {
  const tokens = text.toLowerCase().split(/[^a-zа-яёäöüßàáâãçéèêíìîñóòôõúùûüœ]+/u);
  const bag = new Set(STOPS[lang]);
  let hits = 0;
  for (const w of tokens) if (bag.has(w)) hits++;
  return hits;
}

/* -------------------------------------------------------------------------- */
/*  Step 4. franc‑min fallback                                                */
/* -------------------------------------------------------------------------- */

const ISO_MAP: Record<Language, string> = {
  ru: 'rus',
  en: 'eng',
  es: 'spa',
  it: 'ita',
  de: 'deu',
  fr: 'fra',
};

function detectByFranc(text: string, pair: [Language, Language]): Language | null {
  const whitelist = pair.map((l) => ISO_MAP[l]);
  const iso = franc(text, { only: whitelist });
  return (Object.entries(ISO_MAP).find(([, v]) => v === iso)?.[0] as Language) || null;
}

/* -------------------------------------------------------------------------- */
/*  Public API                                                                */

/* -------------------------------------------------------------------------- */

export function detectPair(text: string, lang1: Language, lang2: Language): Language | 'unknown' {
  // Fast Cyrillic vs Latin shortcut when Russian is in the pair
  if (lang1 === 'ru' || lang2 === 'ru') {
    const script = detectByScript(text);
    if (script === 'ru') return 'ru';
    if (script === 'latin' && (lang1 === 'ru' || lang2 === 'ru'))
      return lang1 === 'ru' ? lang2 : lang1;
  }

  // Unique diacritics
  if (hitUnique(text, lang1)) return lang1;
  if (hitUnique(text, lang2)) return lang2;

  // Stop‑words
  const s1 = countStops(text, lang1);
  const s2 = countStops(text, lang2);
  if (s1 > s2) return lang1;
  if (s2 > s1) return lang2;

  // franc‑min n‑gram
  const byModel = detectByFranc(text, [lang1, lang2]);
  if (byModel) return byModel;

  return 'unknown';
}

/* -------------------------------------------------------------------------- */
/*  Notes on switching to fastText                                            */
/* -------------------------------------------------------------------------- */

/**
 * fastText vs franc‑min
 * ---------------------
 * franc‑min (~0.5MB JS) is pure n‑gram and has zero runtime dependencies.
 * For most texts ≥ 15chars its accuracy on the selected languages rivals CLD3.
 *
 * fastText (via @tensorflow/tfjs or bindings) is larger (10–50MB per model)
 * but handles diacritic‑stripped and very short inputs better thanks to its
 * subword embeddings.
 *
 * If your app must distinguish «de» vs «pl» on 3‑letter tokens or heavily
 * normalized text, consider fastText. You can load the `lid.176.ftz` model,
 * run `model.predict(text, k = 1)` and check if the top label is in your pair.
 * Otherwise franc‑min keeps bundle size tiny and requires no WASM or native
 * addons.
 */
