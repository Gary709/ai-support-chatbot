import type { Lang } from '../types.js';

export type Article = {
  id: string;
  lang: Lang;
  title: string;
  tags: string[];
  /** First paragraph. The mock narrator speaks this verbatim. */
  summary: string;
  /** Remaining paragraphs. Retrieval and the live model see summary + body. */
  body: string;
  searchText: string;
};
