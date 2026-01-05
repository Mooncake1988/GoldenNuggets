import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Compass, MapPin, ArrowRight } from "lucide-react";
import type { Location } from "@shared/schema";

interface ContinueYourAdventureProps {
  locationId: string;
  currentNeighborhood: string;
}

const getCategoryColor = (category: string) => {
  const categoryColors: Record<string, string> = {
    "Coffee Shop": "bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0",
    "Restaurant": "bg-gradient-to-r from-rose-500 to-pink-500 text-white border-0",
    "Beach": "bg-gradient-to-r from-cyan-500 to-teal-500 text-white border-0",
    "Hike": "bg-gradient-to-r from-emerald-500 to-green-500 text-white border-0",
    "Market": "bg-gradient-to-r from-violet-500 to-purple-500 text-white border-0",
    "Bar": "bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white border-0",
  };
  
  return categoryColors[category] || "bg-primary text-primary-foreground border-0";
};

export default function ContinueYourAdventure({ locationId, currentNeighborhood }: ContinueYourAdventureProps) {
  const { data: relatedLocations, isLoading } = useQuery<Location[]>({
    queryKey: ["/api/locations", locationId, "related"],
    queryFn: async () => {
      const response = await fetch(`/api/locations/${locationId}/related`);
      if (!response.ok) throw new Error("Failed to fetch related locations");
      return response.json();
    },
    enabled: !!locationId,
  });

  if (isLoading) {
    return (
      <Card className="overflow-hidden animate-pulse">
        <CardHeader className="pb-3">
          <div className="h-6 bg-muted rounded w-48"></div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-24 bg-muted rounded"></div>
          <div className="h-24 bg-muted rounded"></div>
        </CardContent>
      </Card>
    );
  }

  if (!relatedLocations || relatedLocations.length === 0) {
    return null;
  }

  return (
    <Card className="overflow-hidden" data-testid="card-continue-adventure">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Compass className="h-5 w-5 text-primary" />
          Continue Your Adventure
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Nearby gems to explore while you're in the area
        </p>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {relatedLocations.map((location) => (
          <Link 
            key={location.id} 
            href={`/location/${location.slug}`}
            data-testid={`link-related-${location.id}`}
          >
            <div className="group flex gap-4 p-3 rounded-lg border hover-elevate cursor-pointer transition-all">
              <div className="relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden">
                {location.images && location.images.length > 0 ? (
                  <img
                    src={location.images[0]}
                    alt={location.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="font-semibold text-sm truncate group-hover:text-primary transition-colors" data-testid={`text-related-name-${location.id}`}>
                      {location.name}
                    </h4>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                      <MapPin className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{location.neighborhood}</span>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0 mt-0.5" />
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={`text-xs ${getCategoryColor(location.category)}`}>
                    {location.category}
                  </Badge>
                  {location.neighborhood !== currentNeighborhood && (
                    <span className="text-xs text-muted-foreground">
                      • Nearby
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
