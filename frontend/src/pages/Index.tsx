import { useState, useEffect } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { ContentFeed } from "@/components/ContentFeed";
import { DetailPanel } from "@/components/DetailPanel";
import { ContentItem } from "@/components/ContentCard";
import AutomateTrades from "./AutomateTrades";
import SaltPreferences from "./SaltPreferences";
import LiFiBridge from "@/components/integration/LiFiBridge";
import PearExecution from "@/components/integration/PearExecution";
import { useWallet } from "@/hooks/useWallet";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  // Wallet Hook
  const { address, isConnected, connect, isConnecting } = useWallet();
  const location = useLocation();

  const isLiFiPath = ["/from-token", "/to-token", "/settings", "/transaction-history"].includes(location.pathname);
  const initialView = isLiFiPath ? "bridge-and-execute" : (searchParams.get("view") || "feed");

  const [activeView, setActiveView] = useState(initialView);
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedId, setSelectedId] = useState<string | null>("1");
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3001/api/content")
      .then((res) => res.json())
      .then((data) => {
        setContent(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch content:", err);
        setLoading(false);
      });
  }, []);

  const handleUpdate = async (id: string, updates: Partial<ContentItem>) => {
    setContent((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );

    try {
      await fetch(`http://localhost:3001/api/content/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
    } catch (err) {
      console.error("Failed to update content:", err);
    }
  };

  const filteredContent = content.filter((item) => {
    // 1. Search Query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matches =
        item.title.toLowerCase().includes(query) ||
        item.source.toLowerCase().includes(query) ||
        item.excerpt.toLowerCase().includes(query);
      if (!matches) return false;
    }

    // 2. View Filtering
    if (activeView === "urgent") {
      return item.tags.includes("urgent");
    }
    if (activeView === "archive") {
      return item.tags.includes("archive");
    }
    // "Feed" view: Hide archived unless viewing archive?
    if (activeView === "feed" && item.tags.includes("archive")) {
      return false;
    }

    return true;
  });

  const handleViewChange = (view: string) => {
    setActiveView(view);
    setSearchParams({ view });
  };

  const selectedItem = content.find((item) => item.id === selectedId) || null;

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/content/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setContent((prev) => prev.filter((item) => item.id !== id));
        if (selectedId === id) {
          setSelectedId(null);
        }
      }
    } catch (err) {
      console.error("Failed to delete content:", err);
    }
  };

  if (loading) {
    return <div className="flex h-screen bg-background items-center justify-center text-foreground">loading content...</div>;
  }

  const renderContent = () => {
    switch (activeView) {
      case "preferences":
        return <SaltPreferences />;
      case "automate-trades":
        return <AutomateTrades />;
      case "bridge-and-execute":
        return (
          <div className="flex-1 p-6 overflow-y-auto bg-background">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-foreground">Bridge & Execute (Updated)</h1>
              {!isConnected ? (
                <Button onClick={connect} disabled={isConnecting}>
                  {isConnecting ? "Connecting..." : "Connect User Wallet"}
                </Button>
              ) : (
                <div className="text-sm text-muted-foreground font-mono bg-sidebar border border-sidebar-border px-3 py-1 rounded-full">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Phase 2: LI.FI Bridge */}
              <div className="max-w-[480px]">
                <h2 className="text-lg font-semibold mb-4 text-foreground">1. Bridge Funds</h2>
                <LiFiBridge
                  targetAmount={150}
                  recipientAddress={address || "0xUserWalletAddress"}
                />
              </div>
              {/* Phase 3: Pear Execution */}
              <div>
                <h2 className="text-lg font-semibold mb-4 text-foreground">2. Execute Strategy</h2>
                <PearExecution userAddress={address} />
              </div>
            </div>
          </div>
        );
      default:
        return (
          <>
            <ContentFeed
              items={filteredContent}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onDelete={handleDelete}
              activeView={activeView}
              onUpdate={handleUpdate}
            />
            <DetailPanel item={selectedItem} onClose={() => setSelectedId(null)} />
          </>
        );
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden" id="main-content">
      <Sidebar activeView={activeView} onViewChange={handleViewChange} onSearch={setSearchQuery} />
      {renderContent()}
    </div>
  );
};

export default Index;
