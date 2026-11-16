import type { HandoffReason } from '../types.js';

export type Decision =
  | { action: 'greet' }
  | { action: 'clarify' }
  | { action: 'answer' }
  | { action: 'handoff'; reason: HandoffReason };

const GREETINGS = [
  /^(?:hi|hello|hey|hiya|good\s+(?:morning|afternoon|evening))(?:\s+there)?[\s!！.。,，]*$/i,
  /^(?:thanks|thank you|thankyou|cheers|many thanks)(?:\s+(?:so much|a lot|for (?:that|the help|your help)))?[\s!！.。]*$/i,
  /^(?:你好|您好|嗨|谢谢|多谢|早上好|下午好|晚上好)[\s!！.。,，]*$/,
];

const AFFIRMATIONS = [
  /^(?:yes|yeah|yep|ok|okay|sure|no|nope|好|好的|是的|对|嗯|不用了|没有)[\s!！.。]*$/i,
];

const EXPLICIT = [
  /\btalk to (?:a )?(?:human|person|someone|agent)\b/i,
  /\bspeak (?:to|with) (?:a )?(?:human|person|someone|agent)\b/i,
  /\bhand (?:me|this) (?:off|over) to\b/i,
  /\breal person\b/i,
  /\bhuman (?:agent|support)\b/i,
  /转人工/,
  /人工客服/,
  /找人工/,
  /转接人工/,
  /真人客服/,
];

const GENERAL_ORDER_HELP =
  /how (?:do|can) i (?:track|check)|what (?:does|do) .{0,40}?status(?:es)? mean|订单状态(?:是什么|怎么|的意思)|如何(?:查询|查看)订单|怎么查订单|状态是什么意思/i;

const MATERIAL_OR_COLOUR = [
  /\b(?:which|what) (?:filament|material|colou?r)\b/i,
  /\bcolou?r should\b/i,
  /\b(?:pla|petg)\b[^.\n]{0,40}\bor\b[^.\n]{0,20}\b(?:pla|petg)\b/i,
  /什么颜色|哪种颜色|有什么颜色|推荐颜色|选哪种|哪种线材|用什么料|PLA还是|PETG还是/,
];

const QUANTITY = [
  /\bhow many\b/i,
  /\bhow much (?!is\b|does\b|are\b)/i,
  /\b\d+\s?(?:kg|kgs|rolls?|spools?)\b/i,
  /多少卷|多少公斤|要多少|买多少/,
];

export function needsGary(message: string): boolean {
  return (
    MATERIAL_OR_COLOUR.some((pattern) => pattern.test(message)) ||
    QUANTITY.some((pattern) => pattern.test(message))
  );
}

export function isGreeting(message: string): boolean {
  return GREETINGS.some((pattern) => pattern.test(message.trim()));
}

export function isExplicitHandoff(message: string): boolean {
  return EXPLICIT.some((pattern) => pattern.test(message));
}

export function isSpecificOrderLookup(message: string): boolean {
  const text = message.trim();
  const hasOrderId = /\b(?:tf|tfb)[- ]?\d{3,}\b/i.test(text) || /#\s?\d{3,}/.test(text);
  if (
    GENERAL_ORDER_HELP.test(text) &&
    !hasOrderId &&
    !/订单号|运单号|快递单号|物流单号/.test(text)
  ) {
    return false;
  }
  if (hasOrderId) return true;
  if (/\border\s*(?:number|no\.?|#|id)\b/i.test(text) && /\d/.test(text)) return true;
  if (/订单号|运单号|快递单号|物流单号/.test(text)) return true;
  if (
    /\b(?:where(?:'s| is)|track|status of|check(?: on)?|update on)\b[^.]{0,48}\b(?:my )?order\b/i.test(
      text,
    )
  ) {
    return true;
  }
  if (/我的订单|订单到哪|查(?:一下)?我的|快递到了吗|发货了吗/.test(text)) return true;
  return false;
}

export function decideHandoff(input: {
  message: string;
  confidence: number;
  threshold: number;
}): Decision {
  const message = input.message.trim();
  if (!message) return { action: 'clarify' };
  if (isGreeting(message)) return { action: 'greet' };
  if (AFFIRMATIONS.some((pattern) => pattern.test(message))) return { action: 'clarify' };
  if (isExplicitHandoff(message)) return { action: 'handoff', reason: 'explicit_request' };
  if (isSpecificOrderLookup(message)) return { action: 'handoff', reason: 'order_lookup' };
  if (needsGary(message)) return { action: 'handoff', reason: 'ask_gary' };
  if (!(input.confidence >= input.threshold)) {
    return { action: 'handoff', reason: 'low_confidence' };
  }
  return { action: 'answer' };
}
