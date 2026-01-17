"use client";

import { useState } from 'react';
import { useSalt } from '@/lib/salt/SaltProvider';
import { useLiquidityCheck } from '@/hooks/useLiquidityCheck';
import { TradeStrategy, TradeResult, generateTradeCallData } from '@/lib/pear/types';
import { validateAction, PEAR_ROUTER_ADDRESS } from '@/lib/salt/policy';

export function useTradeExecution() {
    const { account } = useSalt();
    const [isExecuting, setIsExecuting] = useState(false);
    const [executionResult, setExecutionResult] = useState<TradeResult | null>(null);

    const executeTrade = async (strategy: TradeStrategy, amount: number): Promise<TradeResult> => {
        setIsExecuting(true);
        setExecutionResult(null);

        try {
            // 1. Validation Checks
            if (!account) throw new Error("No Salt Account connected. Please connect wallet.");

            // 2. Policy Check:
            // Policies are enforced by the Salt Platform on-chain logic, not the client SDK directly.
            // If the transaction violates policy, the Salt RPC/Signer will reject it.cy Check (Client-Side Pre-validation)
            const target = PEAR_ROUTER_ADDRESS;
            const selector = "openPosition(address,uint256,bool,uint256)"; // Check against Policy rule

            if (!validateAction(target, selector)) {
                throw new Error(`Policy Violation: Agent is not allowed to call ${selector} on ${target}`);
            }

            // 3. Liquidity Check
            // Note: In a real flow, we'd trigger the bridge here if needed. 
            // For simpler async logic, we assume the UI handled the bridging step (Funding Component).
            if (account.balance.usdc < amount) {
                throw new Error("Insufficient Liquidity. Please fund the account.");
            }

            // 4. Execute via Backend API (Real Wallet)
            console.log(`[Client] Sending signal to Backend API...`);

            const response = await fetch('/api/signal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    strategy,
                    amount
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "API Execution Failed");
            }

            const result: TradeResult = {
                success: true,
                txHash: data.txHash,
                status: 'EXECUTED'
            };

            setExecutionResult(result);
            return result;

        } catch (e: any) {
            console.error("Trade Execution Failed:", e);
            const failResult: TradeResult = {
                success: false,
                error: e.message,
                status: 'FAILED'
            };
            setExecutionResult(failResult);
            return failResult;
        } finally {
            setIsExecuting(false);
        }
    };

    return {
        executeTrade,
        isExecuting,
        executionResult
    };
}
