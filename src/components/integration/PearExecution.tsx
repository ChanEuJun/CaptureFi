"use client";

import React, { useState } from 'react';
import { useTradeExecution } from '@/hooks/useTradeExecution';
import { useLiquidityCheck } from '@/hooks/useLiquidityCheck';
import { TradeStrategy } from '@/lib/pear/types';

export default function PearExecution() {
    const [amount, setAmount] = useState(200);
    const { isReady, hasSufficientFunds } = useLiquidityCheck(amount);
    const { executeTrade, isExecuting, executionResult } = useTradeExecution();

    // Mock Strategy
    const mockStrategy: TradeStrategy = {
        type: 'PAIR',
        longTokens: ['OP'],
        shortTokens: ['ETH'],
        leverage: 20000, // 2x
        intent: "Bullish on Optimism vs Mainnet"
    };

    const handleExecute = async () => {
        await executeTrade(mockStrategy, amount);
    };

    if (!isReady) return <div className="text-zinc-600 italic">Waiting for Account...</div>;

    return (
        <div className="space-y-4">
            {/* Strategy Preview */}
            <div className="bg-zinc-800 p-3 rounded text-xs space-y-1">
                <div className="flex justify-between">
                    <span className="text-zinc-500">Strategy</span>
                    <span className="text-white font-mono">Long OP / Short ETH</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-zinc-500">Leverage</span>
                    <span className="text-purple-400">2.0x</span>
                </div>
                <div className="flex justify-between border-t border-zinc-700 pt-1 mt-1">
                    <span className="text-zinc-500">Cost</span>
                    <span className="text-white font-mono">${amount} USDC</span>
                </div>
            </div>

            {!hasSufficientFunds && (
                <div className="text-xs text-red-400 bg-red-900/20 p-2 rounded">
                    ⚠️ Insufficient Balance. Please use the Funding Module.
                </div>
            )}

            {executionResult && (
                <div className={`p-3 rounded text-xs border ${executionResult.success ? 'bg-green-900/20 border-green-800' : 'bg-red-900/20 border-red-800'}`}>
                    {executionResult.success ? (
                        <div>
                            <h4 className="font-bold text-green-400">Trade Executed!</h4>
                            <p className="text-zinc-400 mt-1">Tx: {executionResult.txHash}</p>
                            <p className="text-zinc-500 mt-1">Policy Validated. Signed by Agent.</p>
                        </div>
                    ) : (
                        <div>
                            <h4 className="font-bold text-red-500">Execution Failed</h4>
                            <p className="text-red-300 mt-1">{executionResult.error}</p>
                        </div>
                    )}
                </div>
            )}

            <button
                onClick={handleExecute}
                disabled={isExecuting || !hasSufficientFunds || (executionResult?.success)}
                className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold rounded shadow-lg shadow-green-900/20 disabled:opacity-50 disabled:shadow-none transition-all"
            >
                {isExecuting ? "Executing Strategy..." : (executionResult?.success ? "Position Open" : "Execute via Pear Protocol")}
            </button>
        </div>
    );
}
