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
}

export function DetailPanel({ item, onClose }: DetailPanelProps) {
  if (!item) return <AnimatePresence />;

  const isTradeIdea = 'symbol' in item;

  return (
    <AnimatePresence mode="wait">
      <motion.aside
        key={item.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.2 }}
        className="w-96 h-screen bg-card border-l border-border flex flex-col shrink-0"
      >
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex gap-2">
            <Button variant="ghost" size="xs" className="text-foreground">
              {isTradeIdea ? "trade specs" : "info"}
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
                  <h2 className="text-xl font-bold text-foreground">{(item as TradeIdea).symbol}</h2>
                  <Badge
                    variant="outline"
                    className={`uppercase ${(item as TradeIdea).side === "LONG" ? "border-green-500/50 text-green-500 bg-green-500/10" : "border-red-500/50 text-red-500 bg-red-500/10"}`}
                  >
                    {(item as TradeIdea).side}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{new Date((item as TradeIdea).created_at).toLocaleString()}</p>
              </div>

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

              <div>
                <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
                  Rationale
                </h3>
                <p className="text-sm text-foreground leading-relaxed italic bg-surface-1 p-4 rounded-lg border border-border">
                  "{(item as TradeIdea).rationale}"
                </p>
              </div>

              <div>
                <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
                  Chart Analysis
                </h3>
                <div className="rounded-lg overflow-hidden border border-border">
                  <TradingViewWidget symbol={(item as TradeIdea).symbol} />
                </div>
              </div>

              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
                Execute Trade
              </Button>
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
                className="w-full mt-4"
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
