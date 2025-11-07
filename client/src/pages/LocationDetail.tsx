import { useRoute, useLocation as useWouterLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import type { Location } from "@shared/schema";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ShareButton from "@/components/ShareButton";
import { MapPin, Navigation, ArrowLeft } from "lucide-react";
import { useState } from "react";

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
  
  const pageTitle = `${location.name} - ${location.category} in ${location.neighborhood} | LekkerSpots`;
  const pageDescription = location.description.length > 160 
    ? `${location.description.slice(0, 157)}...` 
    : location.description;
  
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://lekkerspots.co.za';
  const ogImage = hasImages ? location.images[0] : `${baseUrl}/og-image.jpg`;
  const pageUrl = typeof window !== 'undefined' ? window.location.href : `${baseUrl}/location/${location.slug}`;
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": location.name,
    "description": location.description,
    "image": hasImages ? location.images : [`${baseUrl}/og-image.jpg`],
    "address": location.address ? {
      "@type": "PostalAddress",
      "streetAddress": location.address,
      "addressLocality": location.neighborhood,
      "addressRegion": "Western Cape",
      "addressCountry": "ZA"
    } : undefined,
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": location.latitude,
      "longitude": location.longitude
    },
    "url": pageUrl,
    ...(location.category && { "servesCuisine": location.category === "Restaurant" || location.category === "Coffee Shop" ? location.category : undefined })
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        
        <meta property="og:type" content="place" />
        <meta property="og:site_name" content="LekkerSpots" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:secure_url" content={ogImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="800" />
        <meta property="og:image:alt" content={`${location.name} - ${location.category} in Western Cape`} />
        <meta property="og:locale" content="en_ZA" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={ogImage} />
        <meta name="twitter:image:alt" content={`${location.name} - ${location.category} in Western Cape`} />
        
        <link rel="canonical" href={pageUrl} />
        
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>
      
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
                  <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight" data-testid="text-location-name">
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
                  <Badge className={`font-semibold ${getCategoryColor(location.category)}`} data-testid="badge-category">
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
                    {location.tags.map((tag, index) => {
                      const tagColors = [
                        "bg-primary/10 text-primary dark:text-primary border-primary/20",
                        "bg-accent/10 text-accent dark:text-accent border-accent/20",
                        "bg-secondary/10 text-secondary-foreground dark:text-secondary border-secondary/20",
                        "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
                        "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
                      ];
                      const colorClass = tagColors[index % tagColors.length];
                      
                      return (
                        <Badge key={index} className={colorClass} data-testid={`badge-tag-${index}`}>
                          {tag}
                        </Badge>
                      );
                    })}
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
