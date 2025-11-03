import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LottieAnimation from "@/components/LottieAnimation";
import areaMapAnimation from "@assets/animations/area-map.json";
import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import type { FormEvent } from "react";

export default function HeroSection() {
  const [location, setLocation] = useLocation();
  
  const { currentTag, urlSearchQuery } = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return {
      currentTag: params.get('tag') || '',
      urlSearchQuery: params.get('search') || '',
    };
  }, [location]);
  
  const [searchQuery, setSearchQuery] = useState(urlSearchQuery);

  useEffect(() => {
    setSearchQuery(urlSearchQuery);
  }, [urlSearchQuery]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();
    
    const newParams = new URLSearchParams();
    
    if (trimmedQuery) {
      newParams.set('search', trimmedQuery);
    }
    
    if (currentTag) {
      newParams.set('tag', currentTag);
    }
    
    const newUrl = newParams.toString() ? `/?${newParams.toString()}` : '/';
    setLocation(newUrl);
    
    window.dispatchEvent(new CustomEvent('urlchange'));
  };

  return (
    <section className="relative min-h-[70vh] md:min-h-[80vh] flex items-center justify-center overflow-hidden bg-background">
      <div className="absolute inset-0 flex items-center justify-center" style={{ opacity: 0.65 }}>
        <LottieAnimation
          animationData={areaMapAnimation}
          loop={true}
          autoplay={true}
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-6 text-center">
        <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-primary mb-4 drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]">
          Discover Cape Town's Hidden Gems
        </h1>
        <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto font-medium drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">
          Curated local favorites - amazing coffee shops, restaurants, and unique experiences not found in typical tourist guides
        </p>
        
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSearch}>
            <div className="flex gap-2 bg-white/10 backdrop-blur-md p-2 rounded-lg border border-white/20">
              <Input
                type="search"
                placeholder="Search for coffee shops, restaurants, experiences..."
                className="bg-white text-foreground border-0 h-12 text-base"
                data-testid="input-hero-search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button type="submit" size="lg" className="shrink-0" data-testid="button-hero-search">
                <Search className="h-5 w-5 md:mr-2" />
                <span className="hidden md:inline">Search</span>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
