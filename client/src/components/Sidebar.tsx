import type { Copy } from '../i18n';
import type { Health, LanguageMode, Ticket } from '../types';

type SidebarProps = {
  copy: Copy;
  languageMode: LanguageMode;
  onLanguageMode: (mode: LanguageMode) => void;
  health: Health | null;
  tickets: Ticket[];
};

export function Sidebar({ copy, languageMode, onLanguageMode, health, tickets }: SidebarProps) {
  const modeLabel = !health
    ? copy.thinking
    : !health.ok
      ? copy.offline
      : health.mode === 'openai'
        ? copy.modeLive(health.model ?? 'openai')
        : copy.modeMock;

  return (
    <aside className="sidebar">
      <div className="brand">
        <p className="eyebrow">Canberra</p>
        <h1>TinyFab 3D</h1>
        <a className="shop-link" href="https://tinyfab3d.com.au">
          tinyfab3d.com.au
        </a>
      </div>
      <p className="lede">{copy.lede}</p>
      <p className={`mode ${health && !health.ok ? 'mode-offline' : ''}`}>{modeLabel}</p>

      <fieldset className="language">
        <legend>{copy.language}</legend>
        <div className="segmented" role="radiogroup" aria-label={copy.language}>
          {(
            [
              ['auto', copy.auto],
              ['en', copy.english],
              ['zh', copy.chinese],
            ] as const
          ).map(([value, label]) => (
            <label key={value} className={languageMode === value ? 'is-selected' : ''}>
              <input
                type="radio"
                name="language"
                value={value}
                checked={languageMode === value}
                onChange={() => onLanguageMode(value)}
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="topics">
        <p className="aside-label">{copy.topicsLabel}</p>
        <ul>
          {copy.topics.map((topic) => (
            <li key={topic}>{topic}</li>
          ))}
        </ul>
      </div>

      <div className="ticket-block">
        <p className="aside-label">{copy.ticketsLabel}</p>
        {tickets.length === 0 ? (
          <p className="ticket-empty">{copy.noTickets}</p>
        ) : (
          <ul className="ticket-list">
            {tickets.map((ticket) => (
              <li key={ticket.id}>
                <span>{ticket.id}</span>
                <small>{copy.reasons[ticket.reason]}</small>
              </li>
            ))}
          </ul>
        )}
      </div>
      <p className="demo-note">{copy.demo}</p>
    </aside>
  );
}
