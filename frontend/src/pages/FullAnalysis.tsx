import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/Sidebar";
import { useState, useEffect } from "react";
import { ContentItem } from "@/components/ContentCard";
import { Separator } from "@/components/ui/separator";


export default function FullAnalysis() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeView, setActiveView] = useState("feed");
    const [generating, setGenerating] = useState(false);
    const [item, setItem] = useState<ContentItem | null>(null);
    const [loading, setLoading] = useState(true);

    const handleGenerate = async () => {
        if (!id) return;
        setGenerating(true);
        try {
            const response = await fetch(`http://localhost:3001/api/content/${id}/generate`, {
                method: "POST"
            });
            const data = await response.json();
            if (data.success) {
                setItem(prev => prev ? { ...prev, narrative: data.narrative, hasNarrative: true } : null);
            }
        } catch (err) {
            console.error("failed to generate:", err);
        } finally {
            setGenerating(false);
        }
    };

    useEffect(() => {
        fetch(`http://localhost:3001/api/content/${id}`)
            .then((res) => res.json())
            .then((data) => {
                setItem(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to fetch content:", err);
                setLoading(false);
            });
    }, [id]);

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

    return (
        <div className="flex h-screen bg-background overflow-hidden font-canela lowercase">
            <Sidebar activeView={activeView} onViewChange={(view) => {
                setActiveView(view);
                navigate("/");
            }} />

            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="border-b border-border p-4 flex items-center gap-4 sticky top-0 bg-background/80 backdrop-blur-sm z-10">
                    <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-lg font-medium leading-tight">{item.title}</h1>
                        <p className="text-xs text-muted-foreground">{item.author} • {item.source}</p>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto w-full p-6 lg:p-12">
                    <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Left Column: Full Text */}
                        <div className="lg:col-span-2 space-y-8">
                            <section>
                                <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-6">full source text</h2>
                                <div className="prose prose-invert max-w-none">
                                    <div className="text-lg leading-relaxed text-foreground/90 font-serif whitespace-pre-wrap">
                                        {item.full_content || item.excerpt}
                                    </div>
                                </div>

                            </section>
                        </div>

                        {/* Right Column: Analysis */}
                        <div className="space-y-8">
                            {/* AI Narrative */}
                            <section className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xs uppercase tracking-widest text-primary font-semibold">
                                        ai narrative
                                    </h3>
                                    {!item.narrative && (
                                        <Button
                                            variant="outline"
                                            size="xs"
                                            onClick={handleGenerate}
                                            disabled={generating}
                                            className="text-[10px] h-6"
                                        >
                                            {generating ? "generating..." : "generate summary"}
                                        </Button>
                                    )}
                                </div>

                                {item.narrative && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-surface-2 rounded-xl p-6 border border-border/50"
                                    >
                                        <p className="text-sm text-foreground/80 leading-relaxed">
                                            {item.narrative.summary}
                                        </p>
                                    </motion.div>
                                )}
                            </section>

                            <Separator />

                            {/* Highlights */}
                            <section className="space-y-4">
                                <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                                    key highlights
                                </h3>

                                {!item.narrative?.highlights && !item.narrative && (
                                    <p className="text-xs text-muted-foreground italic">generate summary to see highlights</p>
                                )}

                                <div className="space-y-4">
                                    {item.narrative?.highlights?.map((highlight, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="p-4 bg-highlight/5 rounded-xl border-l-2 border-highlight"
                                        >
                                            <p className="text-sm text-highlight/90 leading-relaxed italic">
                                                "{highlight.replace(/^"|"$/g, '')}"
                                            </p>
                                        </motion.div>
                                    ))}

                                    {/* Default highlights if none generated yet but in mock */}
                                    {!item.narrative?.highlights && item.id === "1" && !generating && (
                                        <div className="p-4 bg-highlight/5 rounded-xl border-l-2 border-highlight">
                                            <p className="text-sm text-highlight/90 leading-relaxed italic">
                                                "l2s are systematically draining liquidity from alt l1s. the rotation is happening faster than most realize."
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

