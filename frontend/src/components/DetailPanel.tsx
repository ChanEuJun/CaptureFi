import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Bookmark, Share, MoreHorizontal, TrendingUp, TrendingDown, Target, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContentItem } from "./ContentCard";
import { TradeIdea } from "./TradeCard";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { TradingViewWidget } from "./TradingViewWidget";
import { Badge } from "@/components/ui/badge";

interface DetailPanelProps {
  item: ContentItem | TradeIdea | null;
  onClose: () => void;
  activeView?: string;
}

export function DetailPanel({ item, onClose, activeView }: DetailPanelProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!item) return <AnimatePresence />;

  const isTradeIdea = 'symbol' in item;
  const isBridgeView = activeView === "bridge-and-execute";
  const isFinalizeView = activeView === "trade-ideas";
  const isAutomateView = activeView === "automate-trades";

  const handleAction = async () => {
    if (!item) return;
    setIsProcessing(true);
    try {
      let endpoint = '';
      if (isFinalizeView) endpoint = `http://localhost:3001/api/trade-ideas/${item.id}/finalize`;
      else if (isAutomateView) endpoint = `http://localhost:3001/api/final-trades/${item.id}/bridge`;
      else if (isBridgeView) {
        // Here we would trigger the actual blockchain execution
        alert("Executing trade on-chain...");
        setIsProcessing(false);
        return;
      }

      const res = await fetch(endpoint, { method: 'POST' });
      if (res.ok) {
        onClose();
        // Index.tsx will refresh because of state changes if we added a callback, 
        // but for now, the user can just switch views.
      }
    } catch (err) {
      console.error("Action failed:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.aside
        key={item.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.2 }}
        className="w-[450px] h-screen bg-card border-l border-border flex flex-col shrink-0"
      >
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex gap-2">
            <Button variant="ghost" size="xs" className="text-foreground">
              {isTradeIdea ? (isBridgeView ? "bridge details" : "trade specs") : "info"}
            </Button>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7">
            <X className="w-4 h-4" />
          </Button>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-6">
          {isTradeIdea ? (
            // Trade Idea Detailed View
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-bold text-foreground">{(item as TradeIdea).title || (item as TradeIdea).symbol}</h2>
                  <Badge
                    variant="outline"
                    className={`uppercase ${(item as TradeIdea).side === "LONG" ? "border-green-500/50 text-green-500 bg-green-500/10" : (item as TradeIdea).side === "SHORT" ? "border-red-500/50 text-red-500 bg-red-500/10" : "border-primary/50 text-primary bg-primary/10"}`}
                  >
                    {(item as TradeIdea).side}
                  </Badge>
                </div>
                {!isBridgeView && (
                  <p className="text-sm text-muted-foreground">
                    Suggested at {new Date((item as TradeIdea).created_at).toLocaleString()}
                  </p>
                )}
              </div>

              {/* Hide everything else if in bridge view, as requested */}
              {!isBridgeView && (
                <>
                  {/* SPECIFICATIONS TABLE */}
                  {(item as TradeIdea).metadata?.specifications && (
                    <div className="space-y-4">
                      <h3 className="text-xs uppercase tracking-wider text-muted-foreground">
                        Specific Trade Recommendations
                      </h3>
                      <div className="overflow-hidden rounded-xl border border-border bg-surface-2 shadow-sm">
                        <table className="w-full text-left text-sm">
                          <thead>
                            <tr className="bg-surface-3 border-b border-border">
                              <th className="p-3 font-medium text-muted-foreground">Parameter</th>
                              {(item as TradeIdea).side === "PAIR" ? (
                                <>
                                  <th className="p-3 font-medium text-green-500">Long Side</th>
                                  <th className="p-3 font-medium text-red-500">Short Side</th>
                                </>
                              ) : (
                                <th className="p-3 font-medium text-primary">Details</th>
                              )}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/50">
                            {(item as TradeIdea).metadata!.specifications.map((spec, idx) => (
                              <tr key={idx} className="hover:bg-surface-1/50 transition-colors">
                                <td className="p-3 font-medium text-foreground">{spec.label}</td>
                                {(item as TradeIdea).side === "PAIR" ? (
                                  <>
                                    <td className="p-3 text-muted-foreground">{spec.long}</td>
                                    <td className="p-3 text-muted-foreground">{spec.short}</td>
                                  </>
                                ) : (
                                  <td className="p-3 text-muted-foreground">{spec.value}</td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* RATIONALE QUOTES */}
                  {(item as TradeIdea).metadata?.quotes && (
                    <div className="space-y-4">
                      <h3 className="text-xs uppercase tracking-wider text-muted-foreground">
                        Rationale (Direct Quotes)
                      </h3>
                      <div className="space-y-3">
                        {(() => {
                          const quotes = (item as TradeIdea).metadata!.quotes;
                          const categories = Array.from(new Set(quotes.map(q => q.category)));

                          return categories.map(cat => (
                            <div key={cat} className="space-y-2">
                              <h4 className="text-[10px] font-bold text-primary uppercase tracking-tighter">{cat}</h4>
                              {quotes.filter(q => q.category === cat).map((q, i) => (
                                <p key={i} className="text-sm text-foreground leading-relaxed italic bg-surface-1 p-3 rounded-lg border border-border">
                                  {q.text}
                                </p>
                              ))}
                            </div>
                          ));
                        })()}
                      </div>
                    </div>
                  )}

                  {!(item as TradeIdea).metadata && (
                    <div className="grid grid-cols-1 gap-4 bg-surface-2 p-4 rounded-lg border border-border">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <TrendingUp className="w-4 h-4" />
                          <span className="text-xs uppercase font-medium">Entry Price</span>
                        </div>
                        <span className="font-mono text-foreground">${(item as TradeIdea).entry_price}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-red-400">
                          <Shield className="w-4 h-4" />
                          <span className="text-xs uppercase font-medium">Stop Loss</span>
                        </div>
                        <span className="font-mono text-red-400">${(item as TradeIdea).stop_loss}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-green-400">
                          <Target className="w-4 h-4" />
                          <span className="text-xs uppercase font-medium">Take Profit</span>
                        </div>
                        <span className="font-mono text-green-400">${(item as TradeIdea).take_profit}</span>
                      </div>
                    </div>
                  )}

                  {!(item as TradeIdea).metadata && (
                    <div>
                      <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
                        Rationale
                      </h3>
                      <p className="text-sm text-foreground leading-relaxed italic bg-surface-1 p-4 rounded-lg border border-border">
                        "{(item as TradeIdea).rationale}"
                      </p>
                    </div>
                  )}
                </>
              )}



              <div className="space-y-3">
                {isBridgeView ? (
                  <Button
                    onClick={() => window.location.href = `/analysis/${item.id}?type=trade&context=hyperevm`}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-12 text-base shadow-lg shadow-primary/20"
                  >
                    Look at Bridging Options
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={() => window.location.href = `/analysis/${item.id}?type=${isTradeIdea ? 'trade' : 'content'}`}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-12 text-base shadow-lg shadow-primary/20"
                    >
                      Learn More
                    </Button>

                    {(isFinalizeView || isAutomateView) && (
                      <Button
                        onClick={handleAction}
                        disabled={isProcessing}
                        variant="ghost"
                        className="w-full text-muted-foreground hover:text-primary text-xs uppercase tracking-widest h-8"
                      >
                        {isProcessing ? (
                          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        ) : (
                          isAutomateView ? "start bridge to hyperevm" :
                            "trade into the hyperevm network"
                        )}
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          ) : (
            // Regular Content Detailed View
            <>
              {/* AI Generated Summary */}
              {(item as ContentItem).narrative?.summary && (
                <div>
                  <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
                    ai generated summary
                  </h3>
                  <p className="text-sm text-highlight leading-relaxed p-3 bg-highlight/10 rounded-lg border-l-2 border-highlight">
                    {(item as ContentItem).narrative!.summary.replace(/^0+\s*/, '')}
                  </p>
                </div>
              )}

              {/* Highlights */}
              <div>
                <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
                  highlights
                </h3>

                <div className="space-y-3">
                  {(() => {
                    const content = (item as ContentItem).full_content || (item as ContentItem).excerpt;
                    const sentences = content.match(/[^.!?]+[.!?]+/g) || [content];
                    const meaningfulSentences = sentences.filter(s => s.trim().length > 30);
                    const sourcePool = meaningfulSentences.length > 0 ? meaningfulSentences : [content];

                    const highlights = [...sourcePool]
                      .sort(() => 0.5 - Math.random())
                      .slice(0, 3);

                    return highlights.map((text, idx) => (
                      <p key={idx} className="text-sm text-highlight leading-relaxed p-3 bg-highlight/10 rounded-lg border-l-2 border-highlight">
                        "{text.trim().toLowerCase()}"
                      </p>
                    ));
                  })()}
                </div>
              </div>

              <Button
                className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-12 text-base shadow-lg shadow-primary/20"
                onClick={() => window.location.href = `/analysis/${item.id}`}
              >
                Read Entire Source
              </Button>
            </>
          )}

          {/* Common Actions */}
          <div className="flex items-center gap-2 pt-4">
            <Button variant="ghost" size="xs">
              <Bookmark className="w-3 h-3 mr-1" />
              save
            </Button>
            <Button variant="ghost" size="xs">
              <Share className="w-3 h-3 mr-1" />
              share
            </Button>
            {!isTradeIdea && (
              <Button variant="ghost" size="xs" onClick={() => (item as ContentItem).url && window.open((item as ContentItem).url, '_blank')}>
                <ExternalLink className="w-3 h-3 mr-1" />
                open original
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-7 w-7 ml-auto">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}
