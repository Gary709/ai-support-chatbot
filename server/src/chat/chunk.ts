export function chunkText(text: string, size = 16): string[] {
  if (!text) return [];
  const chunks: string[] = [];
  let buffer = '';
  const flush = () => {
    if (!buffer) return;
    chunks.push(buffer);
    buffer = '';
  };
  for (const part of text.split(/(\s+)/)) {
    if (part.length > size) {
      flush();
      for (let index = 0; index < part.length; index += size) {
        chunks.push(part.slice(index, index + size));
      }
      continue;
    }
    buffer += part;
    if (buffer.length >= size) flush();
  }
  flush();
  return chunks;
}

export function sleep(ms: number): Promise<void> {
  if (ms <= 0) return Promise.resolve();
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
