import type { Article } from '../kb/types.js';
import type { Lang } from '../types.js';
import { bm25Rank } from './bm25.js';
import { overlapConfidence } from './tokenize.js';

export type SearchHit = {
  id: string;
  score: number;
  confidence: number;
  matchedLang: Lang;
};

/**
 * Rank topics across both languages, then keep the best language variant of each topic.
 * A Chinese question can still be answered from the English twin, and the other way around.
 */
export function searchKnowledge(query: string, articles: Article[], limit = 3): SearchHit[] {
  const ranked = bm25Rank(
    query,
    articles.map((article) => ({
      id: `${article.id}::${article.lang}`,
      text: article.searchText,
    })),
  );
  const byKey = new Map(articles.map((article) => [`${article.id}::${article.lang}`, article]));
  const best = new Map<string, SearchHit>();

  for (const row of ranked) {
    if (row.score <= 0) continue;
    const article = byKey.get(row.id);
    if (!article) continue;
    const hit: SearchHit = {
      id: article.id,
      score: row.score,
      confidence: overlapConfidence(query, article.searchText),
      matchedLang: article.lang,
    };
    const previous = best.get(article.id);
    if (!previous || hit.score > previous.score) best.set(article.id, hit);
  }

  return [...best.values()]
    .sort((left, right) => right.score - left.score || left.id.localeCompare(right.id))
    .slice(0, limit);
}

export function articleInLanguage(
  articles: Article[],
  id: string,
  language: Lang,
): Article | undefined {
  return (
    articles.find((article) => article.id === id && article.lang === language) ??
    articles.find((article) => article.id === id)
  );
}
