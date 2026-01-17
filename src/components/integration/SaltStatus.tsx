"use client";

import React from 'react';
import { useSalt } from '@/lib/salt/SaltProvider';

export default function SaltStatus() {
    const {
        account,
        isDeployed,
        isLoading,
        policyActive,
        connect,
        deploy,
        enableAgent
    } = useSalt();

    if (!account) {
        return (
            <div className="p-4 border border-zinc-800 rounded-lg bg-zinc-900">
                <h3 className="text-zinc-400 text-sm mb-2">Identify</h3>
                <button
                    onClick={connect}
                    disabled={isLoading}
                    className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded transition-colors disabled:opacity-50"
                >
                    {isLoading ? "Connecting..." : "Connect Salt Account"}
                </button>
            </div>
        );
    }

    return (
        <div className="p-4 border border-zinc-800 rounded-lg bg-zinc-900 space-y-4">
            {/* Account Info */}
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-zinc-400 text-sm">Smart Account</h3>
                    <p className="font-mono text-xs text-zinc-200 mt-1 truncate max-w-[200px]" title={account.address}>
                        {account.address}
                    </p>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-bold ${isDeployed ? "bg-green-900 text-green-300" : "bg-yellow-900 text-yellow-300"}`}>
                    {isDeployed ? "DEPLOYED" : "UNDEPLOYED"}
                </div>
            </div>

            {/* Deploy Action */}
            {!isDeployed && (
                <button
                    onClick={deploy}
                    disabled={isLoading}
                    className="w-full py-2 px-4 bg-yellow-700 hover:bg-yellow-600 text-white text-sm font-medium rounded transition-colors disabled:opacity-50"
                >
                    {isLoading ? "Deploying..." : "Deploy Smart Account"}
                </button>
            )}

            {/* Policy Status */}
            <div className="pt-2 border-t border-zinc-800">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-zinc-400 text-sm">Agent Policy</h3>
                    <span className={`text-xs ${policyActive ? "text-green-400" : "text-red-400"}`}>
                        {policyActive ? "ACTIVE" : "INACTIVE"}
                    </span>
                </div>

                {policyActive ? (
                    <div className="bg-green-900/20 border border-green-900 p-2 rounded">
                        <p className="text-xs text-green-300">
                            ✓ Whitelisted: Open/Close Trades
                        </p>
                        <p className="text-xs text-green-300">
                            ✓ Blocked: Withdrawals
                        </p>
                    </div>
                ) : (
                    <button
                        onClick={enableAgent}
                        disabled={isLoading || !isDeployed}
                        className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded transition-colors disabled:opacity-50 disabled:grayscale"
                    >
                        {isLoading ? "Enabling..." : "Enable CaptureFi Agent"}
                    </button>
                )}
            </div>

            {/* Balances */}
            {isDeployed && (
                <div className="pt-2 border-t border-zinc-800 grid grid-cols-2 gap-2">
                    <div className="bg-zinc-800 p-2 rounded">
                        <span className="block text-[10px] text-zinc-500 uppercase tracking-wider">USDC</span>
                        <span className="text-sm font-mono text-white">${account.balance.usdc.toFixed(2)}</span>
                    </div>
                    <div className="bg-zinc-800 p-2 rounded">
                        <span className="block text-[10px] text-zinc-500 uppercase tracking-wider">HYPE</span>
                        <span className="text-sm font-mono text-white">{account.balance.hype.toFixed(4)}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
