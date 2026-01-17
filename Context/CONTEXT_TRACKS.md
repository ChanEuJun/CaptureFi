# Hackathon Track Implementation Details - CaptureFi

This document outlines the specific hackathon tracks we are targeting, the requirements, and how CaptureFi addresses them.

## 1. Pear Protocol Integration (The Narrative Engine)

### Hackathon Requirements
- **Goal:** Build on the Pear Execution API.
- **What We're Looking For:**
    - Solutions that encourage users to place pair/basket trades.
    - Interfaces that make advanced trading simple and more akin to betting/gambling.
    - Automation or distribution layers (bots, mobile, social).
    - Realistically drive more trading volume.
- **Judging Criteria:**
    - Does it execute real trades?
    - Does it unlock easier or new trading behavior?
    - Would people want to use it?

### CaptureFi Implementation
**Goal:** Convert Unstructured Text -> Structured Pair & Basket Trades.

**Concept:**
1.  **Input:** "L2s are draining liquidity from Alt L1s." (Tweet/Text) from Teammate's Capture Module.
2.  **AI Processing:**
    -   Identifies specific trade structure (Pair, Basket, Conditional).
    -   Example Basket: Long [ARB, OP], Short [SOL, AVAX].
3.  **Pear Execution:**
    -   Map tickers to Pear Protocol Contract IDs.
    -   Execute via Pear API using advanced transaction types.

**Code Concept:**
```typescript
const executeStrategy = async (signal) => {
  if (signal.type === 'BASKET') {
      return pearSDK.createBasketTrade({
        longs: signal.longAssets, // ["ARB", "OP"]
        shorts: signal.shortAssets, // ["SOL", "AVAX"]
        leverage: 20000 
      });
  }
  // Handle other types (Pair, Conditional)
}
```

## 2. Salt Integration (The AI Leash)

### Hackathon Requirements
- **Goal:** Design robo-managers, tools, or mini-apps that utilize Salt’s policy-controlled accounts to automate and manage capital on HyperEVM without ever taking custody.
- **Categories:** Robo Managers, Tokenized Accounts, AI + Chat-Driven Management.
- **Judging Criteria:**
    - Originality: The uniqueness of the idea.
    - Salt Integration: The depth of technical integration.
    - Practical Usefulness: How useful the tool is for managing capital.
    - Execution & UX: The quality of the final product.

### CaptureFi Implementation
**Goal:** Allow an AI Agent to trade on behalf of the user, WITHOUT giving it full custody.

**The Policy Logic:**
"Whitelist Logic". The User's Salt Account adds the AI Agent's signing key as a "Delegate", but the Salt Policy restricts what that Delegate can sign.

**Policy Rules (Rego/Code):**
1.  `allowed_targets`: ONLY `0xPearProtocolRouter`.
2.  `allowed_functions`: ONLY `openPosition`, `closePosition`.
3.  `blocked_functions`: `withdraw`, `transfer`.

**Result:** Even if the AI Agent is compromised, it cannot drain the user's wallet. It can only open/close Pear trades.

## 3. LI.FI Integration (Context-Aware Bridging)

### Hackathon Requirements
- **Goal:** Build a dApp or component that bridges users from any chain into HyperEVM (and optionally into a Hyperliquid trading account) using LI.FI routing.
- **What to Build:**
    - User picks origin chain + token, destination token on HyperEVM (USDC, HYPE, etc.).
    - Uses LI.FI to swap and bridge in one flow.
    - Shows route details and execution state.
- **Judging Criteria:**
    - Creative use of LI.FI (not just a redirect).
    - Clean UX.
    - Reliable (handles failures/retries).
    - Actually useful for Hyperliquid builders and users.

### CaptureFi Implementation
**Goal:** Bridge only what is needed, when it is needed.

**Flow:**
1.  User approves the "Long SOL / Short ETH" trade.
2.  App checks HyperEVM Balance: $50 (Requires $200 for trade).
3.  Deficit: $150.
4.  App automatically initializes LI.FI Widget:
    -   **From:** User's Active Chain (e.g., Base).
    -   **To:** HyperEVM.
    -   **Amount:** $150 (Plus buffer).
    -   **Recipient:** The Salt Smart Account.
    -   **Extra Credit:** Auto-swap bridged USDC -> HYPE for gas if needed.