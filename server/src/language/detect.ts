import type { Lang, LanguageMode } from '../types.js';

/**
 * Detect English vs Mandarin from the letters in the message.
 * Each CJK character is weighted as two Latin letters, because one character
 * usually carries a whole word.
 */
export function detectLanguage(text: string): Lang {
  const cjk = (text.match(/[\u4e00-\u9fff]/g) ?? []).length;
  const latin = (text.match(/[A-Za-z]/g) ?? []).length;
  if (cjk === 0) return 'en';
  if (latin === 0) return 'zh';
  return cjk * 2 >= latin ? 'zh' : 'en';
}

export function resolveLanguage(text: string, mode: LanguageMode): Lang {
  if (mode === 'en' || mode === 'zh') return mode;
  return detectLanguage(text);
}
