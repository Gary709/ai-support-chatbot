import type { Article } from '../kb/types.js';
import type { Lang, Ticket } from '../types.js';

export function composeGreeting(language: Lang): string {
  if (language === 'zh') {
    return '你好。我是 TinyFab 3D 的客服。可以问我堪培拉免费送货、从中国海运要多久、PLA / PETG / TPU 的打印参数、退货，或订单状态是什么意思。';
  }
  return 'Hello. I am the TinyFab 3D support desk. Ask me about free delivery in Canberra, sea freight from China, PLA / PETG / TPU settings, returns, or what an order status means.';
}

export function composeClarify(language: Lang): string {
  if (language === 'zh') {
    return '我想确认你要问的是哪一件事。可以问配送、材料、打印参数，或直接说要转人工。';
  }
  return 'I want to be sure I answer the right thing. Ask about delivery, a material, a printer setting, or say if you need a person.';
}

export function composeHandoff(language: Lang, ticket: Ticket): string {
  if (language === 'zh') {
    if (ticket.reason === 'order_lookup') {
      return `查询某一笔具体订单需要同事处理，因为这个演示看不到实时的 Shopify 订单。已建立工单 ${ticket.id}。请准备订单号，以及结账时用的邮箱。`;
    }
    if (ticket.reason === 'low_confidence') {
      return `商店笔记里没有把握回答这个问题，所以我没有猜，而是建立了工单 ${ticket.id}，交给 TinyFab 的同事。`;
    }
    return `已转给 TinyFab 的同事，并建立工单 ${ticket.id}。写信时带上这个编号即可。这个演示看不到实时的 Shopify 订单，也不能改账户；同事会按工单跟进。`;
  }
  if (ticket.reason === 'order_lookup') {
    return `Checking one specific order needs a person, because this demo cannot see live Shopify orders. I opened ticket ${ticket.id}. Have the order number and the checkout email ready.`;
  }
  if (ticket.reason === 'low_confidence') {
    return `I am not confident the store notes cover that, so I did not guess. I opened ticket ${ticket.id} for a person on the TinyFab team.`;
  }
  return `I have handed this to a person on the TinyFab team and opened ticket ${ticket.id}. Keep that id if you write in. This demo cannot see live Shopify orders or change an account.`;
}

export function composeMockAnswer(language: Lang, articles: Article[]): string {
  const notes = articles.map((article) => article.summary.trim());
  const closing =
    language === 'zh'
      ? '如果这还没回答到，可以换个说法，或直接说「转人工」。'
      : 'If that does not cover it, ask another way, or say you want a person.';
  return [...notes, closing].join('\n\n');
}
