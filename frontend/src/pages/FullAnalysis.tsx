import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/Sidebar";
import { useState, useEffect } from "react";
import { ContentItem } from "@/components/ContentCard";

export default function FullAnalysis() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeView, setActiveView] = useState("feed");
    const [item, setItem] = useState<ContentItem | null>(null);
    const [loading, setLoading] = useState(true);

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
        <div className="flex h-screen bg-background overflow-hidden">
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

                        {/* Right Column: Highlights */}
                        <div className="space-y-8">
                            {/* AI Generated Summary */}
                            {item.narrative?.summary && (
                                <section className="space-y-4">
                                    <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                                        ai generated summary
                                    </h3>
                                    <div className="p-4 bg-highlight/5 rounded-xl border-l-2 border-highlight">
                                        <p className="text-sm text-highlight/90 leading-relaxed">
                                            {item.narrative.summary.replace(/^0+\s*/, '')}
                                        </p>
                                    </div>
                                </section>
                            )}

                            {/* Highlights */}
                            <section className="space-y-4">
                                <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                                    key highlights
                                </h3>
                                <div className="space-y-4">
                                    {(() => {
                                        const content = item.full_content || item.excerpt;
                                        // Split into sentences (simple regex)
                                        const sentences = content.match(/[^.!?]+[.!?]+/g) || [content];
                                        // Filter for sentences that look meaningful (e.g. > 40 chars)
                                        const meaningfulSentences = sentences.filter(s => s.trim().length > 40);

                                        // If we don't have enough, just use what we have
                                        const sourcePool = meaningfulSentences.length > 0 ? meaningfulSentences : [content];

                                        // Pick random sentences (up to 4)
                                        const highlights = [...sourcePool]
                                            .sort(() => 0.5 - Math.random())
                                            .slice(0, 4);

                                        return highlights.map((text, idx) => (
                                            <div key={idx} className="p-4 bg-highlight/5 rounded-xl border-l-2 border-highlight">
                                                <p className="text-sm text-highlight/90 leading-relaxed italic">
                                                    "{text.trim().toLowerCase()}"
                                                </p>
                                            </div>
                                        ));
                                    })()}
                                </div>
                            </section>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
}
