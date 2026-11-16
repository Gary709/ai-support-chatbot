export type Lang = 'en' | 'zh';

export type LanguageMode = 'auto' | Lang;

export type LlmMode = 'mock' | 'openai';

export type HandoffReason =
  'explicit_request' | 'low_confidence' | 'order_lookup' | 'unconfirmed' | 'ask_gary';

export type Source = {
  id: string;
  title: string;
};

export type Ticket = {
  id: string;
  createdAt: string;
  sessionId: string;
  language: Lang;
  reason: HandoffReason;
  question: string;
  status: 'open';
};

export type ServerEvent =
  | {
      type: 'meta';
      language: Lang;
      sources: Source[];
      handoff: boolean;
      reason: HandoffReason | null;
      ticket: Ticket | null;
      mode: LlmMode;
    }
  | { type: 'token'; text: string }
  | { type: 'done' }
  | { type: 'error'; message: string };

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources: Source[];
  ticket: Ticket | null;
  reason: HandoffReason | null;
  streaming: boolean;
  error: boolean;
};

export type Health =
  { ok: true; mode: LlmMode; model: string | null } | { ok: false; mode: LlmMode; model: null };
