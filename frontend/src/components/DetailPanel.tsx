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
            {/* AI Narrative Analysis */}
            {item.hasNarrative && item.narrative && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-xs uppercase tracking-wider text-primary">
                    ai narrative
                  </h3>
                </div>

                <div className="bg-surface-2 rounded-lg p-4">
                  <p className="text-sm text-foreground leading-relaxed">
                    {item.narrative.summary}
                  </p>
                </div>
              </motion.div>
            )}

            <Separator />

            {/* Highlights */}
            <div>
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
                highlights
              </h3>

              <div className="space-y-3">
                <p className="text-sm text-highlight leading-relaxed p-3 bg-highlight/10 rounded-lg border-l-2 border-highlight">
                  "l2s are systematically draining liquidity from alt l1s. the rotation is happening faster than most realize."
                </p>

                <p className="text-sm text-highlight leading-relaxed p-3 bg-highlight/10 rounded-lg border-l-2 border-highlight">
                  "eth ecosystem dominance will only accelerate as bridging costs decrease and l2 ux improves."
                </p>
              </div>
            </div>

            <Button
              className="w-full mt-4"
              onClick={() => window.location.href = `/analysis/${item.id}`}
            >
              Read Entire Source
            </Button>

            <Separator />


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
