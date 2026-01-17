import { Salt, TransferType } from 'salt-sdk';
import { ethers, Signer } from 'ethers';
import { SmartAccount, DelegateSession } from './types';

export class SaltClient {
    private salt: Salt;
    private signer: Signer | null = null;

    constructor() {
        // Initialize Salt SDK for Testnet as per docs
        this.salt = new Salt({
            environment: 'TESTNET',
        });
    }

    // Connect using an existing Ethers signer (from WalletProvider)
    async connect(signer: Signer): Promise<SmartAccount> {
        this.signer = signer;

        // Authenticate with SIWE
        // https://developer.salt.space/sdk/classes/Salt.html#authenticate
        console.log("Authenticating Salt SDK...");
        // @ts-ignore - Version mismatch between ethers v6 in app and v5/v6 in SDK
        await this.salt.authenticate(signer);

        const address = await signer.getAddress();
        console.log("Salt Authenticated for:", address);

        // Fetch accounts? Docs say salt.getAccounts but Example uses generic ID.
        // For now, we assume the specific Org creation happened in the UI 
        // and we are just interacting.
        // We'll return a mock "Smart Account" structure wrapper for now until we identify
        // how to fetch the specific Safe address managed by Salt.

        return {
            address: address, // In reality this should be the Safe address
            isDeployed: true, // Assumed if auth works
            balance: { usdc: 0, hype: 0 }
        };
    }

    /*
    async transfer(to: string, amount: string) {
        if (!this.signer) throw new Error("Not connected");
        
        // Example transfer
        await this.salt.transfer({ 
            type: TransferType.Native, 
            accountId: 'DEFAULT_ACCOUNT_ID', // TODO: Need to fetch this
            to: to, 
            value: amount, 
            decimals: 18, 
            chainId: 1, 
            signer: this.signer,
        });
    }
    */
}

export const saltClient = new SaltClient();
