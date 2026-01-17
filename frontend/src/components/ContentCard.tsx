import { motion } from "framer-motion";
import { Twitter, Youtube, FileText, Clock, MoreHorizontal, Bookmark, TrendingUp, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface ContentItem {
  id: string;
  type: "twitter" | "youtube" | "article";
  title: string;
  excerpt: string;
  source: string;
  author: string;
  date: string;
  readTime?: string;
  tags: string[];
  thumbnail?: string;
  hasNarrative?: boolean;
  full_content?: string;
  narrative?: {
    summary: string;
    tradePair?: {
      long: string;
      short: string;
    };
  };
}



interface ContentCardProps {
  item: ContentItem;
  isSelected: boolean;
  onClick: () => void;
  onDelete?: (id: string) => void;
}

const sourceIcons = {
  twitter: Twitter,
  youtube: Youtube,
  article: FileText,
};

const sourceColors = {
  twitter: "text-[#1DA1F2]",
  youtube: "text-[#FF0000]",
  article: "text-muted-foreground",
};

export function ContentCard({ item, isSelected, onClick, onDelete }: ContentCardProps) {
  const SourceIcon = sourceIcons[item.type];

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ backgroundColor: "hsl(var(--surface-2))" }}
      onClick={onClick}
      className={`
        group relative p-4 cursor-pointer border-b border-border transition-all duration-200
        ${isSelected ? "bg-surface-2 border-l-2 border-l-primary" : "hover:bg-surface-1"}
      `}
    >
      <div className="flex gap-4">
        {/* Thumbnail */}
        {item.thumbnail && (
          <div className="w-20 h-16 rounded-md overflow-hidden bg-surface-3 shrink-0">
            <img
              src={item.thumbnail}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        )}
        {!item.thumbnail && (
          <div className="w-20 h-16 rounded-md bg-surface-3 shrink-0 flex items-center justify-center">
            <SourceIcon className={`w-6 h-6 ${sourceColors[item.type]}`} />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {item.title}
            </h3>
            <span className="text-xs text-muted-foreground shrink-0">{item.date}</span>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {item.excerpt}
          </p>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <SourceIcon className={`w-3 h-3 ${sourceColors[item.type]}`} />
            <span>{item.source}</span>
            <span>•</span>
            <span>{item.author}</span>
            {item.readTime && (
              <>
                <span>•</span>
                <Clock className="w-3 h-3" />
                <span>{item.readTime}</span>
              </>
            )}
          </div>

          {/* Tags */}
          <div className="flex items-center gap-2 mt-2">
            {item.tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-xs px-2 py-0"
              >
                {tag}
              </Badge>
            ))}
            {item.hasNarrative && (
              <Badge
                variant="outline"
                className="text-xs px-2 py-0 border-primary/50 text-primary"
              >
                <TrendingUp className="w-3 h-3 mr-1" />
                trade ready
              </Badge>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => e.stopPropagation()}>
            <Bookmark className="w-4 h-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => e.stopPropagation()}>
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover border-border">
              <DropdownMenuItem
                className="text-destructive focus:text-destructive cursor-pointer flex items-center gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(item.id);
                }}
              >
                <Trash2 className="w-4 h-4" />
                <span>delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.article>
  );
}
