import { useEffect, useRef, useState } from 'react';
import { fetchHealth, fetchTickets, streamChat } from './api';
import { Composer } from './components/Composer';
import { Sidebar } from './components/Sidebar';
import { Transcript } from './components/Transcript';
import { copy } from './i18n';
import type { ChatMessage, Health, Lang, LanguageMode, Ticket } from './types';

function sessionId(): string {
  const key = 'tinyfab-session';
  const existing = sessionStorage.getItem(key);
  if (existing && /^[A-Za-z0-9_-]{6,80}$/.test(existing)) return existing;
  const created = crypto.randomUUID().replace(/-/g, '').slice(0, 24);
  sessionStorage.setItem(key, created);
  return created;
}

function welcome(language: Lang): ChatMessage {
  return {
    id: 'welcome',
    role: 'assistant',
    content: copy[language].welcome,
    sources: [],
    ticket: null,
    reason: null,
    streaming: false,
    error: false,
  };
}

export function App() {
  const [languageMode, setLanguageMode] = useState<LanguageMode>('auto');
  const [detected, setDetected] = useState<Lang>('en');
  const [messages, setMessages] = useState<ChatMessage[]>(() => [welcome('en')]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [health, setHealth] = useState<Health | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const session = useRef('');
  const started = useRef(false);
  const uiLang: Lang = languageMode === 'auto' ? detected : languageMode;
  const text = copy[uiLang];

  useEffect(() => {
    session.current = sessionId();
    fetchHealth()
      .then(setHealth)
      .catch(() => setHealth({ ok: false, mode: 'mock', model: null }));
    fetchTickets(session.current)
      .then((payload) => setTickets(payload.tickets))
      .catch(() => setTickets([]));
  }, []);

  useEffect(() => {
    document.documentElement.lang = uiLang === 'zh' ? 'zh-Hans' : 'en';
    if (started.current) return;
    setMessages([welcome(uiLang)]);
  }, [uiLang]);

  async function refreshTickets() {
    try {
      const payload = await fetchTickets(session.current);
      setTickets(payload.tickets);
    } catch {
      // The chat already shows a ticket card when one was opened.
    }
  }

  async function send(raw: string) {
    const message = raw.trim();
    if (!message || busy) return;
    started.current = true;
    const history = messages
      .filter((item) => item.id !== 'welcome' && item.content && !item.error)
      .slice(-8)
      .map((item) => ({ role: item.role, content: item.content }));
    const assistantId = crypto.randomUUID();
    setDraft('');
    setBusy(true);
    setMessages((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        role: 'user',
        content: message,
        sources: [],
        ticket: null,
        reason: null,
        streaming: false,
        error: false,
      },
      {
        id: assistantId,
        role: 'assistant',
        content: '',
        sources: [],
        ticket: null,
        reason: null,
        streaming: true,
        error: false,
      },
    ]);

    const patch = (update: (message: ChatMessage) => ChatMessage) => {
      setMessages((current) =>
        current.map((item) => (item.id === assistantId ? update(item) : item)),
      );
    };

    try {
      await streamChat({ message, history, languageMode, sessionId: session.current }, (event) => {
        if (event.type === 'meta') {
          if (languageMode === 'auto') setDetected(event.language);
          patch((item) => ({
            ...item,
            sources: event.sources,
            ticket: event.ticket,
            reason: event.reason,
          }));
        } else if (event.type === 'token') {
          patch((item) => ({ ...item, content: item.content + event.text }));
        } else if (event.type === 'error') {
          patch((item) => ({
            ...item,
            content: item.content || event.message,
            error: true,
            streaming: false,
          }));
        } else if (event.type === 'done') {
          patch((item) => ({ ...item, streaming: false }));
        }
      });
    } catch (error) {
      const detail = error instanceof Error ? error.message : text.networkError;
      patch((item) => ({
        ...item,
        content: item.content || detail || text.networkError,
        error: true,
        streaming: false,
      }));
    } finally {
      patch((item) => ({ ...item, streaming: false }));
      setBusy(false);
      await refreshTickets();
    }
  }

  return (
    <div className="app">
      <div className="shell">
        <Sidebar
          copy={text}
          languageMode={languageMode}
          onLanguageMode={setLanguageMode}
          health={health}
          tickets={tickets}
        />
        <main className="chat">
          <header className="chat-head">
            <div>
              <h2>{text.chatTitle}</h2>
              <p>{text.chatSub}</p>
            </div>
          </header>
          <Transcript copy={text} messages={messages} />
          <Composer copy={text} draft={draft} busy={busy} onDraft={setDraft} onSend={send} />
        </main>
      </div>
    </div>
  );
}
