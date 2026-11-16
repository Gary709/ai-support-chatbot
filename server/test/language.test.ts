import { describe, expect, it } from 'vitest';
import { planReply } from '../src/chat/plan.js';
import { DEFAULT_CONFIDENCE_THRESHOLD } from '../src/config.js';
import { createTicketStore } from '../src/handoff/store.js';
import { detectLanguage, resolveLanguage } from '../src/language/detect.js';

describe('detectLanguage', () => {
  it('treats Latin sentences as English', () => {
    expect(detectLanguage('What is your shipping policy?')).toBe('en');
    expect(detectLanguage('PETG nozzle temperature')).toBe('en');
    expect(detectLanguage('PLA')).toBe('en');
    expect(detectLanguage('')).toBe('en');
  });

  it('treats Mandarin sentences as Chinese', () => {
    expect(detectLanguage('运费怎么算？')).toBe('zh');
    expect(detectLanguage('堪培拉送货免费吗')).toBe('zh');
    expect(detectLanguage('PLA 怎么打印？')).toBe('zh');
  });

  it('follows the dominant script in mixed messages', () => {
    expect(detectLanguage('你好，do you ship to Sydney?')).toBe('en');
    expect(detectLanguage('可以发到悉尼吗 shipping')).toBe('zh');
    expect(detectLanguage('PETG 喷嘴温度')).toBe('zh');
  });

  it('lets an explicit language mode override detection', () => {
    expect(resolveLanguage('堪培拉送货免费吗', 'en')).toBe('en');
    expect(resolveLanguage('Is delivery free in Canberra?', 'zh')).toBe('zh');
    expect(resolveLanguage('Is delivery free in Canberra?', 'auto')).toBe('en');
  });
});

describe('reply language', () => {
  const store = createTicketStore({ now: () => new Date('2026-01-15T00:00:00.000Z') });

  it('answers a Chinese question in Chinese from the Chinese article', () => {
    const plan = planReply(
      { message: '堪培拉送货免费吗？', sessionId: 'session1', languageMode: 'auto' },
      { store, threshold: DEFAULT_CONFIDENCE_THRESHOLD, mode: 'mock' },
    );
    expect(plan.language).toBe('zh');
    expect(plan.action).toBe('answer');
    expect(plan.text).toContain('免费送货');
    expect(plan.sources[0]?.id).toBe('shipping.canberra');
  });

  it('uses the English twin when the toggle forces English', () => {
    const plan = planReply(
      { message: '堪培拉送货免费吗？', sessionId: 'session1', languageMode: 'en' },
      { store, threshold: DEFAULT_CONFIDENCE_THRESHOLD, mode: 'mock' },
    );
    expect(plan.language).toBe('en');
    expect(plan.action).toBe('answer');
    expect(plan.text.toLowerCase()).toContain('canberra');
    expect(plan.sources[0]?.title).toMatch(/Canberra/);
  });

  it('asks the live model to stay in the detected language and only quotes the notes', () => {
    const plan = planReply(
      { message: 'PETG 喷嘴温度是多少？', sessionId: 'session1' },
      { store, threshold: DEFAULT_CONFIDENCE_THRESHOLD, mode: 'openai' },
    );
    expect(plan.language).toBe('zh');
    expect(plan.text).toBe('');
    const system = plan.openaiMessages?.[0]?.content ?? '';
    const user = plan.openaiMessages?.at(-1)?.content ?? '';
    expect(system).toContain('Simplified Chinese');
    expect(user).toContain('230');
    expect(JSON.stringify(plan.openaiMessages)).not.toMatch(/sk-/);
  });
});
