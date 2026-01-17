export interface TradeStrategy {
    type: 'PAIR' | 'BASKET';
    longTokens: string[];
    shortTokens: string[];
    leverage: number; // 1x = 10000 ?
    intent?: string; // "Bullish on L2s"
}

export interface TradeResult {
    success: boolean;
    txHash?: string;
    error?: string;
    status: 'PENDING' | 'EXECUTED' | 'FAILED';
}

// Mocking the raw transaction data that the Pear SDK would return
// In a real app, this would come from the API/SDK
export const generateTradeCallData = (strategy: TradeStrategy, amount: number) => {
    // This is a fake function selector + encoded params
    // Function: openPosition(...)
    const selector = "0x897f23a5";
    const payload = JSON.stringify({ strategy, amount });
    const encoded = Buffer.from(payload).toString('hex');

    return `${selector}${encoded}`;
};
