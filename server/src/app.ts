import cors from 'cors';
import express, { type ErrorRequestHandler, type Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { chunkText, sleep } from './chat/chunk.js';
import { planReply } from './chat/plan.js';
import { type AppConfig, readConfig, repoRoot } from './config.js';
import { createTicketStore, type TicketStore } from './handoff/store.js';
import { loadKnowledge } from './kb/load.js';
import type { Article } from './kb/types.js';
import { streamOpenAi } from './llm/openai.js';
import type { HistoryMessage, LanguageMode, ServerEvent } from './types.js';

export type AppDeps = {
  config?: AppConfig;
  store?: TicketStore;
  articles?: Article[];
};

function writeEvent(res: Response, event: ServerEvent): void {
  res.write(`data: ${JSON.stringify(event)}\n\n`);
}

function cleanSession(value: unknown): string {
  if (typeof value !== 'string') return 'anonymous';
  const trimmed = value.trim();
  return /^[A-Za-z0-9_-]{6,80}$/.test(trimmed) ? trimmed : 'anonymous';
}

function cleanMode(value: unknown): LanguageMode {
  return value === 'en' || value === 'zh' || value === 'auto' ? value : 'auto';
}

function cleanHistory(value: unknown): HistoryMessage[] {
  if (!Array.isArray(value)) return [];
  const history: HistoryMessage[] = [];
  for (const item of value.slice(-8)) {
    if (!item || typeof item !== 'object') continue;
    const record = item as { role?: unknown; content?: unknown };
    if (
      (record.role !== 'user' && record.role !== 'assistant') ||
      typeof record.content !== 'string'
    ) {
      continue;
    }
    const content = record.content.trim().slice(0, 2000);
    if (!content) continue;
    history.push({ role: record.role, content });
  }
  return history;
}

export function createApp(deps: AppDeps = {}) {
  const config = deps.config ?? readConfig();
  const store = deps.store ?? createTicketStore();
  const articles = deps.articles ?? loadKnowledge();
  const app = express();
  app.disable('x-powered-by');
  app.use(cors());
  app.use(express.json({ limit: '64kb' }));

  app.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      mode: config.mode,
      model: config.mode === 'openai' ? config.openaiModel : null,
    });
  });

  app.get('/api/tickets', (req, res) => {
    const sessionId = cleanSession(req.query.sessionId);
    res.json({ tickets: store.list(sessionId) });
  });

  app.post('/api/chat', async (req, res) => {
    const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
    if (!message) {
      res.status(400).json({ error: 'Message is empty' });
      return;
    }
    if (message.length > 2000) {
      res.status(400).json({ error: 'Message is too long' });
      return;
    }

    const plan = planReply(
      {
        message,
        history: cleanHistory(req.body?.history),
        languageMode: cleanMode(req.body?.languageMode),
        sessionId: cleanSession(req.body?.sessionId),
      },
      { articles, store, threshold: config.threshold, mode: config.mode },
    );

    res.status(200);
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    let closed = false;
    // The request `close` event also fires once the body has been read.
    // Watch the response instead, and ignore the close that follows res.end().
    res.on('close', () => {
      if (!res.writableEnded) closed = true;
    });

    writeEvent(res, {
      type: 'meta',
      language: plan.language,
      sources: plan.sources,
      handoff: plan.action === 'handoff',
      reason: plan.reason,
      ticket: plan.ticket,
      mode: plan.mode,
    });

    try {
      if (plan.action === 'answer' && plan.mode === 'openai' && plan.openaiMessages) {
        const apiKey = process.env.OPENAI_API_KEY?.trim();
        if (!apiKey) throw new Error('OPENAI_API_KEY is not set');
        for await (const token of streamOpenAi({
          apiKey,
          model: config.openaiModel,
          messages: plan.openaiMessages,
        })) {
          if (closed) return;
          writeEvent(res, { type: 'token', text: token });
        }
      } else {
        for (const token of chunkText(plan.text)) {
          if (closed) return;
          writeEvent(res, { type: 'token', text: token });
          await sleep(config.streamDelayMs);
        }
      }
      if (!closed) writeEvent(res, { type: 'done' });
    } catch (error) {
      const messageText = error instanceof Error ? error.message : 'Reply failed';
      if (!closed) writeEvent(res, { type: 'error', message: messageText });
    } finally {
      res.end();
    }
  });

  const clientDist = path.join(repoRoot(), 'client', 'dist');
  if (fs.existsSync(path.join(clientDist, 'index.html'))) {
    app.use(express.static(clientDist));
    app.use((req, res, next) => {
      if (req.method !== 'GET' || req.path.startsWith('/api')) {
        next();
        return;
      }
      res.sendFile(path.join(clientDist, 'index.html'));
    });
  }

  const jsonError: ErrorRequestHandler = (err, _req, res, next) => {
    if (err instanceof SyntaxError && 'body' in err) {
      res.status(400).json({ error: 'Invalid JSON' });
      return;
    }
    next(err);
  };
  app.use(jsonError);

  return app;
}

export function start(config: AppConfig = readConfig()): void {
  const app = createApp({ config });
  app.listen(config.port, '0.0.0.0', () => {
    console.log(`TinyFab support listening on ${config.port} (${config.mode})`);
  });
}
