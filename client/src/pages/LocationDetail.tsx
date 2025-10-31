import { useRoute, useLocation as useWouterLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Location } from "@shared/schema";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ShareButton from "@/components/ShareButton";
import { MapPin, Navigation, ArrowLeft } from "lucide-react";
import { useState } from "react";

export default function LocationDetail() {
  const [, params] = useRoute("/location/:slug");
  const [, setLocation] = useWouterLocation();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  const { data: location, isLoading } = useQuery<Location>({
    queryKey: [`/api/locations/by-slug/${params?.slug}`],
    enabled: !!params?.slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading location...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!location) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Location not found</h2>
            <p className="text-muted-foreground mb-4">The location you're looking for doesn't exist</p>
            <Button onClick={() => setLocation("/")} data-testid="button-back-home">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const hasImages = location.images && location.images.length > 0;
  const currentImage = hasImages ? location.images[selectedImageIndex] : "";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-8">
          <Button 
            variant="ghost" 
            onClick={() => setLocation("/")} 
            className="mb-4"
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              {hasImages ? (
                <div className="space-y-4">
                  <Card className="overflow-hidden">
                    <img
                      src={currentImage}
                      alt={location.name}
                      className="w-full aspect-[4/3] object-cover"
                      data-testid="img-main"
                    />
                  </Card>
                  
                  {location.images.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {location.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`aspect-square rounded-lg overflow-hidden border-2 hover-elevate ${
                            selectedImageIndex === index ? "border-primary" : "border-transparent"
                          }`}
                          data-testid={`button-thumbnail-${index}`}
                        >
                          <img
                            src={image}
                            alt={`${location.name} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Card className="overflow-hidden">
                  <div className="w-full aspect-[4/3] bg-muted flex items-center justify-center">
                    <MapPin className="h-12 w-12 text-muted-foreground" />
                  </div>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                  <h1 className="text-3xl md:text-4xl font-bold" data-testid="text-location-name">
                    {location.name}
                  </h1>
                  <ShareButton
                    title={location.name}
                    text={`Check out ${location.name} in the Western Cape - ${location.description}`}
                    url={typeof window !== 'undefined' ? window.location.href : ''}
                    variant="outline"
                  />
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="secondary" data-testid="badge-category">
                    {location.category}
                  </Badge>
                  <Badge variant="outline" data-testid="badge-neighborhood">
                    <MapPin className="h-3 w-3 mr-1" />
                    {location.neighborhood}
                  </Badge>
                </div>

                <p className="text-lg text-muted-foreground leading-relaxed" data-testid="text-description">
                  {location.description}
                </p>
              </div>

              {location.address && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium mb-1">Address</p>
                        <p className="text-sm text-muted-foreground" data-testid="text-address">
                          {location.address}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Navigation className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium mb-2">Get Directions</p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const url = `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`;
                            window.open(url, "_blank");
                          }}
                          data-testid="button-google-maps"
                        >
                          Google Maps
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setLocation("/map")}
                          data-testid="button-view-on-map"
                        >
                          View on Map
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {location.tags && location.tags.length > 0 && (
                <div>
                  <p className="font-medium mb-3">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {location.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" data-testid={`badge-tag-${index}`}>
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
