DeltaGuard: Project Requirements Document (PRD)

1. Project Overview

Name: DeltaGuard
Tagline: The Cross-Chain, Policy-Protected Hedge Fund.
Mission: Democratize institutional "Delta Neutral" strategies for retail users by combining one-click bridging with strict, policy-controlled security.

2. The Problem

Retail Friction: Users want the high yield of DeFi (funding rates) but are intimidated by the complexity of bridging, managing gas, and executing two-leg trades (Long + Short).

Blind Trust: Bridging blindly to new ecosystems is dangerous. Users fear honeypots and hacks.

The "Gambling" Trap: Most interfaces encourage reckless leverage. There is no simple "Savings Account" interface for advanced derivatives.

3. The Solution

DeltaGuard is a "Smart Onboarding Gateway" that:

Bridges: Moves USDC from any chain (Op, Arb, Base) to HyperEVM using LI.FI.

Secures: Deposits funds into a Salt Policy-Controlled Account (Robo-Manager) that strictly validates the destination.

Executes: Automatically opens a market-neutral position on Pear Protocol.

4. Strategic Pitch & Selling Points (The "Why")

A. The "Delta Neutral" Thesis (Yield > Gambling)

Concept: Instead of betting on price direction, we use Pear Protocol to go Long 1 ETH + Short 1 ETH.

The Alpha: This captures the Funding Rate (often 15-30% APY) while eliminating market risk.

Sponsor Fit: This appeals to Salt's vision of "Wealth Management" rather than "Degen Trading." It turns a casino tool into a savings product.

B. The Pear Protocol Fit

Technical Alignment: Delta Neutral is the ultimate "Pair Trade" (where Token A and B are perfectly correlated).

Track Match: Fits the requirement for "risk-managed yield strategies" perfectly. We use Pear's infrastructure not to gamble, but to strip away risk.

C. Intuitive "Intent-Based" UX

We replace complex trading jargon with "Mad Libs" style intent:

"Savings Mode": "I want to earn [ 20% APY ] on [ USDC ]." (Backend: Delta Neutral ETH).

"Versus Mode": "I believe [ Solana ] will beat [ Ethereum ]." (Backend: Long SOL / Short ETH).

"Mad Libs": "I believe [ AI Tokens ] will outperform [ Bitcoin ] over [ 7 Days ]."

5. Key Features (MVP)

One-Click "Earn": User signs one transaction on their source chain; the system handles bridging, gas, and strategy deployment.

The "HyperGuard" Bot: A pre-transaction policy check (Salt) that prevents funds from entering blacklisted or paused contracts.

Strategy Dashboard: Simple UI showing "Current APY," "Safety Score," and "Position Health."

6. Hackathon Track Alignment

LI.FI: Used for the "Any Chain -> HyperEVM" transport layer.

Differentiation: We bridge to a Smart Account, not an EOA.

Salt: Used as the "Robo-Manager" / Fiduciary.

Differentiation: We use Salt to enforce a "No Rug" policy on the capital.

Pear Protocol: Used as the yield source (Execution Layer).

Differentiation: We wrap Pear in a retail-friendly "Vault" interface.

7. Tech Stack

Frontend: Next.js, Tailwind CSS, ShadCN UI.del

Bridging: LI.FI SDK.

Account/Policy: Salt SDK (or mocked Smart Account logic).

DeFi Integration: Pear Protocol Smart Contracts (HyperEVM).

Chain: HyperEVM (Chain ID: 999 Mainnet / 998 Testnet).