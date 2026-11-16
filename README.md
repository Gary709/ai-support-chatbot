# TinyFab support chat

I run [TinyFab 3D](https://tinyfab3d.com.au), a filament shop in Canberra. Customers message me in English and in Chinese, and I'm one person, so I wrote this to answer the things I've already written down and pass me the rest.

## What it does

It reads a small set of notes and replies in the language of the message. There's a switch if you want to force English or 中文.

What it will answer:

- TinyFab PLA Basic 1.75mm 1kg, from $16.49, 14 variants
- TinyFab PLA Matte 1.75mm 1kg, from $17.99, 7 variants
- TinyFab PETG Basic 1.75mm 1kg, from $15.99, 12 variants
- Essential Starter Pack, from $39.90
- Free local delivery for eligible Canberra and surrounding postcodes
- How long local and interstate delivery takes, and the current postage examples
- Returns, from the published refund policy
- Volume pricing for print farms, schools, studios and businesses
- Stock comes by sea from China, about a month and a half, so a colour can be out of stock for a while

The return and shipping notes link to [the refund policy](https://www.tinyfab3d.com.au/policies/refund-policy) and [the shipping policy](https://www.tinyfab3d.com.au/policies/shipping-policy). Postage examples are the current rates. Checkout shows the final price.

Material, colour and quantity still come to me. So does a return, refund or damage claim on an actual order. The chat can't see Shopify, so an order number becomes a ticket too.

No key is committed. Without `OPENAI_API_KEY` it reads the matching note back. With a key it sends that same note to the model.

## Screenshots

From my notes, no API key.

![The chat before anyone has asked](docs/en-welcome.png)

![Free Canberra delivery, in English](docs/en-canberra-delivery.png)

![PETG Basic price, in Chinese](docs/zh-petg-price.png)

![The published return rules, with a link to the policy page](docs/returns-policy.png)

![A damaged spool left for me, instead of an approval](docs/handoff-claim.png)

![Same chat on a phone](docs/mobile-zh-delivery.png)

## How to run

Node 20 or newer.

```bash
npm install
npm run dev
```

Open http://localhost:5173. The API is on port 8787.

```bash
npm test
npm run lint
npm run build
npm start
```

```bash
cp .env.example .env
```

Put a key in `.env` if you want the model. Don't commit it.

```bash
docker build -t tinyfab-support .
docker run --rm -p 8787:8787 tinyfab-support
```

## Not done yet

- It does not look up orders, approve a return, or judge a damage claim. I haven't connected Shopify.
- Tickets stay in memory. I don't get an email when one is opened.
- Postage in the notes is the current example for a 1–3 kg parcel. The checkout price can differ.
- I haven't run the Docker image on a server.

## TODO

- Email me when a ticket is opened
- Read an order from Shopify once I'm ready to connect it
