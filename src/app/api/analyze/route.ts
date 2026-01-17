
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Inline types to avoid resolution issues during dev
interface AnalyzeRequest {
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

const SYSTEM_PROMPT = `
### ROLE & OBJECTIVE
You are an expert Hedge Fund Portfolio Manager and Quantitative Strategist. Your goal is to analyze aggregated unstructured market sentiments and synthesize them into a single, high-conviction, complex trade structure. You do not provide simple "buy/sell" advice; you construct sophisticated trade mechanics (Pairs, Baskets, Conditionals) to express a specific market thesis.

### ANALYSIS FRAMEWORK (CHAIN OF THOUGHT)
Before generating the JSON output, you must perform a "Strategic Reasoning" step where you:
1.  **Identify the Dominant Narrative:** What is the loud signal vs. the contrarian opportunity?
2.  **Determine the Correlation:** Are there assets moving together (Basket opportunity) or diverging (Pair Trade opportunity)?
3.  **Assess the Horizon:** Is this a short-term volatility play or a medium-term structural shift?
4.  **Select the Vehicle:**
    * *Pair Trade:* Long Asset A / Short Asset B (Market Neutral).
    * *Directional Basket:* Long a specific sector theme (e.g., "Long Cybersec, Short Legacy Tech").
    * *Conditional:* Enter ONLY if Asset X crosses Price Y.

### TRADING CONSTRAINTS
* **Risk Management:** Every trade must have a clearly defined invalidation point (Stop Loss logic).
* **Complexity:** Do not suggest simple spot buys unless the conviction is maximum. Prefer hedged structures.
* **Asset Class:** Focus on liquid equities, ETFs, and major forex pairs mentioned in the sentiments.

### OUTPUT FORMAT
You must strictly output a JSON object. Do not output conversational text outside the JSON.

{
  "market_thesis": "A concise summary of the narrative driving this trade.",
  "reasoning_chain": "Step-by-step logic derived from the sentiment data.",
  "trade_structure": {
    "type": "PAIR | BASKET_LONG | BASKET_SHORT | CONDITIONAL | DIRECTIONAL",
    "primary_asset": "Ticker Symbol",
    "secondary_asset": "Ticker Symbol (if Pair/Hedge)",
    "direction": "LONG | SHORT | MARKET_NEUTRAL",
    "execution_strategy": {
      "entry_type": "MARKET | LIMIT | STOP_LIMIT",
      "limit_price_logic": "e.g., Entry at 5-day EMA or specific sentiment trigger",
      "condition": "e.g., VIX > 20"
    }
  },
  "risk_parameters": {
    "stop_loss_logic": "The condition or price level that invalidates the thesis.",
    "take_profit_logic": "The target scenario."
  },
  "confidence_score": 0-100,
  "relevant_sentiment_ids": ["List of IDs from input data that triggered this trade"]
}
`;

export async function POST(request: Request) {
    try {
        const body: AnalyzeRequest = await request.json();

        if (!body.text) {
            return NextResponse.json(
                { success: false, error: 'Text input is required' },
                { status: 400 }
            );
        }

        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                { success: false, error: 'GEMINI_API_KEY is not configured' },
                { status: 500 }
            );
        }

        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            // Using a model that should exist, but wrapping in try/catch to fallback
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: { responseMimeType: "application/json" } });

            const prompt = `${SYSTEM_PROMPT}\n\n### INPUT DATA\n${body.text}`;

            const result = await model.generateContent(prompt);
            const response = result.response;
            const text = response.text();

            // Parse JSON to ensure it matches the schema (basic check)
            const jsonResponse: AnalyzeResponse = JSON.parse(text);

            return NextResponse.json(jsonResponse);
        } catch (genAIError) {
            console.error("Gemini API Failed (falling back to mock):", genAIError);

            // FALLBACK MOCK LOGIC
            // Simple keyword matching for better demo experience
            const textLower = body.text.toLowerCase();
            let mockTradeStructure: TradeStructure = {
                type: 'PAIR',
                primary_asset: 'BTC',
                secondary_asset: 'USDC',
                direction: 'LONG',
                execution_strategy: {
                    entry_type: "MARKET",
                    limit_price_logic: "Market Entry"
                }
            };

            if (textLower.includes("eth") && textLower.includes("bear")) {
                mockTradeStructure = {
                    type: 'PAIR',
                    primary_asset: 'USDC',
                    secondary_asset: 'ETH',
                    direction: 'LONG', // Short ETH relative to USDC
                    execution_strategy: {
                        entry_type: "MARKET",
                        limit_price_logic: "Market Entry"
                    }
                };
            } else if (textLower.includes("op") && textLower.includes("bull")) {
                mockTradeStructure = {
                    type: 'PAIR',
                    primary_asset: 'OP',
                    secondary_asset: 'ETH',
                    direction: 'LONG',
                    execution_strategy: {
                        entry_type: "MARKET",
                        limit_price_logic: "Market Entry"
                    }
                };
            }
            else if (textLower.includes("sol") && textLower.includes("king")) {
                mockTradeStructure = {
                    type: "PAIR",
                    primary_asset: "SOL",
                    secondary_asset: "ETH",
                    direction: "LONG",
                    execution_strategy: {
                        entry_type: "MARKET",
                        limit_price_logic: "Market Entry"
                    }
                };
            }

            const response: AnalyzeResponse = {
                market_thesis: "Mock Fallback Thesis: " + mockTradeStructure.primary_asset + " conviction.",
                reasoning_chain: "The AI API failed (Invalid Key/Model), so we are generating a mock deterministic response based on keywords.",
                trade_structure: mockTradeStructure,
                risk_parameters: {
                    stop_loss_logic: "Mock Stop Loss",
                    take_profit_logic: "Mock Take Profit"
                },
                confidence_score: 85
            };

            return NextResponse.json(response);
        }

    } catch (error) {
        console.error('AI Analysis Error:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
