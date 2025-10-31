import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Loader2 } from "lucide-react";
import type { Location } from "@shared/schema";

const categoryDescriptions: Record<string, string> = {
  "Coffee Shop": "Discover Cape Town's finest artisan coffee spots and cozy cafes",
  "Restaurant": "Experience the best dining experiences from local favorites to fine dining",
  "Beach": "Explore pristine beaches and hidden coastal gems",
  "Hike": "Find breathtaking trails and scenic hiking routes",
  "Market": "Browse vibrant local markets and artisan vendors",
  "Bar": "Enjoy craft cocktails and local brews at the city's best bars",
};

export default function Categories() {
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

  const locationsByCategory = locations?.reduce((acc, location) => {
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
            <h1 className="text-4xl md:text-5xl font-bold mb-4" data-testid="heading-categories">
              Explore by Category
            </h1>
            <p className="text-lg text-muted-foreground">
              Browse our curated collection of Cape Town's hidden gems organized by type
            </p>
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
                      <h2 className="text-2xl md:text-3xl font-bold mb-2" data-testid={`heading-${category}`}>
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
                        <Link key={location.id} href={`/location/${location.slug}`}>
                          <Card className="overflow-hidden hover-elevate active-elevate-2 cursor-pointer h-full" data-testid={`card-location-${location.id}`}>
                            {location.images && location.images.length > 0 && (
                              <div className="aspect-video w-full overflow-hidden">
                                <img
                                  src={location.images[0]}
                                  alt={location.name}
                                  className="w-full h-full object-cover"
                                  data-testid={`img-location-${location.id}`}
                                />
                              </div>
                            )}
                            <CardContent className="p-6">
                              <h3 className="font-semibold text-lg mb-2" data-testid={`text-name-${location.id}`}>
                                {location.name}
                              </h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                                <MapPin className="h-4 w-4" />
                                <span>{location.neighborhood}</span>
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {location.description}
                              </p>
                              {location.tags && location.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                  {location.tags.slice(0, 3).map((tag, index) => (
                                    <span
                                      key={index}
                                      className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md"
                                      data-testid={`tag-${tag}-${location.id}`}
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </Link>
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
