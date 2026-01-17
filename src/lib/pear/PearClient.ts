import axios, { AxiosInstance } from 'axios';
import { ethers } from 'ethers';

interface PairTradeParams {
  longToken: string;
  shortToken: string;
  leverage: number; // e.g., 20000 for 2x (assuming basis points or protocol specific)
  amount: number; // USDC amount
}

interface BasketTradeParams {
  longTokens: string[];
  shortTokens: string[];
  leverage: number;
  amount: number;
}

export class PearClient {
  private baseUrl = 'https://hl-v2.pearprotocol.io';
  private api: AxiosInstance;
  private wallet: ethers.Wallet;
  private clientId: string;
  private accessToken: string | null = null;

  constructor(privateKey?: string, clientId: string = 'HLHackathon1') {
    const key = privateKey || process.env.AGENT_PRIVATE_KEY;
    if (!key) {
      throw new Error("PearClient requires a Private Key (passed or AGENT_PRIVATE_KEY env var)");
    }
    this.wallet = new ethers.Wallet(key);
    this.clientId = clientId;
    this.api = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to attach token
    this.api.interceptors.request.use((config) => {
      if (this.accessToken) {
        config.headers.Authorization = `Bearer ${this.accessToken}`;
      }
      return config;
    });
  }

  /**
   * Authenticate with Pear Protocol using EIP-712
   */
  async authenticate() {
    try {
      // 1. Get EIP-712 message
      // Requires both clientId and wallet address as params
      console.log(`[PearClient] Wrapper: Fetching EIP-712 message for client ${this.clientId} & address ${this.wallet.address}...`);
      const msgRes = await this.api.get(`/auth/eip712-message`, {
        params: {
          address: this.wallet.address,
          clientId: this.clientId
        }
      });
      console.log(`[PearClient] Wrapper: Message received.`);

      const eipData = msgRes.data;
      const { domain, types, message: value } = eipData;

      // 2. Sign the message
      // Note: The snippet deletes EIP712Domain from types before signing
      if (types.EIP712Domain) {
        delete types.EIP712Domain;
      }

      console.log(`[PearClient] Wrapper: Signing message with wallet ${this.wallet.address}...`);
      const signature = await this.wallet.signTypedData(domain, types, value);

      // 3. Authenticate / Login
      // Snippet uses /auth/login and specific body structure
      console.log(`[PearClient] Wrapper: Authenticating via /auth/login...`);
      const authRes = await this.api.post('/auth/login', {
        method: 'eip712',
        address: this.wallet.address,
        clientId: this.clientId,
        details: {
          signature,
          timestamp: value.timestamp // Ensure we pass back the timestamp from the message
        },
      });

      this.accessToken = authRes.data.accessToken;
      console.log('Pear Protocol Authentication Successful');
    } catch (error) {
      console.error('Pear Auth Failed:', error);
      throw error;
    }
  }

  /**
   * Execute a Pair Trade (Long A / Short B)
   */
  async createPairTrade(params: PairTradeParams) {
    if (!this.accessToken) await this.authenticate();

    // Mapping params to Pear API structure
    // Endpoint likely /orders based on Discord context
    return this.api.post('/orders', {
      type: 'pair',
      ...params,
    });
  }

  /**
   * Execute a Basket Trade (Long [A, B] / Short [C, D])
   */
  async createBasketTrade(params: BasketTradeParams) {
    if (!this.accessToken) await this.authenticate();

    return this.api.post('/orders', {
      type: 'basket',
      ...params,
    });
  }

  /**
   * Mock method to get active trades
   */
  async getActiveTrades() {
    if (!this.accessToken) await this.authenticate();
    return this.api.get('/positions');
  }
}
