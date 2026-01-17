
export interface AnalyzeRequest {
    text: string;
}

export interface TradeStructure {
    type: "PAIR" | "BASKET_LONG" | "BASKET_SHORT" | "CONDITIONAL" | "DIRECTIONAL";
    primary_asset: string;
    secondary_asset?: string;
    direction: "LONG" | "SHORT" | "MARKET_NEUTRAL";
    execution_strategy: {
        entry_type: "MARKET" | "LIMIT" | "STOP_LIMIT";
        limit_price_logic: string;
        condition?: string;
    };
}

export interface RiskParameters {
    stop_loss_logic: string;
    take_profit_logic: string;
}

export interface AnalyzeResponse {
    market_thesis: string;
    reasoning_chain: string;
    trade_structure: TradeStructure;
    risk_parameters: RiskParameters;
    confidence_score: number;
    relevant_sentiment_ids?: string[];
}
