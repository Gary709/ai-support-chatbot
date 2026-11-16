import { describe, expect, it } from 'vitest';
import { loadKnowledge } from '../src/kb/load.js';
import { bm25Rank } from '../src/retrieval/bm25.js';
import { searchKnowledge } from '../src/retrieval/search.js';
import { overlapConfidence, tokenize } from '../src/retrieval/tokenize.js';

describe('tokenize', () => {
  it('drops English stopwords and keeps material names', () => {
    expect(tokenize('Is PLA easy?')).toEqual(['pla', 'easy']);
  });

  it('emits Chinese bigrams', () => {
    expect(tokenize('免费送货')).toEqual(['免费', '费送', '送货']);
  });
});

describe('bm25Rank', () => {
  it('prefers a short relevant note over a long note that mentions one word', () => {
    const ranked = bm25Rank('free delivery canberra', [
      { id: 'short', text: 'canberra free delivery on local orders' },
      { id: 'long', text: `canberra ${'spool colour batch warehouse shelf '.repeat(40)}` },
    ]);
    expect(ranked[0]?.id).toBe('short');
    expect(ranked[0]?.score).toBeGreaterThan(ranked[1]?.score ?? 0);
  });

  it('does not let a repeated word outrank a note that covers the whole question', () => {
    const ranked = bm25Rank('pla nozzle temperature', [
      { id: 'spam', text: Array.from({ length: 30 }, () => 'pla').join(' ') },
      { id: 'settings', text: 'pla nozzle temperature bed fan' },
    ]);
    expect(ranked[0]?.id).toBe('settings');
  });
});

describe('searchKnowledge', () => {
  const articles = loadKnowledge();

  it('loads both languages for every topic', () => {
    expect(articles).toHaveLength(22);
    const ids = new Set(articles.map((article) => article.id));
    expect(ids.size).toBe(11);
    for (const id of ids) {
      expect(articles.some((article) => article.id === id && article.lang === 'en')).toBe(true);
      expect(articles.some((article) => article.id === id && article.lang === 'zh')).toBe(true);
    }
  });

  it('ranks Canberra delivery, PETG settings, and returns above unrelated notes', () => {
    expect(searchKnowledge('Is delivery free in Canberra?', articles)[0]?.id).toBe(
      'shipping.canberra',
    );
    expect(searchKnowledge('What nozzle temperature for PETG?', articles)[0]?.id).toBe(
      'filament.petg',
    );
    expect(searchKnowledge('PLA bed temperature', articles)[0]?.id).toBe('filament.pla');
    expect(searchKnowledge('What is your returns policy?', articles)[0]?.id).toBe('returns.policy');
    expect(searchKnowledge('How long does sea freight from China take?', articles)[0]?.id).toBe(
      'shipping.leadtime',
    );
  });

  it('ranks Mandarin questions against the Chinese articles', () => {
    const shipping = searchKnowledge('堪培拉送货免费吗', articles)[0];
    expect(shipping?.id).toBe('shipping.canberra');
    expect(shipping?.matchedLang).toBe('zh');

    const petg = searchKnowledge('PETG 喷嘴温度是多少', articles)[0];
    expect(petg?.id).toBe('filament.petg');
    expect(petg?.matchedLang).toBe('zh');

    expect(searchKnowledge('从中国海运大概要多久', articles)[0]?.id).toBe('shipping.leadtime');
    expect(searchKnowledge('退货政策是什么', articles)[0]?.id).toBe('returns.policy');
  });

  it('gives in-catalogue questions a high overlap and off-topic questions a low one', () => {
    const shipping = searchKnowledge('Is delivery free in Canberra?', articles)[0];
    expect(shipping?.confidence).toBeGreaterThan(0.6);

    const offTopic = searchKnowledge('Do you sell resin printers and laser cutters?', articles);
    const confidence = offTopic[0]?.confidence ?? 0;
    expect(confidence).toBeLessThan(0.34);
    expect(overlapConfidence('hello there', 'free delivery in canberra')).toBe(0);
  });

  it('returns nothing for an empty query', () => {
    expect(searchKnowledge('   ', articles)).toEqual([]);
  });
});
