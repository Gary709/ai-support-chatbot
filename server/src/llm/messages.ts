import type { Article } from '../kb/types.js';
import type { HistoryMessage, Lang } from '../types.js';

export type OpenAiMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export function buildOpenAiMessages(input: {
  language: Lang;
  articles: Article[];
  history: HistoryMessage[];
  question: string;
}): OpenAiMessage[] {
  const languageName = input.language === 'zh' ? 'Simplified Chinese' : 'English';
  const excerpts = input.articles
    .map((article) => `## ${article.title}\n${article.summary}\n\n${article.body}`.trim())
    .join('\n\n');
  const history = input.history.slice(-8).map((message) => ({
    role: message.role,
    content: message.content,
  }));

  return [
    {
      role: 'system',
      content: [
        'You are the customer-support assistant for TinyFab 3D, a small Australian Shopify store that sells 3D printing filament (PLA, PETG, and TPU).',
        'Free delivery applies in Canberra. Most restocks travel by sea from China and take about one and a half months.',
        `Reply in ${languageName}.`,
        'Use only the knowledge excerpts in the user message. If they do not contain the answer, say you are not sure. Do not invent prices, dates, tracking numbers, or policies.',
        'Be concise and specific. Never ask for a card number.',
      ].join(' '),
    },
    ...history,
    {
      role: 'user',
      content: `Knowledge excerpts:\n${excerpts}\n\nCustomer question:\n${input.question}`,
    },
  ];
}
