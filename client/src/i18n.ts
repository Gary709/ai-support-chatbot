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
    lede: 'Filament shop in Canberra. Prices in AUD. Stock comes by sea from China, about a month and a half, so a colour can be out for a while.',
    demo: "Notes I've written down. I can't see a Shopify order from here.",
    language: 'Answer in',
    auto: 'Same as you',
    english: 'English',
    chinese: '中文',
    topicsLabel: 'Written down',
    topics: [
      'Free delivery across Canberra',
      'Shipping around Australia',
      'PLA Basic from $16.49',
      'PLA Matte from $17.99',
      'PETG Basic from $15.99',
      'Starter pack from $39.90',
      'Volume pricing for farms, schools, studios',
      'Sea freight, about 1.5 months',
      'Returns within 30 days',
      'Postage calculated at checkout',
    ],
    ticketsLabel: 'For me',
    noTickets: 'Nothing yet.',
    chatTitle: 'TinyFab',
    chatSub: "English or 中文. I'll answer what I've written down.",
    suggestionsLabel: 'People ask',
    suggestions: [
      'Is delivery free in Canberra?',
      'How much is PLA Basic?',
      'How long does stock take from China?',
      'Do you ship Australia-wide?',
      'What is your returns policy?',
      'Where is order TF-1042?',
    ],
    placeholder: 'Price, delivery, an order',
    messageLabel: 'Message',
    send: 'Send',
    sending: 'Sending',
    thinking: 'Checking my notes',
    sources: 'From my notes',
    ticket: 'For Gary',
    open: 'Waiting',
    copyId: 'Copy number',
    copied: 'Copied',
    reasons: {
      explicit_request: 'Asked for me',
      low_confidence: 'Not in the notes',
      order_lookup: 'Needs the Shopify order',
      unconfirmed: "I haven't written this down",
      ask_gary: 'Material, colour or quantity',
      claim: 'A return or a damaged parcel',
    },
    modeMock: 'From my notes',
    modeLive: (model) => `Using ${model}`,
    offline: "Chat's down",
    networkError: "Didn't get through. Is the server running?",
    footer:
      "Don't put a card number in here. A ticket just sits in this chat until I hook up email.",
    welcome:
      "Hi, it's Gary at TinyFab. I can tell you spool prices, Canberra delivery, postage and returns. Stock comes by sea from China, about a month and a half. Colour, quantity, and a return or damaged parcel on an actual order still come to me.",
  },
  zh: {
    lede: '堪培拉的线材店。价格是澳元。货从中国海运过来，大概一个半月，所以有的颜色会断一阵。',
    demo: '这些是我写下来的。这边看不到 Shopify 订单。',
    language: '用哪种语言回',
    auto: '跟你说的',
    english: 'English',
    chinese: '中文',
    topicsLabel: '写下来的',
    topics: [
      '堪培拉全市免费送货',
      '澳大利亚境内都寄',
      'PLA Basic 16.49 澳元起',
      'PLA Matte 17.99 澳元起',
      'PETG Basic 15.99 澳元起',
      '入门套装 39.90 澳元起',
      '农场、学校、工作室可以谈批量价',
      '海运大概一个半月',
      '签收后 30 天内可退',
      '运费在结账时按重量算',
    ],
    ticketsLabel: '留给我的',
    noTickets: '还没有。',
    chatTitle: 'TinyFab',
    chatSub: '中文或英文。我写下的我来答。',
    suggestionsLabel: '大家会问',
    suggestions: [
      '堪培拉送货免费吗？',
      'PLA Basic 多少钱？',
      '从中国海运要多久？',
      'PETG Basic 多少钱？',
      '退货怎么算？',
      '能帮我查订单 TF-1042 吗？',
    ],
    placeholder: '价格、送货，或一笔订单',
    messageLabel: '消息',
    send: '发送',
    sending: '发送中',
    thinking: '在翻我的笔记',
    sources: '来自我的笔记',
    ticket: '留给 Gary',
    open: '等我看',
    copyId: '复制编号',
    copied: '已复制',
    reasons: {
      explicit_request: '找我本人',
      low_confidence: '笔记里没有',
      order_lookup: '要查 Shopify 订单',
      unconfirmed: '我还没写下来',
      ask_gary: '材料、颜色或数量',
      claim: '一笔退货或破损',
    },
    modeMock: '按我的笔记回',
    modeLive: (model) => `用着 ${model}`,
    offline: '聊天没连上',
    networkError: '没发出去。服务开了吗？',
    footer: '别把卡号发在这里。工单先记在这个聊天里，邮件我还没接上。',
    welcome:
      '你好，我是 Gary，TinyFab 在堪培拉。线材价格、堪培拉送货、运费和退货规则我可以答。货从中国海运过来，大概一个半月。颜色、数量，以及某一单的退货或破损，还是我自己处理。',
  },
};
