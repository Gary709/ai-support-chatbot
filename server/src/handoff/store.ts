import type { HandoffReason, Lang, Ticket } from '../types.js';

export type TicketDraft = {
  sessionId: string;
  language: Lang;
  reason: HandoffReason;
  question: string;
};

export type TicketStore = {
  create(draft: TicketDraft): Ticket;
  list(sessionId?: string): Ticket[];
};

export function createTicketStore(options?: { now?: () => Date }): TicketStore {
  const tickets: Ticket[] = [];
  let sequence = 0;
  const now = options?.now ?? (() => new Date());
  return {
    create(draft) {
      sequence += 1;
      const ticket: Ticket = {
        id: `TCK-${String(sequence).padStart(4, '0')}`,
        createdAt: now().toISOString(),
        sessionId: draft.sessionId,
        language: draft.language,
        reason: draft.reason,
        question: draft.question.slice(0, 500),
        status: 'open',
      };
      tickets.push(ticket);
      return ticket;
    },
    list(sessionId) {
      return tickets.filter((ticket) => !sessionId || ticket.sessionId === sessionId);
    },
  };
}
