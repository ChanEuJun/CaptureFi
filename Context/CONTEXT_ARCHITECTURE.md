Technical Architecture & Data Flow - CaptureFi

System Diagram

graph TD
    UserInput["User Input (Tweet/URL/Text)"] -->|1. Submit| NLP[AI Analysis Engine]
    NLP -->|2. Extract Sentiment & Tickers| TradeGen[Trade Generator]
    TradeGen -->|3. Propose Pair Trade| UI[Approval Interface]
    
    UI -->|4. User Approves| CheckLiquidity{Check Liquidity}
    
    CheckLiquidity -- "Insufficient" --> LiFi[LI.FI Widget]
    LiFi -->|5. Bridge Funds| SaltAccount
    
    CheckLiquidity -- "Sufficient" --> SaltAccount[Salt Smart Account]
    
    subgraph "Trust Layer (Salt)"
        SaltAccount -->|6. Verify Policy| PolicyEngine[Policy Check]
        PolicyEngine -- "OK (Whitelisted)" --> PearRouter
        PolicyEngine -- "Blocked" --> Revert
    end
    
    PearRouter -->|7. Execute Trade| Hyperliquid

Component Breakdown

1. The "Capture" Layer (Frontend/Extension)
- Role: Ingest content.
- Tech: Simple Text Area or Browser Extension (Context Menu).
- Action: Sends text to Backend.

2. The "Process" Layer (AI Backend)
- Role: Intelligence.
- Tech: OpenAI API / Anthropic Claude.
- Task: Receive text -> Output JSON Strategy.
  - Text: "ETH is looking weak compared to the new L2s."
  - JSON: `{ long: "OP", short: "ETH", confidence: 0.85 }`

3. The "Protect" Layer (Salt)
- Role: Custody & Permission.
- The User owns the Salt Account.
- The "CaptureFi Agent" is a DELEGATE on the account.
- The POLICY restricts the Agent to only call `PearRouter`.

4. The "Fund" Layer (LI.FI)
- Role: Gap filling.
- Checks `USDC.balanceOf(SaltAccount)`.
- If `balance < TradeAmount`, invoke LI.FI SDK to bridge difference.

Data Models

Narrative Object
```typescript
interface Narrative {
  sourceUrl: string;
  originalText: string;
  detectedSentiment: "Bullish" | "Bearish" | "Neutral";
  recommendedPair: {
    longToken: string;
    shortToken: string;
    leverage: number;
  };
  reasoning: string; // "L2s showing strength..."
}
```

Trade Request
```typescript
interface TradeRequest {
  tool: "Pear";
  pair: "OP-ETH";
  direction: "LONG"; // Long the pair (Long OP, Short ETH)
  collateral: number;
}
```
