import { useState, useEffect } from "react";

export interface WalletState {
    address: string | null;
    chainId: number | null;
    isConnected: boolean;
    isConnecting: boolean;
    connect: () => Promise<void>;
    disconnect: () => void;
}

export function useWallet(): WalletState {
    const [address, setAddress] = useState<string | null>(null);
    const [chainId, setChainId] = useState<number | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);

    useEffect(() => {
        // Check if already connected
        const checkConnection = async () => {
            // @ts-ignore
            if (window.ethereum) {
                try {
                    // @ts-ignore
                    const accounts = await window.ethereum.request({ method: "eth_accounts" });
                    if (accounts.length > 0) {
                        setAddress(accounts[0]);
                    }
                    // @ts-ignore
                    const chain = await window.ethereum.request({ method: "eth_chainId" });
                    setChainId(parseInt(chain, 16));
                } catch (err) {
                    console.error("Failed to check wallet connection", err);
                }
            }
        };
        checkConnection();
    }, []);

    const connect = async () => {
        setIsConnecting(true);
        // @ts-ignore
        if (typeof window.ethereum !== "undefined") {
            try {
                // @ts-ignore
                const accounts = await window.ethereum.request({
                    method: "eth_requestAccounts",
                });
                setAddress(accounts[0]);
                // @ts-ignore
                const chain = await window.ethereum.request({ method: "eth_chainId" });
                setChainId(parseInt(chain, 16));
            } catch (error) {
                console.error("User rejected request", error);
            } finally {
                setIsConnecting(false);
            }
        } else {
            alert("Please install MetaMask!");
            setIsConnecting(false);
        }
    };

    const disconnect = () => {
        setAddress(null);
        setChainId(null);
    };

    return {
        address,
        chainId,
        isConnected: !!address,
        isConnecting,
        connect,
        disconnect,
    };
}
