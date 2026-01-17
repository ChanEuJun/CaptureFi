"use client";

import React, { useState } from 'react';
import { useSalt } from '@/lib/salt/SaltProvider';
import { useLiquidityCheck } from '@/hooks/useLiquidityCheck';
import { useWallet } from '@/components/providers/WalletProvider';
import { createConfig, getRoutes, executeRoute, RoutesRequest, Route } from '@lifi/sdk';

// Mock LI.FI integration for the Hackathon
// In a real app, we would import { LiFiWidget } from '@lifi/widget'

interface LiFiBridgeProps {
    requiredAmount: number;
    onBridgeComplete: () => void;
}

// Initialize LiFi Config (Singleton)
const integrator = 'CaptureFi_Hackathon';
const apiKey = process.env.NEXT_PUBLIC_LIFI_API_KEY;

createConfig({
    integrator: integrator,
    apiKey: apiKey, // Will be undefined if not set, SDK handles this
});

export default function LiFiBridge({ requiredAmount, onBridgeComplete }: LiFiBridgeProps) {
    const { account } = useSalt();
    const { deficit } = useLiquidityCheck(requiredAmount);
    const { signer, connect, connect: connectWallet, isConnecting, address } = useWallet();

    const [bridgingState, setBridgingState] = useState<"IDLE" | "QUOTING" | "BRIDGING" | "COMPLETED">("IDLE");
    const [route, setRoute] = useState<Route | null>(null);

    const getQuote = async () => {
        if (!account || !signer) return;
        setBridgingState("QUOTING");

        try {
            // Setup: Arbitrum USDC -> HyperEVM USDC
            // Note: HyperEVM ChainID is 999 (Main) or 998 (Test). Assuming 999 based on context docs.
            // Arbitrum ChainID is 42161.
            const quoteRequest: RoutesRequest = {
                fromChainId: 42161, // Arbitrum One
                fromTokenAddress: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", // USDC on Arb
                toChainId: 999, // HyperEVM
                toTokenAddress: "0xUSDC_ON_HYPEREVM_ADDRESS_HERE", // TODO: Update with real address if available
                fromAmount: (Math.ceil(deficit) * 1_000_000).toString(), // USDC 6 decimals
                toAddress: account.address, // Destination is the Salt Smart Account
            };

            // Using dummy route fetch for now if specific token addresses for HyperEVM aren't handy
            // In a real hackathon verify the USDC address on HyperEVM.
            // For now, I will use a simplified call or catch the error if tokens aren't mapped.

            // Fetch routes
            const routes = await getRoutes(quoteRequest);

            if (routes.routes.length > 0) {
                setRoute(routes.routes[0]);
            } else {
                console.error("No LiFi routes found.");
                setBridgingState("IDLE");
            }

        } catch (e) {
            console.error("LiFi Quote Failed", e);
            setBridgingState("IDLE");
        }
    };

    const startBridge = async () => {
        if (!signer || !route) return;
        setBridgingState("BRIDGING");

        try {
            // Execute Route (SDK v3 keeps state internally or uses global config)
            // Note: If using bare createConfig(), it attempts to use window.ethereum.
            await executeRoute(route);

            // Bridge Success
            // await refreshBalance(); // Refresh Salt Account balance (Removed: Manual refresh needed via UI for hackathon)
            setBridgingState("COMPLETED");
            setTimeout(onBridgeComplete, 2000);

        } catch (e) {
            console.error("LiFi Execution Failed", e);
            setBridgingState("IDLE"); // Allow retry
        }
    };

    if (bridgingState === "COMPLETED") {
        return (
            <div className="bg-green-900/20 border border-green-900 p-4 rounded-lg text-center animate-in fade-in">
                <h3 className="text-green-400 font-bold mb-1">Bridging Complete</h3>
                <p className="text-xs text-green-300">Funds arrived on HyperEVM</p>
            </div>
        );
    }

    // ... UI Render Logic ...
    return (
        <div className="bg-zinc-900 border border-zinc-700 p-4 rounded-lg space-y-3">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-white font-medium text-sm">Insufficient Funds</h3>
                    <p className="text-xs text-zinc-500 mt-1">
                        Bridge required to execute trade.
                    </p>
                </div>
                <div className="text-right">
                    <span className="block text-xl font-mono text-red-400">-${deficit.toFixed(2)}</span>
                    <span className="text-[10px] text-zinc-500">DEFICIT</span>
                </div>
            </div>

            {/* Wallet Connect State */}
            {!address ? (
                <button
                    onClick={connect}
                    disabled={isConnecting}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded transition-colors"
                >
                    {isConnecting ? "Connecting..." : "Connect Wallet to Bridge"}
                </button>
            ) : (
                <>
                    {/* Bridge Action */}
                    {!route && bridgingState === "IDLE" ? (
                        <button
                            onClick={getQuote}
                            className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded transition-colors"
                        >
                            Get Bridge Quote
                        </button>
                    ) : (
                        <div className="space-y-2">
                            {route && (
                                <div className="bg-zinc-950 p-2 text-xs rounded border border-zinc-800">
                                    <div className="flex justify-between">
                                        <span className="text-zinc-500">Gas Cost</span>
                                        <span>${route.fromAmountUSD}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-zinc-500">Est. Time</span>
                                        <span>{Math.ceil(route.insurance.state === 'INSURED' ? 0 : 30)}s</span>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={startBridge}
                                disabled={bridgingState === "BRIDGING" || !route}
                                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded transition-colors"
                            >
                                {bridgingState === "BRIDGING" ? "Bridging in Progress..." : "Confirm Bridge"}
                            </button>
                        </div>
                    )}
                </>
            )}

            <p className="text-[10px] text-center text-zinc-600">
                Powered by LI.FI
            </p>
        </div>
    );
}
