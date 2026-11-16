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
        "You answer messages for TinyFab 3D, Gary Chen's filament shop in Canberra (https://tinyfab3d.com.au).",
        `Reply in ${languageName}.`,
        'Use only the notes below. Do not invent a return rule, a postage price, a delivery time, a colour, or a quantity.',
        'Prices are in AUD. Never ask for a card number.',
      ].join(' '),
    },
    ...history,
    {
      role: 'user',
      content: `Knowledge excerpts:\n${excerpts}\n\nCustomer question:\n${input.question}`,
    },
  ];
}
