import type { Lang, LanguageMode } from '../types.js';

export function detectLanguage(text: string): Lang {
  const cjk = (text.match(/[\u4e00-\u9fff]/g) ?? []).length;
  const latin = (text.match(/[A-Za-z]/g) ?? []).length;
  if (cjk === 0) return 'en';
  if (latin === 0) return 'zh';
  // One Han character is roughly a word, so it outweighs two Latin letters.
  return cjk * 2 >= latin ? 'zh' : 'en';
}

export function resolveLanguage(text: string, mode: LanguageMode): Lang {
  if (mode === 'en' || mode === 'zh') return mode;
  return detectLanguage(text);
}
