import { motion } from "framer-motion";
import {
  Home,
  Bookmark,
  Clock,
  Archive,
  TrendingUp,
  Wallet,
  Settings,
  Plus,
  Search,
  Twitter,
  Youtube,
  FileText,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/capturefi-logo.png";

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  onSearch: (query: string) => void;
}

const navItems = [
  { id: "feed", icon: Home, label: "feed" },
  { id: "urgent", icon: Clock, label: "urgent" },
  { id: "archive", icon: Archive, label: "archive" },
];

const tradingItems = [
  { id: "trade-ideas", icon: TrendingUp, label: "trade ideas" },
  { id: "bridge-and-execute", icon: Zap, label: "bridge and executive" },
  { id: "automate-trades", icon: Wallet, label: "automate trades" },
];

export function Sidebar({ activeView, onViewChange, onSearch }: SidebarProps) {
  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="w-14 lg:w-56 h-screen bg-sidebar border-r border-sidebar-border flex flex-col py-4 shrink-0"
    >
      {/* Logo */}
      <div className="px-3 mb-6">
        <div className="flex items-center gap-3">
          <img
            src={logo}
            alt="capturefi"
            className="w-8 h-8 object-contain"
          />
          <span className="hidden lg:block text-lg font-medium text-foreground">
            capturefi
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 mb-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="search"
            className="w-full bg-sidebar-accent/50 text-sm text-foreground pl-8 pr-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-primary/50"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-2 space-y-1">
        <div className="mb-4">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={activeView === item.id ? "sidebarActive" : "sidebar"}
              size="sm"
              onClick={() => onViewChange(item.id)}
              className="w-full mb-1"
            >
              <item.icon className="w-4 h-4" />
              <span className="hidden lg:block ml-2 flex-1 text-left">{item.label}</span>
            </Button>
          ))}
        </div>


        {/* Trading */}
        <div className="pt-4 border-t border-sidebar-border">
          <span className="hidden lg:block px-3 py-2 text-xs text-muted-foreground uppercase tracking-wider">
            trading
          </span>
          {tradingItems.map((item) => (
            <Button
              key={item.id}
              variant={activeView === item.id ? "sidebarActive" : "sidebar"}
              size="sm"
              onClick={() => onViewChange(item.id)}
              className="w-full mb-1"
            >
              <item.icon className="w-4 h-4" />
              <span className="hidden lg:block ml-2 flex-1 text-left">{item.label}</span>
            </Button>
          ))}
        </div>
      </nav>

      {/* Bottom Actions */}
      <div className="px-2 pt-4 border-t border-sidebar-border space-y-1">
        <Button
          variant="sidebar"
          size="sm"
          className="w-full"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden lg:block ml-2 flex-1 text-left">add content</span>
        </Button>
        <Button
          variant={activeView === "preferences" ? "sidebarActive" : "sidebar"}
          size="sm"
          onClick={() => onViewChange("preferences")}
          className="w-full"
        >
          <Settings className="w-4 h-4" />
          <span className="hidden lg:block ml-2 flex-1 text-left">preferences</span>
        </Button>
      </div>
    </motion.aside>
  );
}
