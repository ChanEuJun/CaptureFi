Salt AI Policy (The "Trustless Delegate")

Overview
In CaptureFi, the "Security Bot" concept evolves into a "Restricted Delegate". We are granting an AI Agent (or the CaptureFi Backend) the permission to execute trades on the user's behalf.
To make this safe, we use Salt's Policy layer to strictly bound the AI's power.

The Policy Specification

Target: The User's Salt Smart Account.
Delegate: The CaptureFi Server/Agent Key (`0xAgent...`).

Rules:
1. Whitelist Contract Interaction
   - The Delegate can ONLY CALL the `PearRouter` contract address.
   - Any attempt to call `USDC.transfer` or `ETH.transfer` will revert.

2. Whitelist Function Selectors
   - The Delegate can ONLY call specific function signatures:
     - `openPosition(...)`
     - `addCollateral(...)`
     - `closePosition(...)`

3. Spending Limits (Optional/Advanced)
   - "Max Drawdown": If the position loses > 20%, the AI is forced to close (Stop Loss).
   - "Max Daily Volume": The AI can only trade up to $1000/day.

Mock Implementation for Hackathon (Frontend Guard)

Since a full Salt integration might be complex for a hackathon, we can simulate the policy check in the client-side signing flow:

```typescript
// services/SaltPolicyCheck.ts

const ALLOWED_CONTRACTS = ['0xPearRouterAddress...'];
const ALLOWED_METHODS = ['openPosition', 'closePosition'];

export function validateTransaction(tx, signerRole) {
  if (signerRole === 'AI_AGENT') {
    if (!ALLOWED_CONTRACTS.includes(tx.to)) {
      throw new Error("POLICY VIOLATION: AI Agent cannot interact with this contract.");
    }
    
    // Decode data to check method
    const method = decodeMethod(tx.data);
    if (!ALLOWED_METHODS.includes(method)) {
      throw new Error("POLICY VIOLATION: AI Agent cannot call this function.");
    }
  }
  return true; // Pass
}
```

Visualizing Trust
The UI should clearly show this restriction:
- "Delegate Status: Active"
- "Permissions: Pear Protocol ONLY"
- "Withdrawal Access: REVOKED" (Green Shield Icon)