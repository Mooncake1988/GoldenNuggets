import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MapView from "@/components/MapView";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import type { Location } from "@shared/schema";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";

export default function MapPage() {
  const [featuredOnly, setFeaturedOnly] = useState(false);

  const { data: locations, isLoading } = useQuery<Location[]>({
    queryKey: ["/api/locations"],
  });

  const filteredLocations = featuredOnly
    ? locations?.filter(loc => loc.featured)
    : locations;

  const mapLocations = filteredLocations?.map(loc => ({
    id: loc.id,
    name: loc.name,
    lat: parseFloat(loc.latitude),
    lng: parseFloat(loc.longitude),
    category: loc.category,
  })) || [];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Explore on Map</h1>
            <p className="text-muted-foreground mb-4">Discover all locations across Cape Town</p>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="featured-only-map"
                checked={featuredOnly}
                onCheckedChange={(checked) => setFeaturedOnly(checked === true)}
                data-testid="checkbox-featured-only-map"
              />
              <Label htmlFor="featured-only-map" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                <Star className="h-4 w-4" />
                Show Featured Locations Only
              </Label>
            </div>
          </div>
          
          <Card>
            <CardContent className="p-4">
              {isLoading ? (
                <div className="h-[calc(100vh-300px)] flex items-center justify-center">
                  <p className="text-muted-foreground">Loading map...</p>
                </div>
              ) : (
                <MapView locations={mapLocations} height="calc(100vh - 300px)" />
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
