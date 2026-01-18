import { useState, useEffect, useRef } from "react";
import { Send, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

interface Strategy {
    description: string;
    type: "PAIR" | "BASKET";
    longs: string[];
    shorts: string[];
    rationale?: string;
    confidence?: number;
}

interface Message {
    id: string;
    role: "user" | "agent";
    content: string;
    citations?: string[];
    strategy?: Strategy;
}

const AutomateTrades = () => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            role: "user",
            content: "Set preferences. cap max trade size at $5000 USD and restrict transactions to the HyperEVM mainnet.",
        },
        {
            id: "2",
            role: "agent",
            content: "Parameters locked.\n- **Max Allocation:** $5,000.00 USD\n- **Network Constraint:** HyperEVM Mainnet (L2)\n- **Asset Universe:** Native HYPE, wBTC, wETH, and other bridged assets available on HyperEVM.",
        },
        {
            id: "3",
            role: "user",
            content: "Now, based on the content identified as urgent, what is the narrative?",
        },
        {
            id: "4",
            role: "agent",
            content: "- **Sentiment Summary:**\n    - **Short-Term (2-4 Weeks):** **Bearish/Correctional.** Analysts predict a rejection at the 200-Day Moving Average (~$106k for BTC), citing a historical fractal from 2019 where price consolidated downward before the real move. Analysts are actively shorting this retest.\n    - **Long-Term (2026+):** **Extremely Bullish.** Driven by 'infinite' demand from MicroStrategy and ETFs vs. limited supply. He expects a massive liquidity injection to eventually drive prices to $1M by 2030.",
        },
        {
            id: "5",
            role: "user",
            content: "Okay, based on that short-term bearish view, generate a trade suggestion and provide some evidence for your rationale.",
        },
        {
            id: "6",
            role: "agent",
            content: "**Trade Recommendation: Tactical Short via HyperEVM**\n\nBased on the analyst's conviction that the '200 daily' moving average will act as a rejection point, I recommend a **Conditional Directional Short**.\n- **Trade Structure:** Short **wBTC** (Wrapped Bitcoin on HyperEVM)\n- **Entry Strategy:** Limit Sell at the 200-Day Moving Average retest.\n- **Target:** Liquidity flush lower (referencing the '2019 consolidation' pattern).",
            citations: [
                "'I'm expecting within the next two, three, four weeks for Bitcoin to get to the 200 daily... I'm actually shorting at those price levels because... prices always come to the downside.'",
                "'I think we're going to see a repeat of the 2019 price action where price does consolidate towards the downside.'",
            ],
            strategy: {
                description: "Short wBTC (Limit Sell @ 200DMA Retest)",
                type: "PAIR",
                longs: [],
                shorts: ["wBTC"],
                rationale: "Rejection at 200DMA expected based on 2019 fractal.",
                confidence: 85,
            },
        },
        {
            id: "7",
            role: "user",
            content: "Complete it for me. Set a smart contract which only execute the trade under profitable conditions, taking into account slippage and favorable funding rates.",
        },
        {
            id: "8",
            role: "agent",
            content: "Understood. I will not broadcast this as a raw transaction. I am deploying a **Salt Policy** to handle the execution.\n\n**Deploying Salt Smart Contract...**\n- **Policy Defined:** `PROFITABILITY_CHECK_REQUIRED`\n- **Condition A (Slippage):** Revert if effective entry price deviates > 0.5% from oracle price.\n- **Condition B (Funding):** Execute only if implied funding rate on Hyperliquid does not exceed -0.01% hourly (avoiding expensive short costs).\n\n**Status:** The Salt Smart Contract is now active and monitoring the HyperEVM mempool. It will strictly execute the **Short wBTC** order only when these profitable conditions are met.",
        },
    ]);

    // UI State
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Salt Policy State
    const [saltPolicy, setSaltPolicy] = useState<{
        maxTradeSize: number;
        allowedAssets: string[];
        allowShorts: boolean;
    } | null>({
        maxTradeSize: 5000,
        allowedAssets: ["HYPE", "wBTC", "wETH"],
        allowShorts: true,
    });

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input,
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const response = await fetch("http://localhost:3001/api/agent/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMsg.content }),
            });
            const data = await response.json();

            if (data.success) {
                // Update Policy State if returned
                if (data.policyState) {
                    setSaltPolicy(data.policyState);
                }

                const agentMsg: Message = {
                    id: Date.now().toString() + "_agent",
                    role: "agent",
                    content: data.reply,
                    citations: data.citations,
                    strategy: data.strategy,
                };
                setMessages((prev) => [...prev, agentMsg]);
            } else {
                throw new Error("Failed to get response");
            }
        } catch (err) {
            console.error(err);
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now().toString() + "_err",
                    role: "agent",
                    content: "Sorry, I encountered an error analyzing your request.",
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const executeStrategy = (strategy: Strategy) => {
        localStorage.setItem("pendingStrategy", JSON.stringify(strategy));
        window.location.href = "/?view=bridge-and-execute";
    };

    return (
        <div className="flex flex-col h-full bg-background relative">
            {/* Header */}
            <div className="p-4 border-b border-sidebar-border bg-sidebar/50">
                <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h1 className="text-xl font-bold">AI Agent Chat</h1>
                </div>
                {/* Salt Policy Status Bar */}
                <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground bg-background/50 p-2 rounded-lg border border-border">
                    <span className="font-bold text-foreground">SALT POLICY:</span>
                    <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">MAX:</span>
                        <span className="text-primary">${saltPolicy?.maxTradeSize ?? 1000}</span>
                    </div>
                    <div className="w-px h-3 bg-border"></div>
                    <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">SHORTS:</span>
                        <span className={saltPolicy?.allowShorts !== false ? "text-green-500" : "text-red-500"}>
                            {saltPolicy?.allowShorts !== false ? "ALLOWED" : "BLOCKED"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
                <AnimatePresence>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`max-w-[80%] rounded-2xl p-4 ${msg.role === "user"
                                    ? "bg-primary text-primary-foreground rounded-br-none"
                                    : "bg-sidebar text-foreground rounded-bl-none border border-sidebar-border"
                                    }`}
                            >
                                <div className="whitespace-pre-wrap">
                                    {msg.content.split("**").map((part, i) =>
                                        i % 2 === 1 ? (
                                            <strong key={i}>{part}</strong>
                                        ) : (
                                            <span key={i}>{part}</span>
                                        )
                                    )}
                                </div>

                                {/* Citations */}
                                {msg.citations && msg.citations.length > 0 && (
                                    <div className="mt-2 pt-2 border-t border-white/10 text-xs opacity-70">
                                        Sources: {msg.citations.map(c => `#${c}`).join(", ")}
                                    </div>
                                )}

                                {/* Strategy Card */}
                                {msg.strategy && (
                                    <div className="mt-4 bg-background/50 rounded-xl p-3 border border-border">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-bold text-primary tracking-wider uppercase">
                                                {msg.strategy.type} TRADE
                                            </span>
                                            {msg.strategy.confidence && (
                                                <span className="text-xs bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full">
                                                    {msg.strategy.confidence}% Conf.
                                                </span>
                                            )}
                                        </div>
                                        <p className="font-semibold text-sm mb-2">{msg.strategy.description}</p>
                                        <div className="flex gap-4 text-xs mb-3">
                                            <div>
                                                <span className="block text-muted-foreground">Long</span>
                                                <span className="text-green-400 font-mono">{msg.strategy.longs.join(", ")}</span>
                                            </div>
                                            <div>
                                                <span className="block text-muted-foreground">Short</span>
                                                <span className="text-red-400 font-mono">{msg.strategy.shorts.join(", ")}</span>
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            className="w-full gap-2"
                                            onClick={() => executeStrategy(msg.strategy!)}
                                        >
                                            Analyze & Execute <ArrowRight className="w-3 h-3" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-sidebar rounded-2xl p-4 rounded-bl-none text-muted-foreground animate-pulse">
                            Thinking...
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t border-sidebar-border">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSend();
                    }}
                    className="flex gap-2"
                >
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask to find trends or set policy (e.g., 'Set max trade $500')..."
                        className="flex-1 bg-sidebar border-sidebar-border"
                        disabled={loading}
                    />
                    <Button type="submit" size="icon" disabled={loading || !input.trim()}>
                        <Send className="w-4 h-4" />
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default AutomateTrades;
