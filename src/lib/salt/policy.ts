import { AccessPolicy, PolicyRule } from './types';

// Constants for HyperEVM addresses (Mocked for now)
export const PEAR_ROUTER_ADDRESS = "0xPearProtocolRouter_MockAddress";
export const SALT_VAULT_ADDRESS = "0xSaltVault_MockAddress";

// The allowed function selectors
const FN_OPEN_POSITION = "openPosition(address,uint256,bool,uint256)";
const FN_CLOSE_POSITION = "closePosition(uint256)";

export const CAPTUREFI_AGENT_POLICY: AccessPolicy = {
    id: "policy_capturefi_v1",
    name: "CaptureFi Trading Delegate",
    description: "Allows the AI Agent to open and close positions on Pear Protocol only. Withdrawals and transfers are strictly forbidden.",
    active: true,
    rules: [
        {
            target: PEAR_ROUTER_ADDRESS,
            functionSelector: FN_OPEN_POSITION,
            action: "ALLOW"
        },
        {
            target: PEAR_ROUTER_ADDRESS,
            functionSelector: FN_CLOSE_POSITION,
            action: "ALLOW"
        }
        // Implicitly, everything else is DENIED by the Salt Smart Account architecture
    ]
};

export function validateAction(target: string, functionSelector: string): boolean {
    // This is a client-side simulation of what the Salt Network does
    const rule = CAPTUREFI_AGENT_POLICY.rules.find(
        r => r.target === target && r.functionSelector === functionSelector
    );

    return rule?.action === "ALLOW";
}
