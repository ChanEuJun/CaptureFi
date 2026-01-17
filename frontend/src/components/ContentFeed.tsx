import { motion } from "framer-motion";
import { ContentCard, ContentItem } from "./ContentCard";
import { Button } from "@/components/ui/button";
import { ChevronDown, Tag, Clock } from "lucide-react";

interface ContentFeedProps {
  items: ContentItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete?: (id: string) => void;
  activeView: string;
}

export function ContentFeed({ items, selectedId, onSelect, onDelete, activeView }: ContentFeedProps) {
  const viewTitles: Record<string, string> = {
    feed: "library",
    saved: "saved",
    later: "read later",
    archive: "archive",
    twitter: "x / twitter",
    youtube: "youtube",
    articles: "articles",
    "trade-ideas": "trade ideas",
    "bridge-and-execute": "bridge and executive",
    "automate-trades": "automate trades",
    preferences: "preferences",
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 min-w-[400px] max-w-2xl border-r border-border flex flex-col h-screen"
    >
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-medium text-foreground">
              {viewTitles[activeView] || "library"}
            </h1>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="xs">
              <Tag className="w-3 h-3 mr-1" />
              manage tags
            </Button>
            <Button variant="ghost" size="xs">
              <Clock className="w-3 h-3 mr-1" />
              last opened
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 text-sm">
          <button className="text-foreground font-medium pb-2 border-b-2 border-primary">
            all
          </button>
          <button className="text-muted-foreground pb-2 border-b-2 border-transparent hover:text-foreground transition-colors">
            later
          </button>
          <button className="text-muted-foreground pb-2 border-b-2 border-transparent hover:text-foreground transition-colors">
            shortlist
          </button>
          <button className="text-muted-foreground pb-2 border-b-2 border-transparent hover:text-foreground transition-colors">
            archive
          </button>
        </div>
      </header>

      {/* Content List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <ContentCard
              item={item}
              isSelected={selectedId === item.id}
              onClick={() => onSelect(item.id)}
              onDelete={onDelete}
            />
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
