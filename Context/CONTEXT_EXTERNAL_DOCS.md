# External Documentation Summary

## Pear Protocol
- **Docs:** [API Integration Overview](https://docs.pearprotocol.io/api-integration/overview)
- **Auth:** [Authentication Process](https://docs.pearprotocol.io/api-integration/access-management/authentication-process)
- **API Base URL**: `https://hl-v2.pearprotocol.io` (Mainnet)
- **Auth Flow**: EIP-712 Signature -> JWT
    1. `GET /authentication/eip712-message` (Query param: `clientId`)
    2. User signs message (Wallet)
    3. `POST /authentication/authenticate` (Body: signature, clientId)
    4. Response: `accessToken`, `refreshToken`
- **Hackathon Client IDs**: `HLHackathon1` ... `HLHackathon10`

## LI.FI SDK
- **Docs:**
    - [LI.FI Docs](https://docs.li.fi/)
    - [SDK Setup](https://docs.li.fi/smart-account-integration/sdk-setup)
    - [API Reference](https://apidocs.li.fi/)
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
- **Docs:**
    - [HyperEVM Developer Docs](https://hyperliquid.xyz/docs)
    - [Bridge Deposit Flow](https://hyperliquid.xyz/docs/bridge)
    - [Chain ID Reference](https://hyperliquid.xyz/docs/evm)
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

## Salt
- **Docs:**
    - [Salt SDK Documentation](https://docs.salt.io/sdk)
    - [A-Z Building an Agent on Salt](https://docs.salt.io/agents)
