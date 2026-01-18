import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ContentFeed } from "@/components/ContentFeed";
import { DetailPanel } from "@/components/DetailPanel";
import { ContentItem } from "@/components/ContentCard";
import { TradeIdea } from "@/components/TradeCard";

const Index = () => {
  const [activeView, setActiveView] = useState("feed");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [tradeIdeas, setTradeIdeas] = useState<TradeIdea[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setSelectedId(null); // Reset selection when view changes

    if (activeView === "automate-trades" || activeView === "preferences") {
      setContent([]);
      setTradeIdeas([]);
      setLoading(false);
      return;
    }

    let endpoint = "content";
    if (activeView === "trade-ideas") endpoint = "trade-ideas";
    if (activeView === "bridge-and-execute") endpoint = "final-trades";

    fetch(`http://localhost:3001/api/${endpoint}`)
      .then((res) => res.json())
      .then((data) => {
        if (endpoint !== "content") {
          setTradeIdeas(data);
        } else {
          setContent(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(`Failed to fetch ${endpoint}:`, err);
        setLoading(false);
      });
  }, [activeView]);

  const isTradeView = (activeView === "trade-ideas" || activeView === "bridge-and-execute" || activeView === "automate-trades");

  const selectedItem = isTradeView
    ? tradeIdeas.find((item) => item.id === selectedId) || null
    : content.find((item) => item.id === selectedId) || null;

  const handleDelete = async (id: string) => {
    let endpoint = "content";
    if (activeView === "trade-ideas") endpoint = "trade-ideas";
    if (activeView === "bridge-and-execute") endpoint = "final-trades";

    try {
      const response = await fetch(`http://localhost:3001/api/${endpoint}/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        if (endpoint !== "content") {
          setTradeIdeas((prev) => prev.filter((item) => item.id !== id));
        } else {
          setContent((prev) => prev.filter((item) => item.id !== id));
        }
        if (selectedId === id) {
          setSelectedId(null);
        }
      }
    } catch (err) {
      console.error(`Failed to delete ${endpoint}:`, err);
    }
  };

  if (loading) {
    return <div className="flex h-screen bg-background items-center justify-center text-foreground font-medium">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        loading {activeView}...
      </div>
    </div>;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden" id="main-content">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      {(activeView !== "automate-trades" && activeView !== "preferences") ? (
        <>
          <ContentFeed
            items={(activeView === "trade-ideas" || activeView === "bridge-and-execute") ? tradeIdeas : content}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onDelete={handleDelete}
            activeView={activeView}
          />
          <DetailPanel item={selectedItem as any} onClose={() => setSelectedId(null)} activeView={activeView} />
        </>
      ) : (
        <div className="flex-1 flex flex-col h-screen bg-background items-center justify-center text-muted-foreground/30 font-medium italic">
          {/* Truly nothing */}
        </div>
      )}
    </div>
  );

};

export default Index;
