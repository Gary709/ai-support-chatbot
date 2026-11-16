import type { HandoffReason, Lang } from './types';

export type Copy = {
  lede: string;
  demo: string;
  language: string;
  auto: string;
  english: string;
  chinese: string;
  topicsLabel: string;
  topics: string[];
  legend: string;
  pla: string;
  petg: string;
  tpu: string;
  ticketsLabel: string;
  noTickets: string;
  chatTitle: string;
  chatSub: string;
  suggestionsLabel: string;
  suggestions: string[];
  placeholder: string;
  messageLabel: string;
  send: string;
  sending: string;
  thinking: string;
  sources: string;
  ticket: string;
  open: string;
  copyId: string;
  copied: string;
  reasons: Record<HandoffReason, string>;
  modeMock: string;
  modeLive: (model: string) => string;
  offline: string;
  networkError: string;
  footer: string;
  welcome: string;
};

export const copy: Record<Lang, Copy> = {
  en: {
    lede: 'Filament for Canberra makers. In-stock spools leave from here. Everything else comes by sea from China, about a month and a half.',
    demo: 'Demo desk. These notes are a realistic TinyFab knowledge base, not a live Shopify connection.',
    language: 'Reply language',
    auto: 'Auto',
    english: 'EN',
    chinese: '中文',
    topicsLabel: 'On the desk',
    topics: [
      'Free delivery in Canberra',
      'Sea freight from China',
      'Choosing PLA, PETG, or TPU',
      'Nozzle and bed temperatures',
      'Returns on unopened spools',
      'What an order status means',
    ],
    legend: 'On the spool',
    pla: 'PLA · easy',
    petg: 'PETG · tough',
    tpu: 'TPU · flexible',
    ticketsLabel: 'Handoffs this session',
    noTickets: 'None yet. A specific order, or a question the notes do not cover, opens one.',
    chatTitle: 'Support chat',
    chatSub: 'Ask in English or Mandarin. The reply follows your message.',
    suggestionsLabel: 'Try asking',
    suggestions: [
      'Is delivery free in Canberra?',
      'How long does sea freight from China take?',
      'Which filament should I use, PLA, PETG, or TPU?',
      'What nozzle temperature for PETG?',
      'What is your returns policy?',
      'Where is order TF-1042?',
    ],
    placeholder: 'Ask about shipping, filament, or an order',
    messageLabel: 'Message',
    send: 'Send',
    sending: 'Sending',
    thinking: 'Looking through the notes',
    sources: 'From the notes',
    ticket: 'Ticket',
    open: 'Open',
    copyId: 'Copy id',
    copied: 'Copied',
    reasons: {
      explicit_request: 'You asked for a person',
      low_confidence: 'Not covered by the store notes',
      order_lookup: 'Needs a live order lookup',
    },
    modeMock: 'Mock mode · no API key',
    modeLive: (model) => `OpenAI · ${model}`,
    offline: 'Desk offline',
    networkError: 'The desk did not answer. Check that the server is running and try again.',
    footer:
      'Do not send card numbers. A person follows up on tickets by email in a real store; this demo only records the ticket.',
    welcome:
      'Good to see you. I can answer questions about TinyFab 3D filament — free delivery in Canberra, the sea-freight wait from China, PLA / PETG / TPU settings, returns, and what an order status means.',
  },
  zh: {
    lede: '给堪培拉玩家的线材。现货从本地发出，其余从中国海运过来，大约一个半月。',
    demo: '演示柜台。这些笔记是一套贴近 TinyFab 的知识库，没有连接实时的 Shopify。',
    language: '回复语言',
    auto: '自动',
    english: 'EN',
    chinese: '中文',
    topicsLabel: '可以问',
    topics: [
      '堪培拉免费送货',
      '从中国海运的时效',
      'PLA、PETG、TPU 怎么选',
      '喷嘴和热床温度',
      '未拆封卷轴的退货',
      '订单状态是什么意思',
    ],
    legend: '卷轴上的三种',
    pla: 'PLA · 好打',
    petg: 'PETG · 更韧',
    tpu: 'TPU · 柔软',
    ticketsLabel: '这次会话的工单',
    noTickets: '还没有。具体订单，或笔记里没有的问题，会开一张。',
    chatTitle: '客服对话',
    chatSub: '用中文或英文提问。回复跟你的消息走。',
    suggestionsLabel: '可以这样问',
    suggestions: [
      '堪培拉送货免费吗？',
      '从中国海运大概要多久？',
      'PLA、PETG 和 TPU 怎么选？',
      'PETG 喷嘴温度是多少？',
      '退货政策是什么？',
      '能帮我查订单 TF-1042 吗？',
    ],
    placeholder: '问问配送、线材或订单',
    messageLabel: '消息',
    send: '发送',
    sending: '发送中',
    thinking: '正在翻笔记',
    sources: '来自笔记',
    ticket: '工单',
    open: '待处理',
    copyId: '复制编号',
    copied: '已复制',
    reasons: {
      explicit_request: '你要求转人工',
      low_confidence: '笔记里没有把握',
      order_lookup: '需要查询实时订单',
    },
    modeMock: '模拟模式 · 没有 API 密钥',
    modeLive: (model) => `OpenAI · ${model}`,
    offline: '柜台不在线',
    networkError: '柜台没有答上。请确认服务已启动，然后再试一次。',
    footer: '请不要发送银行卡号。真正的店铺会用邮件跟进工单；这个演示只把工单记下来。',
    welcome:
      '你好。可以问 TinyFab 3D 的线材：堪培拉免费送货、从中国海运要多久、PLA / PETG / TPU 的打印参数、退货，以及订单状态是什么意思。',
  },
};
