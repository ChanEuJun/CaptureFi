Hackathon Track Implementation Details

1. LI.FI Integration (The Bridge)

Goal: Bridge USDC from Source Chain -> Salt Account on HyperEVM.

Code Snippet (SDK Setup):

import { createConfig, getRoutes, executeRoute } from '@lifi/sdk';

// 1. Setup Config
const lifiConfig = createConfig({
  integrator: 'DeltaGuard_Hackathon',
  providers: [ /* WalletConnect, MetaMask */ ],
});

// 2. Get Route (The "Magic" Step)
const getBridgeRoute = async (amount, userSaltAddress) => {
  const routeRequest = {
    fromChainId: 10, // Optimism
    fromTokenAddress: '0x0b2c639c533813f4aa9d7837caf99d555ba8b5d5', // USDC (Op)
    fromAmount: amount,
    
    toChainId: 999, // HyperEVM
    toTokenAddress: '0x...', // USDC (HyperEVM)
    
    // CRITICAL: Send to the Smart Account, not the EOA
    toAddress: userSaltAddress, 
    
    options: {
      // Auto-swap for Gas (User needs HYPE to execute the next step)
      integrator: 'DeltaGuard_Hackathon',
      insurance: true // Optional "Safety" feature display
    }
  };
  
  return await getRoutes(routeRequest);
};


2. Salt Integration (The Robo-Manager)

Goal: Define the Policy that governs the funds.

Concept: Since we are "Vibe Coding," we may not deploy a full Salt node. We will mock the Policy Verification in the client-side logic that prepares the transaction for the Smart Account.

The Policy Logic (Pseudo-Code):

const SALT_POLICY = {
  // Whitelist of allowed contracts
  allowedInteractions: [
    '0xPearProtocolRouter...', 
    '0xUSDC...'
  ],
  
  // Security Checks
  checkCompliance: async (targetAddress) => {
    const isWhitelisted = SALT_POLICY.allowedInteractions.includes(targetAddress);
    const isNotPaused = await checkChainStatus(targetAddress);
    const isAuditClear = !MOCK_CVE_DATABASE.includes(targetAddress);
    
    return isWhitelisted && isNotPaused && isAuditClear;
  }
};


3. Pear Protocol Integration (The Yield)

Goal: Execute the Pair Trade.

Interaction:
We need to call the Pear Router on HyperEVM.

Contract Interface (Simplified):

interface IPearRouter {
    function openPosition(
        address _collateralToken,
        uint256 _collateralAmount,
        string memory _pair, // "ETH-BTC"
        uint256 _leverage,   // 20000 = 2x
        bool _isLong         // true/false
    ) external;
}


Frontend Logic:
The UI should interpret the complex openPosition call as a simple "Deposit" action.