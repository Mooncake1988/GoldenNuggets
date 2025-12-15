import { useQuery } from "@tanstack/react-query";
import type { TickerItem } from "@shared/schema";
import { tickerCategories } from "@shared/schema";
import { ExternalLink } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface NewsTickerProps {
  previewMode?: boolean;
}

export default function NewsTicker({ previewMode = false }: NewsTickerProps) {
  const [isPaused, setIsPaused] = useState(false);
  const tickerRef = useRef<HTMLDivElement>(null);
  
  const { data: tickerItems, isLoading } = useQuery<TickerItem[]>({
    queryKey: previewMode ? ["/api/admin/ticker"] : ["/api/ticker"],
    refetchInterval: previewMode ? 5000 : 60000,
  });

  const getCategoryInfo = (categoryValue: string) => {
    return tickerCategories.find(c => c.value === categoryValue) || { label: categoryValue, color: "bg-gray-500" };
  };

  const isExpired = (item: TickerItem) => {
    if (!item.endDate) return false;
    return new Date(item.endDate) < new Date();
  };

  const activeItems = previewMode 
    ? tickerItems?.filter(item => item.isActive && !isExpired(item)) || []
    : tickerItems || [];

  if (isLoading) {
    return null;
  }

  if (!activeItems || activeItems.length === 0) {
    if (previewMode) {
      return (
        <div className="bg-muted border-b border-border py-3 px-4">
          <p className="text-center text-muted-foreground text-sm">
            No active announcements. Create one to see the preview.
          </p>
        </div>
      );
    }
    return null;
  }

  const handleItemClick = (item: TickerItem, e: React.MouseEvent) => {
    if (item.linkUrl) {
      e.preventDefault();
      window.open(item.linkUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div 
      className="relative overflow-hidden bg-muted border-b border-border"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      data-testid="news-ticker"
    >
      <div 
        ref={tickerRef}
        className="flex whitespace-nowrap animate-ticker"
        style={{
          animationPlayState: isPaused ? "paused" : "running",
          willChange: "transform",
          transform: "translateZ(0)",
          backfaceVisibility: "hidden",
        }}
      >
        {[...activeItems, ...activeItems, ...activeItems].map((item, index) => {
          const catInfo = getCategoryInfo(item.category);
          const isClickable = !!item.linkUrl;
          
          return (
            <div
              key={`${item.id}-${index}`}
              className={`inline-flex items-center gap-3 px-6 py-2.5 ${isClickable ? "cursor-pointer hover:bg-white/30 dark:hover:bg-black/20 transition-colors" : ""}`}
              onClick={(e) => handleItemClick(item, e)}
              data-testid={`ticker-item-${item.id}`}
            >
              <span 
                className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-semibold text-white ${catInfo.color}`}
              >
                {catInfo.label}
              </span>
              <span className="text-sm font-medium text-foreground">
                {item.title}
              </span>
              {isClickable && (
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
              )}
              <span className="text-muted-foreground/50 mx-4">|</span>
            </div>
          );
        })}
      </div>
      
      <style>{`
        @keyframes ticker {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }
        
        .animate-ticker {
          animation: ticker ${Math.max(activeItems.length * 7, 18)}s linear infinite;
        }
      `}</style>
    </div>
  );
}
