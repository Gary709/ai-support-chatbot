import type { Health, LanguageMode, ServerEvent } from './types';

export async function fetchHealth(): Promise<Health> {
  const response = await fetch('/api/health');
  if (!response.ok) throw new Error('health failed');
  return (await response.json()) as Health;
}

export async function fetchTickets(sessionId: string) {
  const response = await fetch(`/api/tickets?sessionId=${encodeURIComponent(sessionId)}`);
  if (!response.ok) throw new Error('tickets failed');
  return (await response.json()) as { tickets: import('./types').Ticket[] };
}

export async function streamChat(
  body: {
    message: string;
    history: { role: 'user' | 'assistant'; content: string }[];
    languageMode: LanguageMode;
    sessionId: string;
  },
  onEvent: (event: ServerEvent) => void,
  signal?: AbortSignal,
): Promise<void> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    },
    body: JSON.stringify(body),
    signal,
  });

  if (!response.ok || !response.body) {
    let detail = 'Chat request failed';
    try {
      const payload = (await response.json()) as { error?: string };
      if (payload.error) detail = payload.error;
    } catch {
      // The body was not JSON.
    }
    throw new Error(detail);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const blocks = buffer.split('\n\n');
    buffer = blocks.pop() ?? '';
    for (const block of blocks) {
      const data = block
        .split('\n')
        .filter((line) => line.startsWith('data:'))
        .map((line) => line.slice(5).trim())
        .join('\n');
      if (!data) continue;
      onEvent(JSON.parse(data) as ServerEvent);
    }
  }
}
