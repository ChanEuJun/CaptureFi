"use client";

import { useSalt } from '@/lib/salt/SaltProvider';
import { useMemo } from 'react';

// HyperEVM uses USDC as the primary stablecoin for trading
const REQUIRED_BUFFER_PCT = 1.05; // 5% buffer for gas/fees

export function useLiquidityCheck(tradeAmountUSDC: number) {
    const { account, isLoading: isSaltLoading } = useSalt();

    const status = useMemo(() => {
        if (!account) return { isReady: false, deficit: 0, currentBalance: 0 };

        const currentBalance = account.balance.usdc;
        const requiredAmount = tradeAmountUSDC * REQUIRED_BUFFER_PCT;
        const deficit = Math.max(0, requiredAmount - currentBalance);
        const hasSufficientFunds = deficit === 0;

        return {
            isReady: true,
            currentBalance,
            requiredAmount,
            deficit,
            hasSufficientFunds
        };
    }, [account, tradeAmountUSDC]);

    return {
        ...status,
        isLoading: isSaltLoading
    };
}
