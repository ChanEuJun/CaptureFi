# Project Name: CaptureFi
**Tagline:** Turn Content into Capital. The Readwise for Narrative Trading.

## The Problem
Crypto alpha lives in the noise—on X (Twitter), YouTube, and substacks.
But **acting** on that alpha is painful.
1.  You read a tweet saying "L2s are draining liquidity from Alt L1s."
2.  To trade this, you need to bridge funds, short SOL, and long ARB.
3.  By the time you manage your wallet and calculate the hedge, the opportunity is gone.

## The Solution
**Thesis** is a "Save-to-Trade" engine. You consume content; we handle the execution.

1.  **Capture:** Click our browser extension on any tweet or video.
2.  **Process:** Our AI agent analyzes the text, extracts the "Narrative," and constructs a **Pear Protocol** pair trade (e.g., Long ETH / Short SOL).
3.  **Protect:** The trade is executed via a **Salt** Policy-Controlled Account. The AI can execute the trade, but it *cannot* steal your funds.
4.  **Fund:** If you lack liquidity, **LI.FI** bridges funds instantly to enable the trade.

---

## Track Integration (Why we win)

### 1. Pear Protocol (The Execution Layer)
* **Goal:** Drive pair/basket trading volume.
* **Our Implementation:** We don't just let users trade tokens; we let them trade **ideas**. Thesis automatically converts abstract concepts (text) into specific Pear implementation (Long/Short Baskets). We abstract away the complexity of managing a hedge.

### 2. Salt (The Programmable Capital Layer)
* **Goal:** Robo-managers and Policy-Controlled Accounts.
* **Our Implementation:** This is the core trust layer. Users don't want to give an AI their private keys.
* **The Policy:** We deploy a Salt account with a strict rule: *"This AI agent is whitelisted ONLY to interact with Pear Protocol contracts."* This creates a trustless "Robo-Manager" that has permission to trade, but not permission to rug.

### 3. LI.FI (The Onboarding Layer)
* **Goal:** Seamless bridging to Hyperliquid.
* **Our Implementation:** Context-aware bridging. We don't just show a bridge button. When the AI suggests a trade requires $500 collateral, and the user only has $100, the LI.FI widget triggers automatically for the exact difference, streamlining the "Deposit -> Trade" loop.


This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Project Documentation

For detailed information about the project's architecture, tracks, and logic, please refer to the `Context/` directory:

- [Context Tracks](./Context/CONTEXT_TRACKS.md) - Hackathon track details and implementation.
- [Security Bot](./Context/CONTEXT_SECURITYBOT.md) - Details on the Salt AI Policy and "Security Bot" concept.
- [Trade Flow](./Context/CONTEXT_TRADE_FLOW.md) - Visualizing trade execution and fund flow.
- [External Docs](./Context/CONTEXT_EXTERNAL_DOCS.md) - Links to external SDKs and resources.
