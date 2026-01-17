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

  constructor(privateKey: string, clientId: string = 'HLHackathon1') {
    this.wallet = new ethers.Wallet(privateKey);
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
      const msgRes = await this.api.get(`/authentication/eip712-message?clientId=${this.clientId}`);
      const { types, domain, message } = msgRes.data;

      // 2. Sign the message
      // Note: verify the domain/types structure matches ethers requirements
      // Defaulting to simple signMessage if types aren't standard EIP-712 object, 
      // but assuming typed data signing is needed:
      const signature = await this.wallet.signTypedData(domain, types, message);

      // 3. Authenticate
      const authRes = await this.api.post('/authentication/authenticate', {
        signature,
        clientId: this.clientId,
        walletAddress: this.wallet.address,
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

    // Mapping params to Pear API structure (Mock structure based on description)
    // In reality, we'd need exact endpoint details.
    return this.api.post('/trade/pair', {
      type: 'pair',
      ...params,
    });
  }

  /**
   * Execute a Basket Trade (Long [A, B] / Short [C, D])
   */
  async createBasketTrade(params: BasketTradeParams) {
    if (!this.accessToken) await this.authenticate();

    return this.api.post('/trade/basket', {
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
