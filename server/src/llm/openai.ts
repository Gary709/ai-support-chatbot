export type OpenAiMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

type OpenAiDelta = {
  choices?: { delta?: { content?: string } }[];
};

export async function* streamOpenAi(input: {
  apiKey: string;
  model: string;
  messages: OpenAiMessage[];
  signal?: AbortSignal;
}): AsyncGenerator<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    signal: input.signal,
    headers: {
      Authorization: `Bearer ${input.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: input.model,
      temperature: 0.2,
      stream: true,
      messages: input.messages,
    }),
  });

  if (!response.ok || !response.body) {
    throw new Error(`OpenAI request failed (${response.status})`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const data = trimmed.slice(5).trim();
      if (!data || data === '[DONE]') continue;
      let parsed: OpenAiDelta;
      try {
        parsed = JSON.parse(data) as OpenAiDelta;
      } catch {
        continue;
      }
      const text = parsed.choices?.[0]?.delta?.content;
      if (text) yield text;
    }
  }
}
