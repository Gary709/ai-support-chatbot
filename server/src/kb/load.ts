import fs from 'node:fs';
import path from 'node:path';
import { repoRoot } from '../config.js';
import { parseArticle } from './parse.js';
import type { Article } from './types.js';

let cached: Article[] | null = null;

function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return entry.name.endsWith('.md') ? [full] : [];
  });
}

export function knowledgeDir(): string {
  return path.join(repoRoot(), 'knowledge');
}

export function loadKnowledge(): Article[] {
  if (cached) return cached;
  const files = walk(knowledgeDir()).sort();
  if (files.length === 0) {
    throw new Error(`No knowledge articles found in ${knowledgeDir()}`);
  }
  const articles = files.map((file) => parseArticle(fs.readFileSync(file, 'utf8'), file));
  const seen = new Set<string>();
  for (const article of articles) {
    const key = `${article.id}::${article.lang}`;
    if (seen.has(key)) throw new Error(`Duplicate knowledge article ${key}`);
    seen.add(key);
  }
  const ids = new Set(articles.map((article) => article.id));
  for (const id of ids) {
    for (const lang of ['en', 'zh'] as const) {
      if (!seen.has(`${id}::${lang}`)) {
        throw new Error(`Knowledge article ${id} is missing a ${lang} version`);
      }
    }
  }
  cached = articles;
  return articles;
}

export function resetKnowledgeCache(): void {
  cached = null;
}
