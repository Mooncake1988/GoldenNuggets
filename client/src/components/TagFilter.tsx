import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

interface Tag {
  tag: string;
  count: number;
}

export default function TagFilter() {
  const [, setLocation] = useLocation();
  
  const [urlParams, setUrlParams] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return {
      searchQuery: params.get('search') || '',
      selectedTag: params.get('tag') || '',
    };
  });

  useEffect(() => {
    const handleUrlChange = () => {
      const params = new URLSearchParams(window.location.search);
      setUrlParams({
        searchQuery: params.get('search') || '',
        selectedTag: params.get('tag') || '',
      });
    };

    window.addEventListener('popstate', handleUrlChange);
    
    handleUrlChange();
    
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, []);

  const { data: tags, isLoading } = useQuery<Tag[]>({
    queryKey: ["/api/tags"],
  });

  const handleTagClick = (tag: string) => {
    const params = new URLSearchParams(window.location.search);
    const currentSearch = params.get('search') || '';
    const currentTag = params.get('tag') || '';
    
    const newParams = new URLSearchParams();
    
    if (currentSearch) {
      newParams.set('search', currentSearch);
    }
    
    if (tag && currentTag !== tag) {
      newParams.set('tag', tag);
    }
    
    const newUrl = newParams.toString() ? `/?${newParams.toString()}` : '/';
    setLocation(newUrl);
    
    const updatedParams = new URLSearchParams(newUrl.split('?')[1] || '');
    setUrlParams({
      searchQuery: updatedParams.get('search') || '',
      selectedTag: updatedParams.get('tag') || '',
    });
  };

  if (isLoading) {
    return (
      <div className="sticky top-16 md:top-20 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-center py-2">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sticky top-16 md:top-20 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4">
        <div className="flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
          <Badge
            variant={!urlParams.selectedTag ? "default" : "outline"}
            className="shrink-0 snap-start cursor-pointer px-4 py-2 text-sm font-medium hover-elevate"
            onClick={() => handleTagClick('')}
            data-testid="badge-tag-all"
          >
            All
          </Badge>
          
          {tags?.map((tagData) => {
            const isActive = urlParams.selectedTag === tagData.tag;
            
            return (
              <Badge
                key={tagData.tag}
                variant={isActive ? "default" : "outline"}
                className="shrink-0 snap-start cursor-pointer px-4 py-2 text-sm font-medium hover-elevate"
                onClick={() => handleTagClick(tagData.tag)}
                data-testid={`badge-tag-${tagData.tag.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {tagData.tag}
              </Badge>
            );
          })}
        </div>
      </div>
    </div>
  );
}
