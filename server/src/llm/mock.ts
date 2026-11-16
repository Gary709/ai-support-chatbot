import type { Article } from '../kb/types.js';
import type { Lang, Ticket } from '../types.js';

export function composeGreeting(language: Lang): string {
  if (language === 'zh') {
    return '你好，我是 Gary，TinyFab 在堪培拉。可以问线材价格、堪培拉免费送货，或者从中国来货要多久。';
  }
  return "Hi, it's Gary at TinyFab in Canberra. Ask me about spool prices, free delivery in Canberra, or how long stock takes from China.";
}

export function composeClarify(language: Lang): string {
  if (language === 'zh') {
    return '再说具体一点？价格、堪培拉送货，或者直接找我。';
  }
  return 'Say that again with a bit more detail? A price, Canberra delivery, or just ask for me.';
}

export function composeHandoff(language: Lang, ticket: Ticket): string {
  if (language === 'zh') {
    if (ticket.reason === 'order_lookup') {
      return `我这边看不到 Shopify 里的订单，查不了这一笔。留给 Gary。单号 ${ticket.id}。`;
    }
    if (ticket.reason === 'ask_gary') {
      return `材料、颜色和数量我自己回。单号 ${ticket.id}。`;
    }
    if (ticket.reason === 'claim') {
      return `退货、退款或破损我没法在这里批。把订单号发到 support@tinyfab3d.com.au，破损请附照片。留给 Gary。单号 ${ticket.id}。`;
    }
    if (ticket.reason === 'unconfirmed') {
      return `这个我还没写下来，所以不编。留给 Gary。单号 ${ticket.id}。`;
    }
    if (ticket.reason === 'low_confidence') {
      return `笔记里没有，我不猜。留给 Gary。单号 ${ticket.id}。`;
    }
    return `好，我来回。单号 ${ticket.id}。`;
  }
  if (ticket.reason === 'order_lookup') {
    return `I can't see Shopify from here, so I can't look that order up. It's with Gary. ${ticket.id}.`;
  }
  if (ticket.reason === 'ask_gary') {
    return `Material, colour and quantity are ones I answer myself. ${ticket.id}.`;
  }
  if (ticket.reason === 'claim') {
    return `I can't approve a return, refund or damage claim from here. Email support@tinyfab3d.com.au with the order number, and photos if it's damaged. It's with Gary. ${ticket.id}.`;
  }
  if (ticket.reason === 'unconfirmed') {
    return `I haven't written that down, so I won't make something up. It's with Gary. ${ticket.id}.`;
  }
  if (ticket.reason === 'low_confidence') {
    return `That's not in my notes, so I won't guess. It's with Gary. ${ticket.id}.`;
  }
  return `Yep, I'll take it. ${ticket.id}.`;
}

export function composeMockAnswer(articles: Article[]): string {
  return articles.map((article) => article.summary.trim()).join('\n\n');
}
