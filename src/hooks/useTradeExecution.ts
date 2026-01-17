"use client";

import { useState } from 'react';
import { useSalt } from '@/lib/salt/SaltProvider';
import { useLiquidityCheck } from '@/hooks/useLiquidityCheck';
import { TradeStrategy, TradeResult, generateTradeCallData } from '@/lib/pear/types';
import { validateAction, PEAR_ROUTER_ADDRESS } from '@/lib/salt/policy';

export function useTradeExecution() {
    const { account, delegate, policyActive } = useSalt();
    const [isExecuting, setIsExecuting] = useState(false);
    const [executionResult, setExecutionResult] = useState<TradeResult | null>(null);

    const executeTrade = async (strategy: TradeStrategy, amount: number): Promise<TradeResult> => {
        setIsExecuting(true);
        setExecutionResult(null);

        try {
            // 1. Validation Checks
            if (!account || !delegate) throw new Error("No Smart Account or Delegate available.");
            if (!policyActive) throw new Error("Agent Policy is not active. Execution blocked.");

            // 2. Policy Check (Client-Side Pre-validation)
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

            // 4. Construct Transaction (Pear SDK)
            const callData = generateTradeCallData(strategy, amount);

            // 5. Execute via Salt Delegate (Mock Network Call)
            console.log(`[Salt Agent] Executing Trade on Pear Router...`);
            console.log(`[Auth] Signed by Delegate: ${delegate.publicKey}`);
            console.log(`[Data] ${callData.slice(0, 20)}...`);

            await new Promise(r => setTimeout(r, 2000)); // Network delay

            const result: TradeResult = {
                success: true,
                txHash: "0x" + Math.random().toString(16).slice(2),
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
