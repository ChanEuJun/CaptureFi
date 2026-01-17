# Trade Execution & Fund Flow

This flowchart visualizes the process from a user accepting a trade suggestion to the final execution, highlighting the roles of LI.FI, Salt, and Pear Protocol.

## Description of Steps

1.  **User Action**: The user accepts a trade suggested by the AI.
2.  **Liquidity Check**: The system checks if the user's **Salt Smart Account** on HyperEVM has enough USDC/Asset to fund the trade.
3.  **LI.FI Integration (If Insufficient)**:
    *   The **LI.FI Widget** is presented.
    *   User bridges funds from another chain (e.g., Base, Arb) to HyperEVM.
    *   Funds are deposited directly into the **Salt Smart Account**.
4.  **Salt Policy Engine (The Guard)**:
    *   The transaction is intercepted by Salt's policy layer.
    *   **Checks**: It verifies that the transaction is *only* interacting with the **Pear Protocol Router** and *only* calling approved functions like `openPosition`.
    *   **Security**: If the AI (or an attacker) tries to withdraw funds or send them elsewhere, the policy **Reverts** the transaction, keeping funds safe.
5.  **Execution**:
    *   If checks pass, the transaction is forwarded to the **Pear Protocol**.
    *   Pear executes the complex trade (e.g., pair trade, basket) on **Hyperliquid**.
