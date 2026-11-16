import type { Lang } from '../types.js';
import type { Article, ArticleStatus } from './types.js';

function field(block: string, key: string, file: string): string {
  const line = block.split('\n').find((entry) => entry.startsWith(`${key}:`));
  if (!line) throw new Error(`Knowledge file ${file} is missing "${key}"`);
  return line.slice(key.length + 1).trim();
}

function optionalField(block: string, key: string): string | undefined {
  const line = block.split('\n').find((entry) => entry.startsWith(`${key}:`));
  if (!line) return undefined;
  return line.slice(key.length + 1).trim();
}

export function parseArticle(raw: string, file: string): Article {
  const text = raw.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  if (!text.startsWith('---\n')) {
    throw new Error(`Knowledge file ${file} is missing frontmatter`);
  }
  const end = text.indexOf('\n---\n', 4);
  if (end === -1) throw new Error(`Knowledge file ${file} has unclosed frontmatter`);
  const frontmatter = text.slice(4, end);
  const markdown = text.slice(end + 5).trim();
  const paragraphs = markdown
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
  if (paragraphs.length === 0) throw new Error(`Knowledge file ${file} has no body`);

  const lang = field(frontmatter, 'lang', file);
  if (lang !== 'en' && lang !== 'zh') {
    throw new Error(`Knowledge file ${file} has unsupported lang "${lang}"`);
  }

  const title = field(frontmatter, 'title', file);
  const status = optionalField(frontmatter, 'status') ?? 'known';
  if (status !== 'known' && status !== 'todo' && status !== 'person') {
    throw new Error(`Knowledge file ${file} has unsupported status "${status}"`);
  }
  const tags = field(frontmatter, 'tags', file)
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
  const summary = paragraphs[0];
  const body = paragraphs.slice(1).join('\n\n');

  return {
    id: field(frontmatter, 'id', file),
    lang: lang as Lang,
    title,
    tags,
    status: status as ArticleStatus,
    summary,
    body,
    searchText: [title, tags.join(' '), summary, body].join('\n'),
  };
}
