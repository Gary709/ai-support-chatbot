const EN_STOP = new Set([
  'a',
  'an',
  'the',
  'is',
  'are',
  'was',
  'were',
  'be',
  'to',
  'of',
  'for',
  'and',
  'or',
  'in',
  'on',
  'at',
  'my',
  'your',
  'you',
  'we',
  'i',
  'do',
  'does',
  'did',
  'how',
  'what',
  'when',
  'where',
  'which',
  'who',
  'can',
  'could',
  'please',
  'me',
  'us',
  'our',
  'it',
  'this',
  'that',
  'with',
  'from',
  'about',
  'if',
  'am',
  'will',
  'would',
  'should',
  'just',
  'than',
  'then',
  'into',
  'over',
  'again',
  'its',
]);

const ZH_STOP_CHARS = new Set([
  '的',
  '了',
  '吗',
  '呢',
  '吧',
  '啊',
  '呀',
  '是',
  '在',
  '我',
  '你',
  '您',
  '这',
  '那',
  '有',
  '和',
  '与',
  '或',
  '就',
  '也',
  '很',
  '都',
  '把',
  '被',
]);

const ZH_STOP_BIGRAMS = new Set([
  '怎么',
  '如何',
  '什么',
  '请问',
  '我们',
  '这个',
  '那个',
  '一下',
  '多少',
  '是否',
  '可以',
  '你们',
  '一个',
  '还是',
  '以及',
  '如果',
  '因为',
  '所以',
]);

export function tokenize(text: string): string[] {
  const tokens: string[] = [];
  const lower = text.toLowerCase();
  for (const match of lower.matchAll(/[a-z0-9]+/g)) {
    const word = match[0];
    if (word.length < 2 || EN_STOP.has(word)) continue;
    tokens.push(word);
  }
  // Character bigrams, so 免费 matches without a segmenter.
  for (const match of text.matchAll(/[\u4e00-\u9fff]+/g)) {
    const chars = [...match[0]].filter((char) => !ZH_STOP_CHARS.has(char));
    if (chars.length === 1) tokens.push(chars[0]);
    for (let index = 0; index < chars.length - 1; index += 1) {
      const bigram = chars[index] + chars[index + 1];
      if (ZH_STOP_BIGRAMS.has(bigram)) continue;
      tokens.push(bigram);
    }
  }
  return tokens;
}

export function overlapConfidence(query: string, docText: string): number {
  const queryTokens = [...new Set(tokenize(query))];
  if (queryTokens.length === 0) return 0;
  const docTokens = new Set(tokenize(docText));
  const hits = queryTokens.filter((token) => docTokens.has(token)).length;
  return hits / queryTokens.length;
}
