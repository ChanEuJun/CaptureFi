import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowRight, CheckCircle2, TrendingUp, AlertTriangle, Lock, UserCheck } from "lucide-react";
import { pearClient } from "@/utils/pearClient";

interface Strategy {
    description: string;
    type: "PAIR" | "BASKET";
    longs: string[];
    shorts: string[];
    rationale?: string;
    confidence?: number;
}

interface PearExecutionProps {
    strategy?: Strategy;
    userAddress?: string | null;
}

const PearExecution = ({ strategy, userAddress }: PearExecutionProps) => {
    const [executing, setExecuting] = useState(false);
    const [txHash, setTxHash] = useState<string | null>(null);

    // Auth State
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [agentAddress, setAgentAddress] = useState<string | null>(null);

    const [activeStrategy, setActiveStrategy] = useState<Strategy>(strategy || {
        description: "Long OP / Short ETH (Deficit Strategy)",
        type: "PAIR",
        longs: ["OP"],
        shorts: ["ETH"],
        confidence: 85
    });

    useEffect(() => {
        if (!strategy) {
            const stored = localStorage.getItem("pendingStrategy");
            if (stored) {
                try {
                    setActiveStrategy(JSON.parse(stored));
                } catch (e) {
                    console.error("Failed to parse pending strategy", e);
                }
            }
        }
    }, [strategy]);

    const handleLogin = async () => {
        if (!userAddress) return alert("Please connect wallet first");
        setIsLoggingIn(true);
        try {
            console.log("Starting Pear Auth for:", userAddress);
            const { accessToken, agentAddress } = await pearClient.authenticate(userAddress);
            console.log("Pear Auth Success. Agent:", agentAddress);
            setAgentAddress(agentAddress);
            setIsAuthenticated(true);
        } catch (error) {
            console.error("Pear Login Failed", error);
            alert("Login Failed: " + (error as Error).message);
        } finally {
            setIsLoggingIn(false);
        }
    };

    const executeTrade = async () => {
        if (!isAuthenticated) return;
        setExecuting(true);
        try {
            // Real Execution would use: pearClient.executeTrade(agentAddress, strategy)
            // But we lack payload structure. 
            // We SIMULATE the execution API call, but we have verified AUTH already (Step 1 complete).

            const response = await fetch("http://localhost:3001/api/execute-trade", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    strategy: activeStrategy,
                    userAddress: userAddress,
                    agentAddress: agentAddress
                }),
            });
            const data = await response.json();
            if (data.success) {
                setTxHash(data.txHash);
            }
        } catch (err) {
            console.error(err);
            alert("Execution Failed");
        } finally {
            setExecuting(false);
        }
    };

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Pear Execution
                </CardTitle>
                <CardDescription>
                    Execute the AI-generated strategy on HyperEVM.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">
                {/* Strategy Details */}
                <div className="space-y-4">
                    <div className="bg-muted/50 p-4 rounded-lg border border-border">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{activeStrategy.type} Trade</span>
                            {activeStrategy.confidence && (
                                <span className="text-xs bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full">
                                    {activeStrategy.confidence}% Conf.
                                </span>
                            )}
                        </div>
                        <p className="font-semibold text-foreground mb-3">{activeStrategy.description}</p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="block text-xs text-muted-foreground mb-1">Long Exposure</span>
                                <div className="flex flex-wrap gap-1">
                                    {activeStrategy.longs.map(t => (
                                        <span key={t} className="bg-green-500/10 text-green-600 px-2 py-1 rounded text-xs font-mono">{t}</span>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <span className="block text-xs text-muted-foreground mb-1">Short Exposure</span>
                                <div className="flex flex-wrap gap-1">
                                    {activeStrategy.shorts.map(t => (
                                        <span key={t} className="bg-red-500/10 text-red-600 px-2 py-1 rounded text-xs font-mono">{t}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-yellow-600 bg-yellow-500/10 p-2 rounded">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Requires funds on HyperEVM (Bridge first if needed).</span>
                    </div>

                    {/* Agent Wallet Status */}
                    {isAuthenticated && agentAddress && (
                        <div className="flex items-center gap-2 text-xs text-green-600 bg-green-500/10 p-2 rounded">
                            <UserCheck className="w-4 h-4" />
                            <span className="font-mono">Agent Active: {agentAddress.slice(0, 6)}...{agentAddress.slice(-4)}</span>
                        </div>
                    )}
                </div>

                {/* Action */}
                <div className="mt-6">
                    {txHash ? (
                        <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-lg flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
                            <CheckCircle2 className="w-8 h-8 text-green-500 mb-2" />
                            <h3 className="font-bold text-green-700">Trade Executed!</h3>
                            <p className="text-xs text-muted-foreground mt-1 break-all">Tx: {txHash}</p>
                            <Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => window.open(`https://explorer.hyperevm.xyz/tx/${txHash}`, '_blank')}>
                                View on Explorer
                            </Button>
                        </div>
                    ) : (
                        <>
                            {!isAuthenticated ? (
                                <Button
                                    className="w-full gap-2"
                                    size="lg"
                                    onClick={handleLogin}
                                    disabled={isLoggingIn || !userAddress}
                                >
                                    <Lock className="w-4 h-4" />
                                    {isLoggingIn ? "Signing In..." : "Sign in to Pear Protocol"}
                                </Button>
                            ) : (
                                <Button
                                    className="w-full"
                                    size="lg"
                                    onClick={executeTrade}
                                    disabled={executing}
                                >
                                    {executing ? "Executing via Agent..." : "Confirm & Execute Trade"}
                                    {!executing && <ArrowRight className="w-4 h-4 ml-2" />}
                                </Button>
                            )}
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default PearExecution;
