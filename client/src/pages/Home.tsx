import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import CategoryFilter from "@/components/CategoryFilter";
import LocationCard from "@/components/LocationCard";
import Footer from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import type { Location } from "@shared/schema";

export default function Home() {
  const { data: locations, isLoading } = useQuery<Location[]>({
    queryKey: ["/api/locations"],
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <HeroSection />
      <CategoryFilter />
      
      <main className="flex-1">
        <section className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16">
          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Featured Locations</h2>
            <p className="text-muted-foreground">Discover the best hidden gems Cape Town has to offer</p>
          </div>
          
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading locations...</p>
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
              <p className="text-muted-foreground">No locations available yet. Check back soon!</p>
            </div>
          )}
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
