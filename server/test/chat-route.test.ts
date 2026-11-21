import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { readConfig } from '../src/config.js';
import { createTicketStore } from '../src/handoff/store.js';
import type { ServerEvent } from '../src/types.js';

let server: Server;
let base: string;

beforeAll(async () => {
  const app = createApp({
    config: { ...readConfig({}), streamDelayMs: 0, mode: 'mock' },
    store: createTicketStore({ now: () => new Date('2026-01-15T00:00:00.000Z') }),
  });
  server = app.listen(0, '127.0.0.1');
  await new Promise<void>((resolve) => server.once('listening', resolve));
  const address = server.address() as AddressInfo;
  base = `http://127.0.0.1:${address.port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

async function postChat(body: unknown): Promise<ServerEvent[]> {
  const response = await fetch(`${base}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  expect(response.status).toBe(200);
  const raw = await response.text();
  return raw
    .split('\n\n')
    .map((block) => block.trim())
    .filter((block) => block.startsWith('data:'))
    .map((block) => JSON.parse(block.slice(5)) as ServerEvent);
}

describe('chat route', () => {
  it('reports mock mode when no API key is configured', async () => {
    const response = await fetch(`${base}/api/health`);
    expect(await response.json()).toEqual({ ok: true, mode: 'mock', model: null });
  });

  it('streams a grounded English answer', async () => {
    const events = await postChat({
      message: 'Is delivery free in Canberra?',
      sessionId: 'session1',
      languageMode: 'auto',
    });
    expect(events[0]).toMatchObject({
      type: 'meta',
      language: 'en',
      handoff: false,
      ticket: null,
      mode: 'mock',
    });
    const text = events
      .filter((event) => event.type === 'token')
      .map((event) => (event.type === 'token' ? event.text : ''))
      .join('');
    expect(text.toLowerCase()).toContain('free delivery');
    expect(events.at(-1)).toEqual({ type: 'done' });
  });

  it('records a ticket for a specific order and hides it from other sessions', async () => {
    const events = await postChat({
      message: 'Where is order TF-1042?',
      sessionId: 'session1',
    });
    expect(events[0]).toMatchObject({
      type: 'meta',
      handoff: true,
      reason: 'order_lookup',
    });
    const own = await fetch(`${base}/api/tickets?sessionId=session1`);
    const other = await fetch(`${base}/api/tickets?sessionId=session2`);
    const ownBody = (await own.json()) as { tickets: { reason: string }[] };
    const otherBody = (await other.json()) as { tickets: unknown[] };
    expect(ownBody.tickets.some((ticket) => ticket.reason === 'order_lookup')).toBe(true);
    expect(otherBody.tickets).toEqual([]);
  });

  it('rejects an empty message', async () => {
    const response = await fetch(`${base}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: '   ' }),
    });
    expect(response.status).toBe(400);
  });
});
