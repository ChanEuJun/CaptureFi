# CaptureFi: The "Save-to-Trade" Engine

**Tagline:** Turn Content into Capital. The Readwise for Narrative Trading.

## The Problem
Crypto alpha lives in the noise—on X (Twitter), YouTube, Telegram, scattered articles across the internet. But **acting** on that alpha is painful:
1.  **Discovery:** You see a tweet saying "L2s are draining liquidity from Alt L1s."
2.  **Execution Gap:** To trade this, you need to bridge funds to HyperEVM, open a short on SOL, and a long on ARB.
3.  **Result:** By the time you manage your wallet and calculate the hedge, the opportunity is gone.

## The Solution
**CaptureFi** automates the journey from "passive consumption" to "active execution".

1.  **Capture:** Click our browser extension on any tweet or video.
2.  **Process:** We analyze your captures to generate a "Narrative" and construct a **Pear Protocol** pair/basket trade (e.g., Long ETH / Short SOL).
3.  **Bridge:** If you lack liquidity, **LI.FI** intelligently bridges only what you need to HyperEVM.
4.  **Automate:** An AI agent, constrained by **Salt** policies, executes the trade on your behalf.

---

## Technical Implementations (Hackathon Tracks)

### 1. Pear Protocol Integration (The Execution Layer)
We utilize Pear Protocol to enable **Pair Trading**—the core of "Narrative Trading" (e.g., Long AI / Short Meme).

**Key Implementation Details:**
*   **EIP-712 Authentication:** We implement a full EIP-712 authentication flow (`src/utils/pearClient.ts`) to securely log users into the Pear backend using their Ethereum wallet.
    *   *Flow:* Get Message -> Sign Typed Data -> Login -> Receive Access Token.
*   **Agent Wallets:** Once authenticated, we provision a session-based **Agent Wallet** for the user. This allows the AI to execute trades without requiring a signature for every single transaction, while keeping the user's main keys safe.
*   **Narrative Maps:** Our backend translates natural language ("Solana is dead, Ethereum is back") into specific Pear Protocol pair IDs (e.g., Long ETH-USD / Short SOL-USD).

### 2. Salt Integration (The AI Leash)
We use Salt to solve the "AI Trust Problem" in finance. We want an AI to trade for us, but we don't trust it with our life savings.

**Key Implementation Details:**
*   **Programmable Accounts:** We use Salt's programmable account infrastructure to create a dedicated trading vault.
*   **Policy Constraints:** We deploy specific Rego-based policies that strictly limit what the AI Agent matches can do (`src/pages/SaltPreferences.tsx`).
    *   **Whitelist Logic:** The AI Agent is added as a signer, BUT the policy says:
        *   `ALLOWED_TARGET`: Only `0xPearProtocolRouter`.
        *   `ALLOWED_FUNCTION`: Only `openPosition` and `closePosition`.
        *   `BLOCKED`: `transfer`, `withdraw`, `approve` (to any other contract).
*   **Result:** Even if the AI agent goes rogue or hallucinates, it physically **cannot** drain user funds. It can only execute valid Pear Protocol trades.

### 3. LI.FI Integration (Context-Aware Bridging)
We use LI.FI not just as a "bridge page", but as an embedded, context-aware utility.

**Key Implementation Details:**
*   Suggests the most efficient options for the user to bridge with and provides a fallback option to ensure the trade is executed.
*   **Embedded Widget:** We configure the LI.FI widget to pre-fill the **Destination Chain (HyperEVM)** and the **Recipient Address** (The Salt Smart Account), removing user error from the bridging process.
*   **Fallback Routing:** If HyperEVM direct bridging is congested, we utilize LI.FI's routing to bridge to Optimism (as a proxy L2) where Pear liquidity also exists.


## Running the Project

1.  **Install Dependencies:**
    ```bash
    cd frontend
    npm install
    ```

2.  **Start Development Server:**
    ```bash
    npm run dev
    ```

3.  **Open in Browser:**
    Navigate to `http://localhost:8080` (or the port shown in your terminal).

## Dependencies
*   **Frontend:** React, Vite, TailwindCSS, shadcn/ui.
*   **Web3:** wagmi, viem, ethers.
*   **Integrations:** `@lifi/widget`, `axios` (for Pear API).
