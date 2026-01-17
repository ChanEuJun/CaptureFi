import { NextResponse } from 'next/server';
import { PearClient } from '@/lib/pear/PearClient';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { strategy, amount } = body;

        // Validate request
        if (!strategy || !amount) {
            return NextResponse.json(
                { error: 'Missing strategy or amount' },
                { status: 400 }
            );
        }

        // Initialize Pear Client (uses AGENT_PRIVATE_KEY from env)
        const privateKey = process.env.AGENT_PRIVATE_KEY;
        if (!privateKey) {
            throw new Error("AGENT_PRIVATE_KEY is not defined in environment variables");
        }
        const client = new PearClient(privateKey);

        // Log intent
        console.log(`[API] Received Signal: ${strategy.intent}`);
        console.log(`[API] Executing Trade for $${amount} USDC`);

        // Execute based on strategy type
        let result;
        if (strategy.type === 'PAIR') {
            result = await client.createPairTrade({
                longToken: strategy.longTokens[0],
                shortToken: strategy.shortTokens[0],
                leverage: strategy.leverage,
                amount: amount
            });
        } else if (strategy.type === 'BASKET') {
            result = await client.createBasketTrade({
                longTokens: strategy.longTokens,
                shortTokens: strategy.shortTokens,
                leverage: strategy.leverage,
                amount: amount
            });
        } else {
            throw new Error("Unknown Strategy Type");
        }

        return NextResponse.json({
            success: true,
            txHash: result.data.txHash || "0xMockTxHashFromPearAPI",
            data: result.data
        });

    } catch (error: any) {
        console.error('Signal Processing Failed:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
