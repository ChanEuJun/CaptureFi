# External Documentation Summary

## Pear Protocol
- **API Base URL**: `https://hl-v2.pearprotocol.io` (Mainnet)
- **Auth Flow**: EIP-712 Signature -> JWT
    1. `GET /authentication/eip712-message` (Query param: `clientId`)
    2. User signs message (Wallet)
    3. `POST /authentication/authenticate` (Body: signature, clientId)
    4. Response: `accessToken`, `refreshToken`
- **Hackathon Client IDs**: `HLHackathon1` ... `HLHackathon10`

## LI.FI SDK
- **Installation**: `npm install @lifi/sdk`
- **Configuration**:
```typescript
import { createConfig } from '@lifi/sdk';

createConfig({
  integrator: 'DeltaGuard_Hackathon',
  // Providers are optional if using a wallet adapter
});
```
- **API URL**: `https://li.quest/v1`

## Hyperliquid / HyperEVM
- **Mainnet**:
    - Chain ID: `999`
    - RPC: `https://rpc.hyperliquid.xyz/evm`
- **Testnet**:
    - Chain ID: `998`
    - RPC: `https://rpc.hyperliquid-testnet.xyz/evm`
- **Bridge (Arbitrum One -> Hyperliquid)**:
    - Contract: `0x2df1c51e09aecf9cacb7bc98cb1742757f163df7`
    - Asset: Native USDC only.
    - Min Deposit: 5 USDC.
    - Speed: < 1 minute.
