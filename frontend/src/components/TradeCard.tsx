import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Info, MoreHorizontal, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface TradeIdea {
    id: string;
    symbol: string;
    title: string;
    side: "LONG" | "SHORT" | "PAIR";
    entry_price: string;
    stop_loss: string;
    take_profit: string;
    rationale: string;
    metadata?: {
        specifications: Array<{
            label: string;
            long?: string;
            short?: string;
            value?: string;
        }>;
        quotes: Array<{
            category: string;
            text: string;
        }>;
    };
    status: string;
    created_at: string;
}

interface TradeCardProps {
    item: TradeIdea;
    isSelected: boolean;
    onClick: () => void;
    onDelete?: (id: string) => void;
}

export function TradeCard({ item, isSelected, onClick, onDelete }: TradeCardProps) {
    const isPair = item.side === "PAIR";
    const isLong = item.side === "LONG";

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
                {/* Type Icon */}
                <div className={`w-12 h-12 rounded-full shrink-0 flex items-center justify-center ${isPair ? "bg-primary/10 text-primary" : isLong ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
                    {isPair ? <Info className="w-6 h-6" /> : isLong ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                            {item.title || item.symbol}
                        </h3>
                        <Badge
                            variant="outline"
                            className={`text-[10px] uppercase font-bold py-0 ${isPair ? "border-primary/50 text-primary bg-primary/10" : isLong ? "border-green-500/50 text-green-500 bg-green-500/10" : "border-red-500/50 text-red-500 bg-red-500/10"}`}
                        >
                            {item.side}
                        </Badge>
                    </div>

                    {!isPair && (
                        <div className="grid grid-cols-3 gap-2 mb-3">
                            <div className="flex flex-col">
                                <span className="text-[10px] text-muted-foreground uppercase">Entry</span>
                                <span className="text-sm font-medium">${item.entry_price}</span>
                            </div>
                            <div className="flex flex-col text-red-500">
                                <span className="text-[10px] opacity-70 uppercase">Stop Loss</span>
                                <span className="text-sm font-medium">${item.stop_loss}</span>
                            </div>
                            <div className="flex flex-col text-green-500">
                                <span className="text-[10px] opacity-70 uppercase">Take Profit</span>
                                <span className="text-sm font-medium">${item.take_profit}</span>
                            </div>
                        </div>
                    )}

                    {isPair && (
                        <div className="mb-3">
                            <span className="text-[10px] text-muted-foreground uppercase">Pairing</span>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-green-500">{item.symbol.split('/')[0]}</span>
                                <span className="text-xs text-muted-foreground font-medium">vs</span>
                                <span className="text-sm font-bold text-red-500">{item.symbol.split('/')[1]}</span>
                            </div>
                        </div>
                    )}

                    <p className="text-sm text-muted-foreground line-clamp-2 italic mb-2">
                        "{item.rationale}"
                    </p>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Info className="w-3 h-3" />
                        <span>{new Date(item.created_at).toLocaleDateString()}</span>
                        <span>•</span>
                        <span className="text-primary uppercase font-medium">{item.status}</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-surface-3 transition-colors" onClick={(e) => e.stopPropagation()}>
                                <MoreHorizontal className="w-4 h-4" />
                            </button>
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
