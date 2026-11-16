import { useEffect, useRef } from 'react';
import type { Copy } from '../i18n';

type ComposerProps = {
  copy: Copy;
  draft: string;
  busy: boolean;
  onDraft: (value: string) => void;
  onSend: (value: string) => void;
};

export function Composer({ copy, draft, busy, onDraft, onSend }: ComposerProps) {
  const fieldRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const field = fieldRef.current;
    if (!field) return;
    field.style.height = '0px';
    field.style.height = `${Math.min(field.scrollHeight, 140)}px`;
  }, [draft]);

  return (
    <form
      className="composer"
      onSubmit={(event) => {
        event.preventDefault();
        onSend(draft);
      }}
    >
      <div className="suggestions">
        <p>{copy.suggestionsLabel}</p>
        <div>
          {copy.suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              disabled={busy}
              onClick={() => onSend(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
      <div className="composer-row">
        <label className="sr-only" htmlFor="message">
          {copy.messageLabel}
        </label>
        <textarea
          id="message"
          ref={fieldRef}
          rows={1}
          maxLength={2000}
          placeholder={copy.placeholder}
          value={draft}
          disabled={busy}
          onChange={(event) => onDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              onSend(draft);
            }
          }}
        />
        <button type="submit" className="send" disabled={busy || draft.trim() === ''}>
          {busy ? copy.sending : copy.send}
        </button>
      </div>
      {draft.length > 1500 && <p className="count">{draft.length} / 2000</p>}
      <p className="footer-note">{copy.footer}</p>
    </form>
  );
}
