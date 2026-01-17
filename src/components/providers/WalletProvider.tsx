import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';

declare global {
    interface Window {
        ethereum?: any;
    }
}

interface WalletContextType {
    address: string | null;
    signer: ethers.JsonRpcSigner | null;
    isConnecting: boolean;
    connect: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
    const [address, setAddress] = useState<string | null>(null);
    const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);

    // Auto-connect if already authorized
    useEffect(() => {
        const checkConnection = async () => {
            if (typeof window !== 'undefined' && window.ethereum) {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const accounts = await provider.listAccounts();
                if (accounts.length > 0) {
                    const s = await provider.getSigner();
                    setAddress(accounts[0].address);
                    setSigner(s);
                }
            }
        };
        checkConnection();
    }, []);

    const connect = async () => {
        if (typeof window === 'undefined' || !window.ethereum) {
            alert("Please install MetaMask to bridge funds.");
            return;
        }

        setIsConnecting(true);
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            // Request accounts access
            await provider.send("eth_requestAccounts", []);
            const s = await provider.getSigner();
            const addr = await s.getAddress();

            setSigner(s);
            setAddress(addr);
        } catch (error) {
            console.error("Wallet connection failed:", error);
        } finally {
            setIsConnecting(false);
        }
    };

    return (
        <WalletContext.Provider value={{ address, signer, isConnecting, connect }}>
            {children}
        </WalletContext.Provider>
    );
}

export function useWallet() {
    const context = useContext(WalletContext);
    if (context === undefined) {
        throw new Error('useWallet must be used within a WalletProvider');
    }
    return context;
}
