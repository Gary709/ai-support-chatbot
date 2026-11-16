import { articleInLanguage, searchKnowledge } from '../retrieval/search.js';
import { decideHandoff } from '../handoff/decide.js';
import type { TicketStore } from '../handoff/store.js';
import { loadKnowledge } from '../kb/load.js';
import type { Article } from '../kb/types.js';
import { resolveLanguage } from '../language/detect.js';
import { buildOpenAiMessages, type OpenAiMessage } from '../llm/messages.js';
import { composeClarify, composeGreeting, composeHandoff, composeMockAnswer } from '../llm/mock.js';
import type {
  HistoryMessage,
  HandoffReason,
  Lang,
  LanguageMode,
  LlmMode,
  Source,
  Ticket,
} from '../types.js';

export type Plan = {
  language: Lang;
  action: 'greet' | 'clarify' | 'answer' | 'handoff';
  reason: HandoffReason | null;
  sources: Source[];
  ticket: Ticket | null;
  mode: LlmMode;
  text: string;
  openaiMessages: OpenAiMessage[] | null;
};

export function planReply(
  input: {
    message: string;
    history?: HistoryMessage[];
    languageMode?: LanguageMode;
    sessionId: string;
  },
  deps: {
    articles?: Article[];
    store: TicketStore;
    threshold: number;
    mode: LlmMode;
  },
): Plan {
  const articles = deps.articles ?? loadKnowledge();
  const message = input.message.trim();
  const language = resolveLanguage(message, input.languageMode ?? 'auto');
  const hits = searchKnowledge(message, articles, 3);
  const confidence = hits[0]?.confidence ?? 0;
  const decision = decideHandoff({
    message,
    confidence,
    threshold: deps.threshold,
  });

  const base = {
    language,
    mode: deps.mode,
    sources: [] as Source[],
    ticket: null as Ticket | null,
    reason: null as HandoffReason | null,
    openaiMessages: null as OpenAiMessage[] | null,
  };

  if (decision.action === 'greet') {
    return { ...base, action: 'greet', text: composeGreeting(language) };
  }
  if (decision.action === 'clarify') {
    return { ...base, action: 'clarify', text: composeClarify(language) };
  }
  const top = hits[0];
  if (decision.action === 'handoff' || !top) {
    const reason = decision.action === 'handoff' ? decision.reason : 'low_confidence';
    const ticket = deps.store.create({
      sessionId: input.sessionId,
      language,
      reason,
      question: message,
    });
    return {
      ...base,
      action: 'handoff',
      reason,
      ticket,
      text: composeHandoff(language, ticket),
    };
  }

  // One note per reply. A near-miss second note (PLA settings on a PETG question) makes the answer wander.
  const match = articleInLanguage(articles, top.id, language);
  const chosen = match ? [match] : [];
  const sources = chosen.map((article) => ({ id: article.id, title: article.title }));

  if (deps.mode === 'openai') {
    return {
      ...base,
      action: 'answer',
      sources,
      text: '',
      openaiMessages: buildOpenAiMessages({
        language,
        articles: chosen,
        history: input.history ?? [],
        question: message,
      }),
    };
  }

  return {
    ...base,
    action: 'answer',
    sources,
    text: composeMockAnswer(language, chosen),
  };
}
