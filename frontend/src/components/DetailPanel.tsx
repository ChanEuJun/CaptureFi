import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Bookmark, Share, MoreHorizontal, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContentItem } from "./ContentCard";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

interface DetailPanelProps {
  item: ContentItem | null;
  onClose: () => void;
}

export function DetailPanel({ item, onClose }: DetailPanelProps) {
  const [walletConnected] = useState(true);
  const [policyActive] = useState(true);

  return (
    <AnimatePresence mode="wait">
      {item && (
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
                info
              </Button>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7">
              <X className="w-4 h-4" />
            </Button>
          </header>

          {/* Content */}
          <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-6">
            {/* AI Generated Summary */}
            {item.narrative?.summary && (
              <div>
                <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
                  ai generated summary
                </h3>
                <p className="text-sm text-highlight leading-relaxed p-3 bg-highlight/10 rounded-lg border-l-2 border-highlight">
                  {item.narrative.summary.replace(/^0+\s*/, '')}
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
                  const content = item.full_content || item.excerpt;
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

            {/* Actions */}
            <div className="flex items-center gap-2 pt-4">
              <Button variant="ghost" size="xs">
                <Bookmark className="w-3 h-3 mr-1" />
                save
              </Button>
              <Button variant="ghost" size="xs">
                <Share className="w-3 h-3 mr-1" />
                share
              </Button>
              <Button variant="ghost" size="xs">
                <ExternalLink className="w-3 h-3 mr-1" />
                open original
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 ml-auto">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
