import { motion } from "framer-motion";
import { Shield, Settings, AlertTriangle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SaltWalletStatusProps {
  isConnected: boolean;
  policyActive: boolean;
  onConnect: () => void;
}

export function SaltWalletStatus({ isConnected, policyActive, onConnect }: SaltWalletStatusProps) {
  if (!isConnected) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 bg-surface-2 border border-border rounded-lg"
      >
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-foreground mb-1">
              connect salt wallet
            </h4>
            <p className="text-xs text-muted-foreground mb-3">
              deploy a policy-controlled account to enable secure ai-powered trading
            </p>
            <Button variant="trade" size="sm" onClick={onConnect}>
              connect wallet
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-surface-2 border border-border rounded-lg space-y-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-long" />
          <span className="text-sm font-medium text-foreground">salt wallet</span>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <Settings className="w-3 h-3" />
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">policy status</span>
          <div className="flex items-center gap-1.5">
            {policyActive ? (
              <>
                <Check className="w-3 h-3 text-long" />
                <span className="text-long">active</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-3 h-3 text-primary" />
                <span className="text-primary">pending</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">permitted contracts</span>
          <span className="text-foreground">pear protocol</span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">permissions</span>
          <span className="text-foreground">trade only (no withdrawals)</span>
        </div>
      </div>

      <div className="pt-2 border-t border-border">
        <p className="text-xs text-muted-foreground">
          <Shield className="w-3 h-3 inline mr-1" />
          ai can execute trades but cannot access your private keys or withdraw funds
        </p>
      </div>
    </motion.div>
  );
}
