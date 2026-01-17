import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ContentFeed } from "@/components/ContentFeed";
import { DetailPanel } from "@/components/DetailPanel";
import { ContentItem } from "@/components/ContentCard";

const Index = () => {
  const [activeView, setActiveView] = useState("feed");
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

  return (
    <div className="flex h-screen bg-background overflow-hidden" id="main-content">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      <ContentFeed
        items={content}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onDelete={handleDelete}
        activeView={activeView}
      />
      <DetailPanel item={selectedItem} onClose={() => setSelectedId(null)} />
    </div>
  );

};

export default Index;
