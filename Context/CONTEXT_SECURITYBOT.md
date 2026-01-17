Security Bot Logic (The "HyperGuard")

Overview

This logic satisfies the Salt Track requirement for "Programmable Capital." It acts as a pre-flight check before any capital is deployed into a strategy.

The Logic Flow

Before the Salt Account signs the transaction to enter Pear Protocol, it runs this asynchronous check.

1. The CVE Database (Mocked)

For the hackathon, we hardcode a list of "Known Bad Actors" or simulated vulnerabilities to demonstrate the functionality.

{
  "BLACKLIST": [
    "0x000000000000000000000000000000000000dead", // Null
    "0xScamTokenAddress...", 
    "0xHackedBridgeOld..."
  ],
  "PAUSED_PROTOCOLS": [
    // If Pear Protocol announces a pause, we add it here manually during the demo
  ]
}


2. The Verification Function

This function simulates an AI Agent reviewing the transaction.

/**
 * The "Robo-Manager" Brain
 * @param {string} targetContract - The protocol we are about to invest in
 * @param {number} amount - The amount of capital
 */
export async function runSecurityAudit(targetContract, amount) {
  console.log(`[HyperGuard] Auditing interaction with ${targetContract}...`);
  
  // 1. Check Blacklist
  if (BLACKLIST.includes(targetContract)) {
    throw new Error("SECURITY ALERT: Target contract is on the Global Blacklist.");
  }
  
  // 2. Check Protocol Health (Simulation)
  // In production, this hits an API like GoPlus or Hyperliquid Analytics
  const isHealthy = Math.random() > 0.05; // 5% chance of simulated failure for demo
  
  if (!isHealthy) {
    throw new Error("RISK ALERT: Protocol volume has dropped 99% in 1 hour. Possible exploit.");
  }
  
  // 3. Check "Slippage/Price Impact"
  // Ensure we aren't getting front-run
  const priceImpact = await getEstimatedPriceImpact(amount);
  if (priceImpact > 2.0) {
     throw new Error("FINANCIAL GUARD: Price impact too high (>2%). Trade blocked.");
  }
  
  return {
    status: "APPROVED",
    timestamp: Date.now(),
    auditHash: "0xABC123..."
  };
}


3. UI Representation

The UI should display this process visually to impress judges:

State 1: "Analyzing Target Contract..." (Spinner)

State 2: "Checking for CVEs..." (Green Checkmark)

State 3: "Verifying Liquidity Depth..." (Green Checkmark)

State 4: "Policy Approved. Executing." (Action)