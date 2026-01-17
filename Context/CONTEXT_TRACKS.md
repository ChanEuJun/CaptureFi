Hackathon Track Implementation Details - CaptureFi

1. Pear Protocol Integration (The Narrative Engine)

Goal: Convert Unstructured Text -> Structured Pair Trade.

Implementation:
1. Input: "L2s are draining liquidity from Alt L1s." (Tweet/Text)
2. AI Processing (OpenAI/Anthropic):
   - Identifies "Long Side": L2 Basket (ARB, OP)
   - Identifies "Short Side": Alt L1 Basket (SOL, AVAX)
3. Pear Execution:
   - Maps tickers to Pear Protocol Contract IDs.
   - Calls `openPosition(token=USDC, pair="ARB-SOL", leverage=2x, long=true)`.

Code Concept:
```typescript
const analyzeNarrative = async (text) => {
  const sentiment = await llm.analyze(text); // { long: "ARB", short: "SOL" }
  return pearSDK.createPairTrade({
    long: sentiment.long,
    short: sentiment.short,
    leverage: 20000 // 2x
  });
}
```

2. Salt Integration (The AI Leash)

Goal: Allow an AI Agent to trade on behalf of the user, WITHOUT giving it full custody.

The Policy Logic:
"Whitelist Logic". The User's Salt Account adds the AI Agent's signing key as a "Delegate", but the Salt Policy restricts what that Delegate can sign.

Policy Rules (Rego/Code):
1. `allowed_targets`: ONLY `0xPearProtocolRouter`.
2. `allowed_functions`: ONLY `openPosition`, `closePosition`.
3. `blocked_functions`: `withdraw`, `transfer`.

Result: Even if the AI Agent is compromised, it cannot drain the user's wallet. It can only open/close Pear trades.

3. LI.FI Integration (Context-Aware Bridging)

Goal: Bridge only what is needed, when it is needed.

Flow:
1. User approves the "Long SOL / Short ETH" trade.
2. App checks HyperEVM Balance: $50 (Requires $200 for trade).
3. Deficit: $150.
4. App automatically initializes LI.FI Widget:
   - From: User's Active Chain (e.g., Base).
   - To: HyperEVM.
   - Amount: $150 (Plus buffer).
   - Recipient: The Salt Smart Account.

Extra Credit:
Auto-swap the bridged USDC -> HYPE for gas on the destination using Li.Fi's gas abstraction features if available, ensuring the Smart Account can execute the trade immediately.