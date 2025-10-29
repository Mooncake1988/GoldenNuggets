import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import TagFilter from "@/components/TagFilter";
import LocationCard from "@/components/LocationCard";
import Footer from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import type { Location } from "@shared/schema";
import { useLocation } from "wouter";
import { useMemo } from "react";

export default function Home() {
  const [location] = useLocation();
  
  const { searchQuery, selectedTag } = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return {
      searchQuery: params.get('search') || '',
      selectedTag: params.get('tag') || '',
    };
  }, [location]);

  const queryKey = useMemo(() => {
    if (searchQuery && selectedTag) {
      return ["/api/locations/search", searchQuery, selectedTag];
    } else if (searchQuery) {
      return ["/api/locations/search", searchQuery];
    } else if (selectedTag) {
      return ["/api/locations/by-tag", selectedTag];
    }
    return ["/api/locations"];
  }, [searchQuery, selectedTag]);

  const queryFn = useMemo(() => {
    return async () => {
      if (searchQuery && selectedTag) {
        const res = await fetch(
          `/api/locations/search?q=${encodeURIComponent(searchQuery)}&tag=${encodeURIComponent(selectedTag)}`
        );
        if (!res.ok) throw new Error(`Search failed: ${res.statusText}`);
        return res.json();
      } else if (searchQuery) {
        const res = await fetch(`/api/locations/search?q=${encodeURIComponent(searchQuery)}`);
        if (!res.ok) throw new Error(`Search failed: ${res.statusText}`);
        return res.json();
      } else if (selectedTag) {
        const res = await fetch(`/api/locations/by-tag/${encodeURIComponent(selectedTag)}`);
        if (!res.ok) throw new Error(`Failed to fetch locations by tag: ${res.statusText}`);
        return res.json();
      } else {
        const res = await fetch('/api/locations');
        if (!res.ok) throw new Error(`Failed to fetch locations: ${res.statusText}`);
        return res.json();
      }
    };
  }, [searchQuery, selectedTag]);

  const { data: locations, isLoading, error } = useQuery<Location[]>({
    queryKey,
    queryFn,
  });

  const getTitle = () => {
    if (searchQuery && selectedTag) {
      return `"${searchQuery}" in ${selectedTag}`;
    } else if (searchQuery) {
      return `Search Results for "${searchQuery}"`;
    } else if (selectedTag) {
      return selectedTag;
    }
    return "Featured Locations";
  };

  const getSubtitle = () => {
    if (searchQuery || selectedTag) {
      return isLoading ? 'Loading...' : `${locations?.length || 0} location${locations?.length !== 1 ? 's' : ''}`;
    }
    return "Discover the best hidden gems Cape Town has to offer";
  };

  const getNoResultsMessage = () => {
    if (searchQuery && selectedTag) {
      return `No locations found for "${searchQuery}" with tag "${selectedTag}".`;
    } else if (searchQuery) {
      return `No locations found for "${searchQuery}". Try a different search term.`;
    } else if (selectedTag) {
      return `No locations found with the tag "${selectedTag}".`;
    }
    return 'No locations available yet. Check back soon!';
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <HeroSection />
      <TagFilter />
      
      <main className="flex-1">
        <section className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16">
          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-2" data-testid="text-section-title">
              {getTitle()}
            </h2>
            <p className="text-muted-foreground" data-testid="text-section-subtitle">
              {getSubtitle()}
            </p>
          </div>
          
          {error ? (
            <div className="text-center py-12">
              <p className="text-destructive" data-testid="text-error">
                Error loading locations. Please try again.
              </p>
            </div>
          ) : isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground" data-testid="text-loading">
                Loading locations...
              </p>
            </div>
          ) : locations && locations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {locations.map((location) => (
                <LocationCard 
                  key={location.id}
                  id={location.id}
                  name={location.name}
                  category={location.category}
                  neighborhood={location.neighborhood}
                  description={location.description}
                  image={location.images[0] || ""}
                  tags={location.tags}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground" data-testid="text-no-results">
                {getNoResultsMessage()}
              </p>
            </div>
          )}
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
