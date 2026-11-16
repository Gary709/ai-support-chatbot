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
    expect(articles).toHaveLength(26);
    const ids = new Set(articles.map((article) => article.id));
    expect(ids.size).toBe(13);
    for (const id of ids) {
      expect(articles.some((article) => article.id === id && article.lang === 'en')).toBe(true);
      expect(articles.some((article) => article.id === id && article.lang === 'zh')).toBe(true);
    }
  });

  it('ranks prices, Canberra delivery, sea freight, and the unconfirmed notes', () => {
    expect(searchKnowledge('Is delivery free in Canberra?', articles)[0]?.id).toBe(
      'shipping.canberra',
    );
    expect(searchKnowledge('How much is PLA Basic?', articles)[0]?.id).toBe('products.pla-basic');
    expect(searchKnowledge('How much is PETG Basic?', articles)[0]?.id).toBe('products.petg-basic');
    expect(searchKnowledge('What is your returns policy?', articles)[0]?.id).toBe('returns.policy');
    expect(searchKnowledge('How much is postage to Melbourne?', articles)[0]?.id).toBe(
      'shipping.postage',
    );
    expect(searchKnowledge('How many days does delivery take?', articles)[0]?.id).toBe(
      'shipping.times',
    );
    expect(searchKnowledge('How long does sea freight from China take?', articles)[0]?.id).toBe(
      'stock.leadtime',
    );
    expect(searchKnowledge('Do you ship Australia-wide?', articles)[0]?.id).toBe(
      'shipping.australia',
    );
  });

  it('ranks Mandarin questions against the Chinese articles', () => {
    const shipping = searchKnowledge('堪培拉送货免费吗', articles)[0];
    expect(shipping?.id).toBe('shipping.canberra');
    expect(shipping?.matchedLang).toBe('zh');

    const petg = searchKnowledge('PETG Basic 多少钱', articles)[0];
    expect(petg?.id).toBe('products.petg-basic');
    expect(petg?.matchedLang).toBe('zh');

    expect(searchKnowledge('从中国海运大概要多久', articles)[0]?.id).toBe('stock.leadtime');
    expect(searchKnowledge('退货怎么算', articles)[0]?.id).toBe('returns.policy');
  });

  it('gives in-catalogue questions a high overlap and off-topic questions a low one', () => {
    const shipping = searchKnowledge('Is delivery free in Canberra?', articles)[0];
    expect(shipping?.confidence).toBeGreaterThan(0.6);

    const offTopic = searchKnowledge('Do you sell resin printers and laser cutters?', articles);
    const confidence = offTopic[0]?.confidence ?? 0;
    expect(confidence).toBeLessThan(0.34);
    expect(overlapConfidence('hello there', 'free delivery in canberra')).toBe(0);
  });

  it('points at the published return and shipping policies', () => {
    const returns = articles.find(
      (article) => article.id === 'returns.policy' && article.lang === 'en',
    );
    const postage = articles.find(
      (article) => article.id === 'shipping.postage' && article.lang === 'en',
    );
    expect(returns?.summary).toContain('https://www.tinyfab3d.com.au/policies/refund-policy');
    expect(returns?.summary).toContain('30 days');
    expect(returns?.summary).toContain('20%');
    expect(postage?.summary).toContain('https://www.tinyfab3d.com.au/policies/shipping-policy');
    expect(postage?.summary).toContain('12.50');
    expect(articles.some((article) => article.status === 'todo')).toBe(false);
  });

  it('returns nothing for an empty query', () => {
    expect(searchKnowledge('   ', articles)).toEqual([]);
  });
});
