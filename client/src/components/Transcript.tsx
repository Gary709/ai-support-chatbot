import { useEffect, useRef, useState } from 'react';
import type { Copy } from '../i18n';
import type { ChatMessage } from '../types';

type TranscriptProps = {
  copy: Copy;
  messages: ChatMessage[];
};

export function Transcript({ copy, messages }: TranscriptProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [messages]);

  async function copyId(id: string) {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
    } catch {
      setCopiedId(null);
    }
  }

  return (
    <ol className="transcript" aria-live="polite">
      {messages.map((message) => (
        <li key={message.id} className={`turn ${message.role}`}>
          <div className={`bubble ${message.error ? 'is-error' : ''}`}>
            {message.streaming && message.content === '' ? (
              <span className="pending">{copy.thinking}</span>
            ) : (
              message.content
            )}
            {message.streaming && message.content !== '' && (
              <span className="caret" aria-hidden="true" />
            )}
          </div>
          {message.sources.length > 0 && (
            <p className="sources">
              <span>{copy.sources}</span>
              {message.sources.map((source) => (
                <em key={source.id}>{source.title}</em>
              ))}
            </p>
          )}
          {message.ticket && (
            <article className="ticket-card">
              <header>
                <strong>
                  {copy.ticket} {message.ticket.id}
                </strong>
                <span>{copy.open}</span>
              </header>
              <p>{copy.reasons[message.ticket.reason]}</p>
              <button type="button" onClick={() => copyId(message.ticket!.id)}>
                {copiedId === message.ticket.id ? copy.copied : copy.copyId}
              </button>
            </article>
          )}
        </li>
      ))}
      <div ref={bottomRef} />
    </ol>
  );
}
