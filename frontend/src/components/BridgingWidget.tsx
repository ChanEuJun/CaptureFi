import { motion } from "framer-motion";
import { Wallet, ArrowRight, AlertCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface BridgingWidgetProps {
  required: number;
  available: number;
  onBridge: () => void;
}

export function BridgingWidget({ required, available, onBridge }: BridgingWidgetProps) {
  const deficit = Math.max(0, required - available);
  const hasEnough = deficit === 0;
  const percentageAvailable = Math.min(100, (available / required) * 100);

  if (hasEnough) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 p-3 bg-long/10 border border-long/30 rounded-lg"
      >
        <Check className="w-4 h-4 text-long" />
        <span className="text-sm text-long">sufficient collateral available</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-surface-2 border border-border rounded-lg space-y-3"
    >
      <div className="flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <div className="flex-1">
          <p className="text-sm text-foreground">
            need ${deficit.toLocaleString()} more collateral
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            li.fi will bridge funds automatically to hyperliquid
          </p>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>${available.toLocaleString()} available</span>
          <span>${required.toLocaleString()} required</span>
        </div>
        <Progress value={percentageAvailable} className="h-1.5" />
      </div>

      <Button 
        variant="outline" 
        size="sm" 
        className="w-full border-primary/50 text-primary hover:bg-primary/10"
        onClick={onBridge}
      >
        <Wallet className="w-4 h-4 mr-2" />
        bridge ${deficit.toLocaleString()} via li.fi
        <ArrowRight className="w-3 h-3 ml-2" />
      </Button>
    </motion.div>
  );
}
