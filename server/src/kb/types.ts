import type { Lang } from '../types.js';

export type ArticleStatus = 'known' | 'todo' | 'person';

export type Article = {
  id: string;
  lang: Lang;
  title: string;
  tags: string[];
  status: ArticleStatus;
  summary: string;
  body: string;
  searchText: string;
};
