export interface SmartAccount {
    address: string;
    isDeployed: boolean;
    balance: {
        usdc: number;
        hype: number;
    };
}

export type PolicyAction = "ALLOW" | "DENY";

export interface PolicyRule {
    target: string; // Contract address (e.g., PearRouter)
    functionSelector: string; // Function signature (e.g., "openTrade(...)")
    action: PolicyAction;
}

export interface AccessPolicy {
    id: string;
    name: string; // e.g., "CaptureFi Agent Delegate"
    description: string;
    rules: PolicyRule[];
    active: boolean;
}

// The "Delegate" is the keypair that our App holds to sign trades on behalf of the user
export interface DelegateSession {
    publicKey: string;
    privateKey?: string; // Only available locally during session creation
    expiry: number; // Timestamp
}
