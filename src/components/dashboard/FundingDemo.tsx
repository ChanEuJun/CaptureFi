"use client";

import React from 'react';
import LiFiBridge from '@/components/integration/LiFiBridge';
import { useLiquidityCheck } from '@/hooks/useLiquidityCheck';

export default function FundingDemo() {
    // Demo: We want to trade $200
    const TRADE_AMOUNT = 200;
    const { isReady, hasSufficientFunds } = useLiquidityCheck(TRADE_AMOUNT);

    if (!isReady) {
        return <div className="text-zinc-500 text-sm">Please connect Smart Account first.</div>;
    }

    if (hasSufficientFunds) {
        return (
            <div className="bg-green-900/20 border border-green-900 p-4 rounded-lg text-center">
                <h3 className="text-green-400 font-bold mb-1">Liquidity Sufficient</h3>
                <p className="text-xs text-green-300">Ready for Execution</p>
            </div>
        );
    }

    return (
        <LiFiBridge
            requiredAmount={TRADE_AMOUNT}
            onBridgeComplete={() => console.log("Bridging Done")}
        />
    );
}
