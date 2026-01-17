"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { SmartAccount, DelegateSession } from './types';
import { saltClient } from './client';
import { useWallet } from '@/components/providers/WalletProvider';

interface SaltContextType {
    account: SmartAccount | null;
    isLoading: boolean;
    connect: () => Promise<void>;
}

const SaltContext = createContext<SaltContextType | undefined>(undefined);

export function SaltProvider({ children }: { children: ReactNode }) {
    const { signer } = useWallet();
    const [account, setAccount] = useState<SmartAccount | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const connect = async () => {
        if (!signer) return;
        setIsLoading(true);
        try {
            const acc = await saltClient.connect(signer);
            setAccount(acc);
        } catch (e) {
            console.error("Failed to connect Salt account", e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SaltContext.Provider value={{
            account,
            isLoading,
            connect,
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
