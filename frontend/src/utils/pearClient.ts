import axios from 'axios';

// Using the Mainnet URL as per user logs ensuring correct connectivity
const BASE_URL = 'https://hl-v2.pearprotocol.io';
const CLIENT_ID = 'HLHackathon1';

interface AuthResponse {
    accessToken: string;
    refreshToken: string;
}

interface AgentWalletResponse {
    agentWalletAddress: string;
    userAddress: string;
}

export const pearClient = {
    // 1. Get EIP-712 Message
    async getEip712Message(address: string) {
        try {
            const response = await axios.get(`${BASE_URL}/auth/eip712-message`, {
                params: { address, clientId: CLIENT_ID }
            });
            return response.data;
        } catch (err) {
            console.error("Failed to get EIP-712 message", err);
            throw err;
        }
    },

    // 2. Login with Signature
    async login(address: string, signature: string, timestamp: number): Promise<AuthResponse> {
        try {
            const response = await axios.post(`${BASE_URL}/auth/login`, {
                method: 'eip712',
                address,
                clientId: CLIENT_ID,
                details: { signature, timestamp }
            });
            return response.data;
        } catch (err) {
            console.error("Failed to login to Pear", err);
            throw err;
        }
    },

    // 3. Create Agent Wallet
    async createAgentWallet(accessToken: string): Promise<AgentWalletResponse> {
        try {
            const response = await axios.post(
                `${BASE_URL}/agentWallet`,
                {},
                { headers: { "Authorization": `Bearer ${accessToken}` } }
            );
            return response.data;
        } catch (err) {
            console.error("Failed to create agent wallet", err);
            throw err;
        }
    },

    // Helper: Perform Full Auth Flow
    async authenticate(address: string): Promise<{ accessToken: string, agentAddress: string }> {
        // @ts-ignore
        if (!window.ethereum) throw new Error("No Wallet Found");

        // A. Get Message via Client
        const eipData = await this.getEip712Message(address);

        const domain = eipData.domain;
        const types = { ...eipData.types };
        const value = eipData.message;

        // Clean types for ethers/standard signing known issues
        if (types.EIP712Domain) {
            delete types.EIP712Domain;
        }

        // B. Sign Message
        // Using window.ethereum.request directly for 'eth_signTypedData_v4'
        const msgParams = JSON.stringify({
            domain,
            types,
            primaryType: eipData.primaryType,
            message: value,
        });

        // @ts-ignore
        const signature = await window.ethereum.request({
            method: 'eth_signTypedData_v4',
            params: [address, msgParams],
        });

        // C. Login
        const authData = await this.login(address, signature, value.timestamp);
        const accessToken = authData.accessToken;

        // D. Create/Get Agent
        const agentData = await this.createAgentWallet(accessToken);

        return {
            accessToken,
            agentAddress: agentData.agentWalletAddress
        };
    }
};
