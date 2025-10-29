import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import heroImage from "@assets/generated_images/Cape_Town_Table_Mountain_hero_ec65eba7.png";
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
  };

  return (
    <section className="relative min-h-[70vh] md:min-h-[80vh] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-6 text-center">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4">
          Discover Cape Town's Hidden Gems
        </h1>
        <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
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
