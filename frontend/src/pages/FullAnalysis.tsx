import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp, TrendingDown, Zap, Target, Shield, Info } from "lucide-react";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/Sidebar";
import { useState, useEffect } from "react";
import { ContentItem } from "@/components/ContentCard";
import { TradeIdea } from "@/components/TradeCard";
import { Badge } from "@/components/ui/badge";
import { TradingViewWidget } from "@/components/TradingViewWidget";

export default function FullAnalysis() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const itemType = queryParams.get('type') || 'content';
    const [activeView, setActiveView] = useState("feed");
    const [item, setItem] = useState<ContentItem | TradeIdea | null>(null);
    const [loading, setLoading] = useState(true);

    // Pear Integration State
    const [tradeAmount, setTradeAmount] = useState("5.0");
    const [bridgeAmount, setBridgeAmount] = useState("10.0");
    const [pearLoading, setPearLoading] = useState(false);
    const [pearStatus, setPearStatus] = useState<string | null>(null);

    const handlePearTrade = async () => {
        setPearLoading(true);
        setPearStatus("Authenticating...");
        try {
            const response = await fetch("http://localhost:3001/api/pear/trade", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: parseFloat(tradeAmount) })
            });

            const data = await response.json();
            if (data.success) {
                setPearStatus(`Success! Trade executed: ${data.trade.positionId || 'ID Pending'}`);
            } else {
                setPearStatus(`Error: ${data.error || 'Failed to execute trade'}`);
            }
        } catch (err: any) {
            setPearStatus(`Error: ${err.message}`);
        } finally {
            setPearLoading(false);
        }
    };

    // Bridge Logic for HyperEVM Context
    const context = queryParams.get('context');
    const [selectedBridge, setSelectedBridge] = useState<number | null>(null);
    const [bridgingStatus, setBridgingStatus] = useState<"idle" | "bridging" | "completed">("idle");
    const [bridgingProgress, setBridgingProgress] = useState(0);

    const bridgeOptions = [
        {
            id: 1,
            name: "Direct Bridge: USDC → Bitcoin",
            path: "USDC (Arbitrum) ➔ Hyperlane ➔ HyperEVM ➔ Swap to WBTC",
            provider: "Hyperlane",
            output: "99.66% WBTC",
            totalTime: "12-18 min",
            totalFees: "0.34%",
            steps: [
                { action: "Start with USDC on Arbitrum", details: "100% of capital", time: "--", cost: "--" },
                { action: "Bridge via Hyperlane", details: "USDC Arb ➔ USDC HyperEVM", time: "8-12 min", cost: "0.006% gas + 0.03% fee" },
                { action: "Swap USDC ➔ WBTC", details: "HyperEVM DEX (Uniswap v3 Fork)", time: "2-3 min", cost: "0.002% gas + 0.30% slippage" }
            ],
            tracker: [
                { label: "Hold USDC on Arbitrum (100%)", status: "done" },
                { label: "Bridge to HyperEVM (8-12 min) - Hyperlane", status: "pending", detail: "-0.036%" },
                { label: "Swap USDC → WBTC (2-3 min) - HyperEVM DEX", status: "pending", detail: "-0.302%" },
                { label: "Complete - WBTC on HyperEVM (99.66%)", status: "wait" }
            ]
        },
        {
            id: 2,
            name: "Low Fee Route: USDC → Bitcoin (via Base)",
            path: "USDC (Arbitrum) ➔ Base ➔ HyperEVM ➔ Swap to WBTC",
            provider: "Stargate/Socket",
            output: "99.66% WBTC",
            totalTime: "15-23 min",
            totalFees: "0.34%",
            steps: [
                { action: "Start with USDC on Arbitrum", details: "100% of capital", time: "--", cost: "--" },
                { action: "Bridge Arbitrum ➔ Base", details: "Via Stargate/LayerZero", time: "5-8 min", cost: "0.005% gas + 0.01% fee" },
                { action: "Bridge Base ➔ HyperEVM", details: "Via Socket Protocol", time: "6-10 min", cost: "0.0016% gas + 0.02% fee" },
                { action: "Swap USDC ➔ WBTC", details: "HyperEVM DEX", time: "2-3 min", cost: "0.002% gas + 0.30% slippage" }
            ],
            tracker: [
                { label: "Hold USDC on Arbitrum (100%)", status: "done" },
                { label: "Bridge to Base (5-8 min) - Stargate", status: "pending", detail: "-0.015%" },
                { label: "Bridge to HyperEVM (6-10 min) - Socket", status: "pending", detail: "-0.022%" },
                { label: "Swap USDC → WBTC (2-3 min)", status: "pending", detail: "-0.302%" },
                { label: "Complete - WBTC on HyperEVM (99.66%)", status: "wait" }
            ]
        },
        {
            id: 3,
            name: "Direct SOL Exposure: USDC → Wrapped SOL",
            path: "USDC (Arbitrum) ➔ HyperEVM ➔ Swap to Wrapped SOL",
            provider: "Hyperlane",
            output: "99.46% SOL",
            totalTime: "12-18 min",
            totalFees: "0.54%",
            warning: "Check HyperEVM DEX liquidity for SOL pairs before executing. If liquidity is thin, slippage could exceed 0.50%.",
            steps: [
                { action: "Start with USDC on Arbitrum", details: "100% of capital", time: "--", cost: "--" },
                { action: "Bridge via Hyperlane", details: "USDC Arb ➔ USDC HyperEVM", time: "8-12 min", cost: "0.006% gas + 0.03% fee" },
                { action: "Swap USDC ➔ Wrapped SOL", details: "HyperEVM DEX", time: "2-3 min", cost: "0.002% gas + 0.50% slippage" }
            ],
            tracker: [
                { label: "Hold USDC on Arbitrum (100%)", status: "done" },
                { label: "Bridge to HyperEVM (8-12 min) - Hyperlane", status: "pending", detail: "-0.036%" },
                { label: "Swap USDC → Wrapped SOL (2-3 min) - HyperEVM DEX", status: "pending", detail: "-0.502%" },
                { label: "Complete - Wrapped SOL on HyperEVM (99.46%)", status: "wait" }
            ]
        },
        {
            id: 4,
            name: "Alternative SOL Route: via Wormhole",
            path: "USDC (Arbitrum) ➔ Ethereum ➔ Wormhole ➔ Solana ➔ HyperEVM",
            provider: "Wormhole/Portal",
            output: "99.81% SOL",
            totalTime: "35-50 min",
            totalFees: "0.19%",
            steps: [
                { action: "Start with USDC on Arbitrum", details: "100% of capital", time: "--", cost: "--" },
                { action: "Bridge Arbitrum ➔ Ethereum", details: "Arbitrum Native Bridge", time: "8-10 min", cost: "0.006% gas" },
                { action: "Bridge Ethereum ➔ Solana", details: "Via Wormhole", time: "15-20 min", cost: "0.05% gas + 0.01% fee" },
                { action: "Swap to SOL on Solana", details: "Jupiter Aggregator", time: "1 min", cost: "0.00002% gas + 0.10% slippage" },
                { action: "Bridge SOL to HyperEVM", details: "Portal Bridge/Connector", time: "10-15 min", cost: "0.02% fee + 0.002% gas" }
            ],
            tracker: [
                { label: "Hold USDC on Arbitrum (100%)", status: "done" },
                { label: "Bridge to Ethereum (8-10 min)", status: "pending", detail: "-0.006%" },
                { label: "Bridge to Solana via Wormhole (15-20 min)", status: "pending", detail: "-0.06%" },
                { label: "Swap to SOL on Solana (1 min)", status: "pending", detail: "-0.10%" },
                { label: "Bridge SOL to HyperEVM (10-15 min)", status: "pending", detail: "-0.022%" },
                { label: "Complete - Wrapped SOL on HyperEVM (99.81%)", status: "wait" }
            ]
        }
    ];

    const startBridging = () => {
        if (!selectedBridge) return;
        setBridgingStatus("bridging");
        setBridgingProgress(0);
        let progress = 0;
        const interval = setInterval(() => {
            progress += 20;
            setBridgingProgress(progress);
            if (progress >= 100) {
                clearInterval(interval);
                setTimeout(() => setBridgingStatus("completed"), 500);
            }
        }, 1000);
    };

    useEffect(() => {
        const fetchUrl = itemType === 'trade'
            ? `http://localhost:3001/api/trade-ideas/${id}`
            : `http://localhost:3001/api/content/${id}`;

        fetch(fetchUrl)
            .then((res) => {
                if (!res.ok && itemType === 'trade') {
                    // Try final-trades if trade-ideas fails
                    return fetch(`http://localhost:3001/api/final-trades/${id}`);
                }
                return res;
            })
            .then((res) => res.json())
            .then((data) => {
                setItem(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to fetch content:", err);
                setLoading(false);
            });
    }, [id, itemType]);

    if (loading) {
        return <div className="flex h-screen bg-background items-center justify-center text-foreground">loading content...</div>;
    }

    if (!item) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-background text-foreground">
                <h1 className="text-2xl font-bold mb-4">Content not found</h1>
                <Button onClick={() => navigate("/")}>Go Back</Button>
            </div>
        );
    }

    const isTrade = 'symbol' in item;

    return (
        <div className="flex h-screen bg-background overflow-hidden">
            <Sidebar activeView={activeView} onViewChange={(view) => {
                setActiveView(view);
                navigate(`/?view=${view}`);
            }} />

            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="border-b border-sidebar-border p-4 flex items-center gap-4 sticky top-0 bg-background/80 backdrop-blur-sm z-10">
                    <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-lg font-medium leading-tight">{isTrade ? (item as TradeIdea).title : (item as ContentItem).title}</h1>
                            {isTrade && (
                                <Badge variant="outline" className="uppercase border-primary/50 text-primary bg-primary/10">
                                    {(item as TradeIdea).side}
                                </Badge>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {isTrade ? `symbol: ${(item as TradeIdea).symbol}` : `${(item as ContentItem).author} • ${(item as ContentItem).source}`}
                        </p>
                    </div>

                    {/* WALLET STATUS */}
                    <div className="flex items-center gap-4 pr-2">
                        <div className="text-right hidden sm:block">
                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest leading-none mb-1">Active Wallet</p>
                            <div className="flex items-center gap-2 justify-end">
                                <Badge variant="outline" className="h-5 bg-blue-500/10 text-blue-400 border-blue-500/20 text-[9px] px-1 font-bold">ARBITRUM</Badge>
                                <span className="text-xs font-mono font-bold">$10.00 USDC</span>
                            </div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-surface-3 border border-border flex items-center justify-center">
                            <Shield className="w-4 h-4 text-muted-foreground" />
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto w-full p-6 lg:p-12 scrollbar-hide">
                    <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Left Column */}
                        <div className="lg:col-span-2 space-y-12">
                            {isTrade ? (
                                <>
                                    {/* HYPEREVM BRIDGING SECTION - ON TOP */}
                                    {context === 'hyperevm' && (
                                        <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <h2 className="text-xs uppercase tracking-widest text-muted-foreground font-bold">HyperEVM Bridging Selection</h2>
                                                    <p className="text-[10px] text-muted-foreground">Select an optimized route for your assets into the HyperEVM network.</p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="flex items-center gap-3 bg-surface-2 p-2 px-4 rounded-xl border border-border">
                                                        <span className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">Amount to Bridge</span>
                                                        <input
                                                            type="number"
                                                            value={bridgeAmount}
                                                            onChange={(e) => {
                                                                const val = parseFloat(e.target.value);
                                                                if (val > 10) setBridgeAmount("10.0");
                                                                else if (val < 0) setBridgeAmount("0.0");
                                                                else setBridgeAmount(e.target.value);
                                                            }}
                                                            className="w-16 bg-transparent border-none text-right font-mono text-sm font-bold focus:outline-none focus:ring-0 p-0 text-primary"
                                                            max="10.00"
                                                            step="0.5"
                                                        />
                                                        <span className="text-[10px] font-bold text-muted-foreground">USDC</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 gap-6">
                                                {bridgeOptions.map((opt) => (
                                                    <motion.div
                                                        key={opt.id}
                                                        layout
                                                        onClick={() => bridgingStatus === 'idle' && setSelectedBridge(opt.id)}
                                                        className={`rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${selectedBridge === opt.id
                                                            ? "border-primary bg-primary/5 shadow-2xl shadow-primary/5"
                                                            : "border-border bg-surface-2 hover:border-border/80 hover:bg-surface-3"
                                                            } ${bridgingStatus !== 'idle' && selectedBridge !== opt.id ? "opacity-30 grayscale blur-[1px]" : ""}`}
                                                    >
                                                        <div className="p-6">
                                                            <div className="flex justify-between items-start mb-6">
                                                                <div className="flex items-center gap-4">
                                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${selectedBridge === opt.id ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-surface-3 text-muted-foreground"}`}>
                                                                        <Zap className="w-5 h-5" />
                                                                    </div>
                                                                    <div>
                                                                        <h3 className="text-sm font-bold text-foreground leading-none mb-2">{opt.name}</h3>
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-[10px] text-muted-foreground font-medium">{opt.path}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="text-xl font-mono font-bold text-foreground">{opt.output}</p>
                                                                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-1">estimated output</p>
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-3 gap-4 mb-4">
                                                                <div className="p-3 rounded-xl bg-background/30 border border-border/50">
                                                                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em] mb-1">Time</p>
                                                                    <p className="text-sm font-bold">{opt.totalTime}</p>
                                                                </div>
                                                                <div className="p-3 rounded-xl bg-background/30 border border-border/50">
                                                                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em] mb-1">Total Fees</p>
                                                                    <p className="text-sm font-bold">{opt.totalFees}</p>
                                                                </div>
                                                                <div className="p-3 rounded-xl bg-background/30 border border-border/50">
                                                                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em] mb-1">Protocol</p>
                                                                    <p className="text-sm font-bold">{opt.provider}</p>
                                                                </div>
                                                            </div>

                                                            {selectedBridge === opt.id && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, height: 0 }}
                                                                    animate={{ opacity: 1, height: "auto" }}
                                                                    className="mt-6 pt-6 border-t border-border/50 space-y-6"
                                                                >
                                                                    {/* EXECUTION BREAKDOWN TABLE */}
                                                                    <div className="space-y-4">
                                                                        <h4 className="text-[10px] uppercase font-black text-primary tracking-[0.2em]">Execution Breakdown</h4>
                                                                        <div className="rounded-xl border border-border overflow-hidden bg-surface-1">
                                                                            <table className="w-full text-left text-[11px]">
                                                                                <thead>
                                                                                    <tr className="bg-surface-3 border-b border-border">
                                                                                        <th className="p-3 font-bold text-muted-foreground uppercase tracking-widest">Step</th>
                                                                                        <th className="p-3 font-bold text-muted-foreground uppercase tracking-widest">Action</th>
                                                                                        <th className="p-3 font-bold text-muted-foreground uppercase tracking-widest">Details</th>
                                                                                        <th className="p-3 font-bold text-muted-foreground uppercase tracking-widest">Time</th>
                                                                                        <th className="p-3 font-bold text-muted-foreground uppercase tracking-widest text-right">Cost</th>
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody className="divide-y divide-border/50">
                                                                                    {opt.steps.map((step, i) => (
                                                                                        <tr key={i} className="hover:bg-primary/5 transition-colors">
                                                                                            <td className="p-3 font-mono font-bold">{i + 1}</td>
                                                                                            <td className="p-3 font-bold text-foreground">{step.action}</td>
                                                                                            <td className="p-3 text-muted-foreground">{step.details}</td>
                                                                                            <td className="p-3 font-medium">{step.time}</td>
                                                                                            <td className="p-3 text-right font-mono text-muted-foreground">{step.cost}</td>
                                                                                        </tr>
                                                                                    ))}
                                                                                </tbody>
                                                                            </table>
                                                                        </div>
                                                                    </div>

                                                                    {/* PROGRESS TRACKER */}
                                                                    <div className="space-y-4">
                                                                        <h4 className="text-[10px] uppercase font-black text-primary tracking-[0.2em]">Live Progress Tracker</h4>
                                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                                                            {opt.tracker.map((t, i) => (
                                                                                <div key={i} className={`p-3 rounded-xl border flex flex-col justify-between h-20 transition-all ${t.status === 'done' ? 'bg-green-500/10 border-green-500/30' : t.status === 'pending' && bridgingStatus === 'bridging' ? 'bg-primary/10 border-primary/30 animate-pulse' : 'bg-surface-3 border-border opacity-50'}`}>
                                                                                    <div className="flex justify-between items-start">
                                                                                        <span className="text-[9px] font-black tracking-widest uppercase text-muted-foreground opacity-50">#0{i + 1}</span>
                                                                                        {t.status === 'done' && <div className="w-3 h-3 rounded-full bg-green-500" />}
                                                                                    </div>
                                                                                    <div className="space-y-1">
                                                                                        <p className={`text-[10px] font-bold leading-tight ${t.status === 'done' ? 'text-green-500' : 'text-foreground'}`}>{t.label}</p>
                                                                                        {t.detail && <p className="text-[9px] font-mono text-muted-foreground">{t.detail}</p>}
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>

                                                                    {opt.warning && (
                                                                        <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-start gap-3">
                                                                            <Info className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                                                                            <p className="text-[10px] leading-relaxed text-orange-200/80">
                                                                                <span className="font-black uppercase tracking-widest text-orange-500 text-[8px] mr-2">Warning</span>
                                                                                {opt.warning}
                                                                            </p>
                                                                        </div>
                                                                    )}

                                                                    {bridgingStatus === 'bridging' && (
                                                                        <div className="space-y-3 pt-4">
                                                                            <div className="flex justify-between items-end">
                                                                                <div className="space-y-1">
                                                                                    <span className="text-[8px] uppercase font-black text-primary tracking-[0.2em]">Network Broadcast</span>
                                                                                    <p className="text-[10px] font-bold text-foreground">
                                                                                        {bridgingProgress < 25 ? "Initiating Arbitrum Tx..." :
                                                                                            bridgingProgress < 50 ? "Verifying Route Proofs..." :
                                                                                                bridgingProgress < 75 ? "Bridging across protocols..." :
                                                                                                    "Confirming on HyperEVM..."}
                                                                                    </p>
                                                                                </div>
                                                                                <span className="text-sm font-mono font-bold text-primary">{bridgingProgress}%</span>
                                                                            </div>
                                                                            <div className="h-1.5 w-full bg-primary/10 rounded-full overflow-hidden">
                                                                                <motion.div
                                                                                    className="h-full bg-primary"
                                                                                    initial={{ width: 0 }}
                                                                                    animate={{ width: `${bridgingProgress}%` }}
                                                                                    transition={{ duration: 0.5 }}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {bridgingStatus === 'completed' && (
                                                                        <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/30 flex items-center justify-between animate-in zoom-in-95 duration-500">
                                                                            <div className="flex items-center gap-4">
                                                                                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white shadow-lg shadow-green-500/30">
                                                                                    <Zap className="w-6 h-6" />
                                                                                </div>
                                                                                <div>
                                                                                    <p className="text-sm font-black text-green-500 uppercase tracking-widest">Transfer Complete</p>
                                                                                    <p className="text-[10px] text-green-500/80 font-bold">Your assets are now available on the HyperEVM network.</p>
                                                                                </div>
                                                                            </div>
                                                                            <div className="text-right">
                                                                                <p className="text-lg font-mono font-bold text-green-500">${(parseFloat(bridgeAmount) * 0.996).toFixed(2)}</p>
                                                                                <p className="text-[9px] uppercase font-black text-green-500/50">Landed Value</p>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </motion.div>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>

                                            {selectedBridge && bridgingStatus === 'idle' && (
                                                <Button
                                                    onClick={startBridging}
                                                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-16 text-lg shadow-2xl shadow-primary/20 rounded-2xl uppercase tracking-widest"
                                                >
                                                    Start Bridge of {bridgeAmount} USDC to HyperEVM
                                                </Button>
                                            )}
                                        </section>
                                    )}

                                    {/* TRADE SPECIFICATIONS */}
                                    <section className="space-y-6">
                                        <h2 className="text-xs uppercase tracking-widest text-muted-foreground font-bold">specific trade recommendations</h2>
                                        {(item as TradeIdea).metadata?.specifications ? (
                                            <div className="overflow-hidden rounded-xl border border-border bg-surface-2 shadow-sm">
                                                <table className="w-full text-left text-sm">
                                                    <thead>
                                                        <tr className="bg-surface-3 border-b border-border">
                                                            <th className="p-4 font-bold text-muted-foreground uppercase tracking-tighter text-[10px]">Parameter</th>
                                                            {(item as TradeIdea).side === "PAIR" ? (
                                                                <>
                                                                    <th className="p-4 font-bold text-green-500 uppercase tracking-tighter text-[10px]">Long Side</th>
                                                                    <th className="p-4 font-bold text-red-500 uppercase tracking-tighter text-[10px]">Short Side</th>
                                                                </>
                                                            ) : (
                                                                <th className="p-4 font-bold text-primary uppercase tracking-tighter text-[10px]">Details</th>
                                                            )}
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-border/50">
                                                        {(item as TradeIdea).metadata!.specifications.map((spec, idx) => (
                                                            <tr key={idx} className="hover:bg-surface-1/50 transition-colors">
                                                                <td className="p-4 font-medium text-foreground">{spec.label}</td>
                                                                {(item as TradeIdea).side === "PAIR" ? (
                                                                    <>
                                                                        <td className="p-4 text-muted-foreground">{spec.long}</td>
                                                                        <td className="p-4 text-muted-foreground">{spec.short}</td>
                                                                    </>
                                                                ) : (
                                                                    <td className="p-4 text-muted-foreground">{spec.value}</td>
                                                                )}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-3 gap-6 bg-surface-2 p-6 rounded-xl border border-border">
                                                <div className="space-y-1">
                                                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">entry price</span>
                                                    <p className="text-lg font-mono">${(item as TradeIdea).entry_price}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-[10px] text-red-500 uppercase font-bold tracking-widest">stop loss</span>
                                                    <p className="text-lg font-mono text-red-500">${(item as TradeIdea).stop_loss}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-[10px] text-green-500 uppercase font-bold tracking-widest">take profit</span>
                                                    <p className="text-lg font-mono text-green-500">${(item as TradeIdea).take_profit}</p>
                                                </div>
                                            </div>
                                        )}
                                    </section>

                                    {/* CHARTS SECTION */}
                                    <section className="space-y-6">
                                        <h2 className="text-xs uppercase tracking-widest text-muted-foreground font-bold">market analysis</h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {(() => {
                                                let symbols: string[] = [];
                                                if (item.id === 'pair-2') {
                                                    symbols = ['ARB/USDT', 'SOL/USDT', 'ADA/USDT', 'DOT/USDT'];
                                                } else if (item.id === 'pair-4') {
                                                    symbols = ['SOL/USDT', 'BTC/USDT'];
                                                } else {
                                                    symbols = [(item as TradeIdea).symbol.includes('/') ? (item as TradeIdea).symbol : `${(item as TradeIdea).symbol}/USDT`];
                                                }

                                                return symbols.map(s => (
                                                    <div key={s} className="rounded-xl overflow-hidden border border-border bg-card h-[320px]">
                                                        <div className="p-2 border-b border-border bg-surface-1 flex justify-between items-center">
                                                            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">{s}</span>
                                                        </div>
                                                        <TradingViewWidget symbol={s} />
                                                    </div>
                                                ));
                                            })()}
                                        </div>
                                    </section>

                                    {/* RATIONALE QUOTES AS MAIN CONTENT */}
                                    <section className="space-y-8">
                                        <h2 className="text-xs uppercase tracking-widest text-muted-foreground font-bold">institutional rationale</h2>
                                        <div className="space-y-10">
                                            {(item as TradeIdea).metadata?.quotes ? (
                                                (item as TradeIdea).metadata!.quotes.reduce((acc: any[], q) => {
                                                    const lastGroup = acc[acc.length - 1];
                                                    if (lastGroup && lastGroup.category === q.category) {
                                                        lastGroup.quotes.push(q.text);
                                                    } else {
                                                        acc.push({ category: q.category, quotes: [q.text] });
                                                    }
                                                    return acc;
                                                }, []).map((group, idx) => (
                                                    <div key={idx} className="space-y-4">
                                                        <h4 className="text-[11px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                                                            <div className="w-1 h-1 rounded-full bg-primary" />
                                                            {group.category}
                                                        </h4>
                                                        <div className="space-y-4">
                                                            {group.quotes.map((quote: string, i: number) => (
                                                                <p key={i} className="text-xl leading-relaxed text-foreground font-serif italic border-l-2 border-primary/20 pl-6">
                                                                    {quote}
                                                                </p>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-xl leading-relaxed text-foreground font-serif italic">
                                                    "{(item as TradeIdea).rationale}"
                                                </p>
                                            )}
                                        </div>
                                    </section>
                                </>
                            ) : (
                                <section>
                                    <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-6 font-bold">full source text</h2>
                                    <div className="prose prose-invert max-w-none">
                                        <div className="text-lg leading-relaxed text-foreground/90 font-serif whitespace-pre-wrap">
                                            {(item as ContentItem).full_content || (item as ContentItem).excerpt}
                                        </div>
                                    </div>
                                </section>
                            )}
                        </div>

                        {/* Right Column */}
                        <div className="space-y-8">
                            {/* Summary / Bridge Exploration Info */}
                            {context === 'hyperevm' ? (
                                <section className="space-y-4">
                                    <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-bold">
                                        Bridging Optimized
                                    </h3>
                                    <div className="p-5 bg-primary/5 rounded-2xl border border-primary/20">
                                        <p className="text-sm text-foreground leading-relaxed">
                                            Exploring different bridging options to move your USDC from Arbitrum to the HyperEVM network efficiently.
                                        </p>
                                    </div>
                                </section>
                            ) : (item as any).narrative?.summary && (
                                <section className="space-y-4">
                                    <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-bold">
                                        ai summary
                                    </h3>
                                    <div className="p-5 bg-highlight/5 rounded-2xl border border-highlight/20">
                                        <p className="text-sm text-highlight/90 leading-relaxed">
                                            {(item as any).narrative.summary.replace(/^0+\s*/, '')}
                                        </p>
                                    </div>
                                </section>
                            )}

                            {/* Info Block */}
                            <section className="space-y-4 pt-4 border-t border-border">
                                <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-bold">source info</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Type</span>
                                        <span className="text-foreground font-medium uppercase">{isTrade ? 'Trade Idea' : (item as ContentItem).type}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Date</span>
                                        <span className="text-foreground font-medium">{new Date((item as any).created_at).toLocaleDateString()}</span>
                                    </div>
                                    {isTrade ? (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Status</span>
                                            <span className="text-primary font-bold uppercase tracking-widest">{(item as TradeIdea).status}</span>
                                        </div>
                                    ) : (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Read Time</span>
                                            <span className="text-foreground font-medium">{(item as ContentItem).readTime}</span>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* CTA & Pear Integration */}
                            <div className="pt-12 sticky bottom-8 space-y-4">
                                {isTrade ? (
                                    context === 'hyperevm' ? (
                                        bridgingStatus === 'completed' ? (
                                            <div className="bg-surface-2 p-6 rounded-2xl border border-primary/50 shadow-xl space-y-6 animate-in zoom-in-95 duration-500">
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <Zap className="w-4 h-4 text-primary" />
                                                        <h4 className="text-[11px] font-bold uppercase tracking-widest text-foreground">Pear Execution on HyperEVM</h4>
                                                    </div>
                                                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                                                        Execute the pair trade on the HyperEVM network using your bridged USDC.
                                                    </p>
                                                </div>

                                                <div className="space-y-3">
                                                    <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-tighter text-muted-foreground">
                                                        <span>Amount (USD)</span>
                                                        <span className={parseFloat(tradeAmount) > 10 || parseFloat(tradeAmount) < 1 ? "text-red-500" : "text-primary"}>
                                                            $1 - $10 Max
                                                        </span>
                                                    </div>
                                                    <input
                                                        type="number"
                                                        value={tradeAmount}
                                                        onChange={(e) => setTradeAmount(e.target.value)}
                                                        min="1"
                                                        max="10"
                                                        step="0.5"
                                                        className="w-full bg-background border border-border rounded-lg px-4 py-3 text-lg font-mono focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                                                        placeholder="5.00"
                                                    />
                                                </div>

                                                <Button
                                                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-14 text-base shadow-xl shadow-primary/20 rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                                                    onClick={handlePearTrade}
                                                    disabled={pearLoading || parseFloat(tradeAmount) < 1 || parseFloat(tradeAmount) > 10}
                                                >
                                                    {pearLoading ? "Processing..." : "Execute on HyperEVM"}
                                                </Button>

                                                {pearStatus && (
                                                    <p className={`text-[10px] text-center font-bold ${pearStatus.includes('Success') ? 'text-green-500' : 'text-red-500'}`}>
                                                        {pearStatus}
                                                    </p>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="p-6 rounded-xl bg-surface-2 border border-border text-center space-y-3">
                                                <Info className="w-5 h-5 text-muted-foreground mx-auto" />
                                                <p className="text-xs text-muted-foreground">Select a bridge route and complete the process to enable trade execution.</p>
                                            </div>
                                        )
                                    ) : (
                                        <div className="bg-surface-2 p-6 rounded-2xl border border-border shadow-xl space-y-6">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <Zap className="w-4 h-4 text-primary" />
                                                    <h4 className="text-[11px] font-bold uppercase tracking-widest text-foreground">Pear Protocol Execution</h4>
                                                </div>
                                                <p className="text-[10px] text-muted-foreground leading-relaxed">
                                                    Execute a 5x leveraged pair trade: <span className="text-green-500 font-bold">Long SOL</span> / <span className="text-red-500 font-bold">Short BTC</span>.
                                                </p>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-tighter text-muted-foreground">
                                                    <span>Amount (USD)</span>
                                                    <span className={parseFloat(tradeAmount) > 10 || parseFloat(tradeAmount) < 1 ? "text-red-500" : "text-primary"}>
                                                        $1 - $10 Max
                                                    </span>
                                                </div>
                                                <input
                                                    type="number"
                                                    value={tradeAmount}
                                                    onChange={(e) => setTradeAmount(e.target.value)}
                                                    min="1"
                                                    max="10"
                                                    step="0.5"
                                                    className="w-full bg-background border border-border rounded-lg px-4 py-3 text-lg font-mono focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                                                    placeholder="5.00"
                                                />
                                            </div>

                                            <Button
                                                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-14 text-base shadow-xl shadow-primary/20 rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                                                onClick={handlePearTrade}
                                                disabled={pearLoading || parseFloat(tradeAmount) < 1 || parseFloat(tradeAmount) > 10}
                                            >
                                                {pearLoading ? "Processing..." : "Authenticate & Execute"}
                                            </Button>

                                            {pearStatus && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className={`p-3 rounded-lg text-[10px] font-medium text-center ${pearStatus.includes('Success') ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                                                        }`}
                                                >
                                                    {pearStatus}
                                                </motion.div>
                                            )}
                                        </div>
                                    )
                                ) : (
                                    <Button
                                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-14 text-base shadow-2xl shadow-primary/40 rounded-xl"
                                        onClick={() => navigate("/?view=trade-ideas")}
                                    >
                                        view trade ideas
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
