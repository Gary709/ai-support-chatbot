import { describe, expect, it } from 'vitest';
import { planReply } from '../src/chat/plan.js';
import { DEFAULT_CONFIDENCE_THRESHOLD } from '../src/config.js';
import { decideHandoff } from '../src/handoff/decide.js';
import { createTicketStore } from '../src/handoff/store.js';

const threshold = DEFAULT_CONFIDENCE_THRESHOLD;

describe('decideHandoff', () => {
  it('greets and clarifies without handing off', () => {
    expect(decideHandoff({ message: 'Hello!', confidence: 0, threshold }).action).toBe('greet');
    expect(decideHandoff({ message: '谢谢', confidence: 0, threshold }).action).toBe('greet');
    expect(decideHandoff({ message: '好的', confidence: 0, threshold }).action).toBe('clarify');
    expect(decideHandoff({ message: '   ', confidence: 1, threshold }).action).toBe('clarify');
  });

  it('hands off when the customer asks for a person, in either language', () => {
    expect(
      decideHandoff({
        message: 'I want to talk to a human about Canberra delivery',
        confidence: 1,
        threshold,
      }),
    ).toEqual({ action: 'handoff', reason: 'explicit_request' });
    expect(decideHandoff({ message: '请转人工', confidence: 1, threshold })).toEqual({
      action: 'handoff',
      reason: 'explicit_request',
    });
  });

  it('hands off a specific order and answers a general status question', () => {
    expect(
      decideHandoff({ message: 'Where is order TF-1042?', confidence: 0.9, threshold }),
    ).toEqual({ action: 'handoff', reason: 'order_lookup' });
    expect(decideHandoff({ message: '我的订单到哪了', confidence: 0.9, threshold })).toEqual({
      action: 'handoff',
      reason: 'order_lookup',
    });
    expect(
      decideHandoff({ message: 'How do I check an order status?', confidence: 0.8, threshold }),
    ).toEqual({ action: 'answer' });
    expect(
      decideHandoff({ message: '订单状态是什么意思？', confidence: 0.8, threshold }).action,
    ).toBe('answer');
  });

  it('hands off when retrieval confidence is below the threshold', () => {
    expect(
      decideHandoff({ message: 'Do you sell laser cutters?', confidence: 0.1, threshold }),
    ).toEqual({ action: 'handoff', reason: 'low_confidence' });
    expect(
      decideHandoff({ message: 'Is delivery free in Canberra?', confidence: 0.8, threshold }),
    ).toEqual({ action: 'answer' });
  });
});

describe('ticket records', () => {
  it('numbers tickets and hides other sessions', () => {
    const store = createTicketStore({ now: () => new Date('2026-01-15T00:00:00.000Z') });
    const first = store.create({
      sessionId: 'session1',
      language: 'zh',
      reason: 'explicit_request',
      question: '转人工',
    });
    store.create({
      sessionId: 'session2',
      language: 'en',
      reason: 'low_confidence',
      question: 'laser cutter',
    });
    expect(first).toMatchObject({
      id: 'TCK-0001',
      createdAt: '2026-01-15T00:00:00.000Z',
      sessionId: 'session1',
      language: 'zh',
      reason: 'explicit_request',
      question: '转人工',
      status: 'open',
    });
    expect(store.list('session1').map((ticket) => ticket.id)).toEqual(['TCK-0001']);
    expect(store.list('session2')).toHaveLength(1);
  });

  it('creates a ticket only when the plan hands off', () => {
    const store = createTicketStore({ now: () => new Date('2026-01-15T00:00:00.000Z') });
    const deps = { store, threshold, mode: 'mock' as const };

    const petg = planReply(
      { message: 'What nozzle temperature for PETG?', sessionId: 'session1' },
      deps,
    );
    expect(petg.action).toBe('answer');
    expect(petg.sources.map((source) => source.id)).toEqual(['filament.petg']);
    expect(petg.text).not.toContain('190');

    const answered = planReply(
      { message: 'Is delivery free in Canberra?', sessionId: 'session1' },
      deps,
    );
    expect(answered.action).toBe('answer');
    expect(answered.ticket).toBeNull();
    expect(store.list()).toHaveLength(0);

    const handed = planReply({ message: '请转人工', sessionId: 'session1' }, deps);
    expect(handed.action).toBe('handoff');
    expect(handed.language).toBe('zh');
    expect(handed.ticket).toMatchObject({
      id: 'TCK-0001',
      reason: 'explicit_request',
      language: 'zh',
      question: '请转人工',
    });
    expect(handed.text).toContain('TCK-0001');

    const lookup = planReply({ message: 'Where is order TF-1042?', sessionId: 'session1' }, deps);
    expect(lookup.ticket?.reason).toBe('order_lookup');

    const unsure = planReply(
      { message: 'Do you sell resin printers and laser cutters?', sessionId: 'session1' },
      deps,
    );
    expect(unsure.action).toBe('handoff');
    expect(unsure.ticket?.reason).toBe('low_confidence');
    expect(store.list('session1')).toHaveLength(3);
  });
});
