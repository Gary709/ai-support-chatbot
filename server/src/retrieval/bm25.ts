import { tokenize } from './tokenize.js';

export type Bm25Doc = { id: string; text: string };

export type Bm25Score = { id: string; score: number };

const K1 = 1.2;
const B = 0.75;

/**
 * BM25 ranking. IDF uses the always-positive Lucene form so a term that
 * appears in every document does not push a score below zero.
 */
export function bm25Rank(query: string, docs: Bm25Doc[]): Bm25Score[] {
  const tokenized = docs.map((doc) => tokenize(doc.text));
  const avgdl = tokenized.reduce((sum, tokens) => sum + tokens.length, 0) / (tokenized.length || 1);
  const documentFrequency = new Map<string, number>();
  for (const tokens of tokenized) {
    for (const term of new Set(tokens)) {
      documentFrequency.set(term, (documentFrequency.get(term) ?? 0) + 1);
    }
  }
  const total = docs.length;
  const queryTokens = tokenize(query);

  return docs
    .map((doc, index) => {
      const frequencies = new Map<string, number>();
      for (const term of tokenized[index]) {
        frequencies.set(term, (frequencies.get(term) ?? 0) + 1);
      }
      const length = tokenized[index].length || 1;
      let score = 0;
      for (const term of queryTokens) {
        const frequency = frequencies.get(term) ?? 0;
        if (!frequency) continue;
        const containing = documentFrequency.get(term) ?? 0;
        const idf = Math.log(1 + (total - containing + 0.5) / (containing + 0.5));
        const numerator = frequency * (K1 + 1);
        const denominator = frequency + K1 * (1 - B + (B * length) / (avgdl || 1));
        score += idf * (numerator / denominator);
      }
      return { id: doc.id, score };
    })
    .sort((left, right) => right.score - left.score || left.id.localeCompare(right.id));
}
