Technical Architecture & Data Flow

System Diagram

graph TD
    User[User (EOA on Optimism)] -->|1. Sign Bridge Tx| LiFi[LI.FI Widget/SDK]
    LiFi -->|2. Bridge USDC + Swap for Gas| SaltAccount[Salt Smart Account (HyperEVM)]
    
    subgraph "HyperEVM (Destination)"
        SaltAccount -->|3. Trigger Policy Check| SecurityBot[Security Logic / Policy]
        SecurityBot -- "Safe" --> Pear[Pear Protocol Contract]
        SecurityBot -- "Unsafe" --> Vault[Holding Vault]
    end
    
    Pear -->|4. Open Long/Short| Hyperliquid[Hyperliquid L1 Orderbook]


Component Breakdown

1. The "Inbound" Bridge (Li.Fi)

Role: Transport layer.

Configuration:

Source: Any EVM chain (Optimism, Base, Arbitrum).

Destination: HyperEVM (Chain ID 999).

Token: USDC.

Recipient (toAddress): This is CRITICAL. The recipient must be the address of the User's Salt Smart Account, NOT their EOA.

Gas Handling: Use Li.Fi's "Gas Destination" feature to swap a small portion of source USDC into HYPE token so the Salt Account has gas to execute the trade upon arrival.

2. The "Robo-Manager" (Salt)

Role: The Custodian & Policymaker.

Logic:

This is a Smart Contract Account (SCA) owned by the user but restricted by code.

Policy Rule #1: Can only interact with whitelisted addresses (Pear Protocol Router).

Policy Rule #2: Can only execute if the SecurityOracle returns true.

3. The Execution Layer (Pear)

Role: Yield generation.

Action: openPosition.

Parameters (Hardcoded for MVP):

pair: ETH/BTC (or similar strong correlation pair).

leverage: 2x (Conservative).

direction: Long ETH / Short BTC.

Data Models

User State

interface UserState {
  address: string; // EOA
  saltAccountAddress: string; // The calculated Smart Account address
  currentChain: number;
  balance: {
    source: BigNumber; // USDC on Optimism
    destination: BigNumber; // USDC on HyperEVM
  };
}


Strategy State

interface Strategy {
  id: "delta-neutral-eth";
  name: "Delta Guard ETH";
  apy: number; // e.g., 15.2%
  riskLevel: "Low" | "Medium" | "High";
  pearContractAddress: string;
  isPaused: boolean; // Driven by Security Bot
}
