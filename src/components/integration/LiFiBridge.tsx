"use client";

import React, { useState } from 'react';
import { useSalt } from '@/lib/salt/SaltProvider';
import { useLiquidityCheck } from '@/hooks/useLiquidityCheck';

// Mock LI.FI integration for the Hackathon
// In a real app, we would import { LiFiWidget } from '@lifi/widget'

interface LiFiBridgeProps {
    requiredAmount: number;
    onBridgeComplete: () => void;
}

export default function LiFiBridge({ requiredAmount, onBridgeComplete }: LiFiBridgeProps) {
    const { account, refreshBalance } = useSalt();
    const { deficit } = useLiquidityCheck(requiredAmount);

    const [bridgingState, setBridgingState] = useState<"IDLE" | "QUOTING" | "BRIDGING" | "COMPLETED">("IDLE");

    const startBridge = async () => {
        if (!account) return;

        // 1. Get Quote (Mock)
        setBridgingState("QUOTING");
        await new Promise(r => setTimeout(r, 1500));

        // 2. Execute Bridge (Mock)
        setBridgingState("BRIDGING");
        await new Promise(r => setTimeout(r, 3000));

        // 3. Update Balance (Mocking the funds arriving)
        // We hack the client balance here to simulate the arrival
        account.balance.usdc += (deficit + 10); // Add a bit extra
        await refreshBalance();

        setBridgingState("COMPLETED");
        setTimeout(() => {
            onBridgeComplete();
        }, 1000);
    };

    if (bridgingState === "COMPLETED") {
        return (
            <div className="bg-green-900/20 border border-green-900 p-4 rounded-lg text-center animate-in fade-in">
                <h3 className="text-green-400 font-bold mb-1">Bridging Complete</h3>
                <p className="text-xs text-green-300">Funds arrived on HyperEVM</p>
            </div>
        );
    }

    if (bridgingState === "BRIDGING") {
        return (
            <div className="bg-zinc-900 border border-zinc-700 p-4 rounded-lg space-y-3">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>Via LI.FI</span>
                    <span className="animate-pulse text-blue-400">Bridging...</span>
                </div>

                <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-blue-500 h-full w-2/3 animate-pulse"></div>
                </div>

                <div className="flex justify-between items-center bg-zinc-950 p-2 rounded">
                    <span className="text-xs text-zinc-500">Base (USDC)</span>
                    <span className="text-xs text-zinc-500">→</span>
                    <span className="text-xs text-zinc-300">HyperEVM</span>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-zinc-900 border border-zinc-700 p-4 rounded-lg space-y-3">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-white font-medium text-sm">Insuficient Funds</h3>
                    <p className="text-xs text-zinc-500 mt-1">
                        Bridge required to execute trade.
                    </p>
                </div>
                <div className="text-right">
                    <span className="block text-xl font-mono text-red-400">-${deficit.toFixed(2)}</span>
                    <span className="text-[10px] text-zinc-500">DEFICIT</span>
                </div>
            </div>

            <div className="bg-zinc-950 p-3 rounded border border-zinc-800 space-y-2">
                <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Route</span>
                    <span className="text-zinc-300">Arbitrum → HyperEVM</span>
                </div>
                <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Est. Time</span>
                    <span className="text-zinc-300">~45s</span>
                </div>
                <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Fees</span>
                    <span className="text-zinc-300">$0.02</span>
                </div>
            </div>

            <button
                onClick={startBridge}
                disabled={bridgingState !== "IDLE"}
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded transition-colors"
            >
                {bridgingState === "QUOTING" ? "Finding Best Route..." : `Bridge $${Math.ceil(deficit)} via LI.FI`}
            </button>

            <p className="text-[10px] text-center text-zinc-600">
                Powered by LI.FI
            </p>
        </div>
    );
}
