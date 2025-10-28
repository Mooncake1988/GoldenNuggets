import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import CategoryFilter from "@/components/CategoryFilter";
import LocationCard from "@/components/LocationCard";
import Footer from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import type { Location } from "@shared/schema";
import { useLocation } from "wouter";
import { useMemo } from "react";

export default function Home() {
  const [location] = useLocation();
  
  const searchQuery = useMemo(() => {
    const params = new URLSearchParams(location.split('?')[1]);
    return params.get('search') || '';
  }, [location]);

  const { data: locations, isLoading, error } = useQuery<Location[]>({
    queryKey: searchQuery ? ["/api/locations/search", searchQuery] : ["/api/locations"],
    queryFn: searchQuery 
      ? async () => {
          const res = await fetch(`/api/locations/search?q=${encodeURIComponent(searchQuery)}`);
          if (!res.ok) {
            throw new Error(`Search failed: ${res.statusText}`);
          }
          return res.json();
        }
      : undefined,
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <HeroSection />
      <CategoryFilter />
      
      <main className="flex-1">
        <section className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16">
          <div className="mb-8">
            {searchQuery ? (
              <>
                <h2 className="text-3xl md:text-4xl font-bold mb-2" data-testid="text-search-title">
                  Search Results for "{searchQuery}"
                </h2>
                <p className="text-muted-foreground">
                  {isLoading ? 'Searching...' : `Found ${locations?.length || 0} location${locations?.length !== 1 ? 's' : ''}`}
                </p>
              </>
            ) : (
              <>
                <h2 className="text-3xl md:text-4xl font-bold mb-2">Featured Locations</h2>
                <p className="text-muted-foreground">Discover the best hidden gems Cape Town has to offer</p>
              </>
            )}
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
                {searchQuery ? 'Searching locations...' : 'Loading locations...'}
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
                {searchQuery 
                  ? `No locations found for "${searchQuery}". Try a different search term.`
                  : 'No locations available yet. Check back soon!'}
              </p>
            </div>
          )}
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
