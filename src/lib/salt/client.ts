import { SmartAccount, DelegateSession } from './types';

// Mock delay to simulate network latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockSaltClient = {
    // Simulate connecting to a Salt account
    connect: async (): Promise<SmartAccount> => {
        await delay(1000);
        return {
            address: "0xUserSaltSmartAccount_HyperEVM",
            isDeployed: false, // Starts as undeployed
            balance: {
                usdc: 0,
                hype: 0
            }
        };
    },

    // Simulate deploying the account to the network
    deployAccount: async (address: string): Promise<boolean> => {
        console.log(`Deploying Salt Account ${address} to HyperEVM...`);
        await delay(2000);
        return true;
    },

    // Simulate creating a scoped session key for the app
    createDelegate: async (account: string): Promise<DelegateSession> => {
        console.log(`Creating Delegate for ${account} with limited policy...`);
        await delay(1500);
        return {
            publicKey: "0xAgentDelegateKey",
            expiry: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
        };
    },

    // Check balance (mock)
    getBalance: async (address: string) => {
        await delay(500);
        return {
            usdc: 50, // Insufficient for most trades, triggers LI.FI flow
            hype: 10
        };
    }
};
