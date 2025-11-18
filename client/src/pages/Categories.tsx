import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LocationCard from "@/components/LocationCard";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Star } from "lucide-react";
import type { Location } from "@shared/schema";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const categoryDescriptions: Record<string, string> = {
  "Coffee Shop": "Discover Cape Town's finest artisan coffee spots and cozy cafes",
  "Restaurant": "Experience the best dining experiences from local favorites to fine dining",
  "Beach": "Explore pristine beaches and hidden coastal gems",
  "Hike": "Find breathtaking trails and scenic hiking routes",
  "Market": "Browse vibrant local markets and artisan vendors",
  "Bar": "Enjoy craft cocktails and local brews at the city's best bars",
};

export default function Categories() {
  const [featuredOnly, setFeaturedOnly] = useState(false);

  const { data: locations, isLoading } = useQuery<Location[]>({
    queryKey: ["/api/locations"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" data-testid="loader-categories" />
      </div>
    );
  }

  const filteredLocations = featuredOnly
    ? locations?.filter(loc => loc.featured)
    : locations;

  const locationsByCategory = filteredLocations?.reduce((acc, location) => {
    if (!acc[location.category]) {
      acc[location.category] = [];
    }
    acc[location.category].push(location);
    return acc;
  }, {} as Record<string, Location[]>) || {};

  const categories = Object.keys(locationsByCategory).sort();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16">
          <div className="mb-12">
            <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-4" data-testid="heading-categories">
              Explore by Category
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Browse our curated collection of Cape Town's hidden gems organized by type
            </p>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="featured-only"
                checked={featuredOnly}
                onCheckedChange={(checked) => setFeaturedOnly(checked === true)}
                data-testid="checkbox-featured-only"
              />
              <Label htmlFor="featured-only" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                <Star className="h-4 w-4" />
                Show Featured Locations Only
              </Label>
            </div>
          </div>

          {categories.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No locations found yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-12">
              {categories.map((category) => {
                const categoryLocations = locationsByCategory[category];
                return (
                  <div key={category} className="space-y-6" data-testid={`category-${category}`}>
                    <div className="border-b pb-4">
                      <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight mb-2" data-testid={`heading-${category}`}>
                        {category}
                      </h2>
                      {categoryDescriptions[category] && (
                        <p className="text-muted-foreground">
                          {categoryDescriptions[category]}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground mt-2">
                        {categoryLocations.length} {categoryLocations.length === 1 ? 'location' : 'locations'}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {categoryLocations.map((location) => (
                        <LocationCard
                          key={location.id}
                          id={location.id}
                          slug={location.slug}
                          name={location.name}
                          category={location.category}
                          neighborhood={location.neighborhood}
                          description={location.description}
                          image={location.images && location.images.length > 0 ? location.images[0] : ""}
                          tags={location.tags || []}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
