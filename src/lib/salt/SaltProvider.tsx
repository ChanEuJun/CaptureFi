"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SmartAccount, DelegateSession } from './types';
import { mockSaltClient } from './client';
import { CAPTUREFI_AGENT_POLICY } from './policy';

interface SaltContextType {
    account: SmartAccount | null;
    delegate: DelegateSession | null;
    isLoading: boolean;
    isDeployed: boolean;
    policyActive: boolean;
    connect: () => Promise<void>;
    deploy: () => Promise<void>;
    enableAgent: () => Promise<void>;
    refreshBalance: () => Promise<void>;
}

const SaltContext = createContext<SaltContextType | undefined>(undefined);

export function SaltProvider({ children }: { children: ReactNode }) {
    const [account, setAccount] = useState<SmartAccount | null>(null);
    const [delegate, setDelegate] = useState<DelegateSession | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [policyActive, setPolicyActive] = useState(false);

    const connect = async () => {
        setIsLoading(true);
        try {
            const acc = await mockSaltClient.connect();
            setAccount(acc);
        } catch (e) {
            console.error("Failed to connect Salt account", e);
        } finally {
            setIsLoading(false);
        }
    };

    const deploy = async () => {
        if (!account) return;
        setIsLoading(true);
        try {
            const success = await mockSaltClient.deployAccount(account.address);
            if (success) {
                setAccount(prev => prev ? { ...prev, isDeployed: true } : null);
            }
        } catch (e) {
            console.error("Failed to deploy", e);
        } finally {
            setIsLoading(false);
        }
    };

    const enableAgent = async () => {
        if (!account) return;
        setIsLoading(true);
        try {
            // Create the delegate key
            const newDelegate = await mockSaltClient.createDelegate(account.address);
            setDelegate(newDelegate);

            // Enforce the policy (In reality, this submits a tx to the Smart Account)
            console.log(`Enforcing Policy: ${CAPTUREFI_AGENT_POLICY.name}`);
            setPolicyActive(true);

        } catch (e) {
            console.error("Failed to enable agent", e);
        } finally {
            setIsLoading(false);
        }
    };

    const refreshBalance = async () => {
        if (!account) return;
        const bal = await mockSaltClient.getBalance(account.address);
        setAccount(prev => prev ? { ...prev, balance: bal } : null);
    };

    return (
        <SaltContext.Provider value={{
            account,
            delegate,
            isLoading,
            isDeployed: account?.isDeployed || false,
            policyActive,
            connect,
            deploy,
            enableAgent,
            refreshBalance
        }}>
            {children}
        </SaltContext.Provider>
    );
}

export function useSalt() {
    const context = useContext(SaltContext);
    if (context === undefined) {
        throw new Error('useSalt must be used within a SaltProvider');
    }
    return context;
}
