Project Name: CaptureFi
Tagline: Turn Content into Capital. The Readwise for Narrative Trading.

The Problem

Crypto alpha lives in the noise—on X (Twitter), YouTube, and substacks. But acting on that alpha is painful.

You read a tweet saying "L2s are draining liquidity from Alt L1s."
To trade this, you need to bridge funds, short SOL, and long ARB.
By the time you manage your wallet and calculate the hedge, the opportunity is gone.
The Solution

Thesis is a "Save-to-Trade" engine. You consume content; we handle the execution.

Capture: Click our browser extension on any tweet or video.
Process: Our AI agent analyzes the text, extracts the "Narrative," and constructs a Pear Protocol pair trade (e.g., Long ETH / Short SOL).
Protect: The trade is executed via a Salt Policy-Controlled Account. The AI can execute the trade, but it cannot steal your funds.
Fund: If you lack liquidity, LI.FI bridges funds instantly to enable the trade.
Track Integration (Why we win)

1. Pear Protocol (The Execution Layer)

Goal: Drive pair/basket trading volume.
Our Implementation: We don't just let users trade tokens; we let them trade ideas. Thesis automatically converts abstract concepts (text) into specific Pear implementation (Long/Short Baskets). We abstract away the complexity of managing a hedge.
2. Salt (The Programmable Capital Layer)

Goal: Robo-managers and Policy-Controlled Accounts.
Our Implementation: This is the core trust layer. Users don't want to give an AI their private keys.
The Policy: We deploy a Salt account with a strict rule: "This AI agent is whitelisted ONLY to interact with Pear Protocol contracts." This creates a trustless "Robo-Manager" that has permission to trade, but not permission to rug.
3. LI.FI (The Onboarding Layer)

Goal: Seamless bridging to Hyperliquid.
Our Implementation: Context-aware bridging. We don't just show a bridge button. When the AI suggests a trade requires $500 collateral, and the user only has $100, the LI.FI widget triggers automatically for the exact difference, streamlining the "Deposit -> Trade" loop.