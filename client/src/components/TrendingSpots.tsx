import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, MapPin, Flame, ArrowUpRight } from "lucide-react";
import type { Location } from "@shared/schema";

function TrendingLocationCard({ location, rank }: { location: Location; rank: number }) {
  const trendingScore = location.trendingScore || 0;
  const postCount = location.currentPostCount || 0;
  const image = location.images?.[0] || "";

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <Link href={`/location/${location.slug}`} data-testid={`link-trending-${location.id}`}>
      <Card
        className="overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 border-2 border-orange-500/40 hover:border-orange-500 hover:shadow-[0_0_20px_rgba(249,115,22,0.3)]"
        data-testid={`card-trending-${location.id}`}
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          {image ? (
            <img
              src={image}
              alt={location.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <MapPin className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <Badge className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 backdrop-blur-sm font-bold shadow-lg">
            <Flame className="w-3 h-3 mr-1" />
            #{rank} Trending
          </Badge>
          <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md">
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            <span className="text-xs font-bold text-emerald-400">
              {trendingScore >= 0 ? '+' : ''}{trendingScore.toFixed(1)}%
            </span>
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="font-bold text-lg mb-1 line-clamp-1" data-testid={`text-trending-name-${location.id}`}>
            {location.name}
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span className="line-clamp-1">{location.neighborhood}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>{formatNumber(postCount)} posts</span>
            </div>
          </div>
          {location.instagramHashtag && (
            <div className="mt-2">
              <Badge variant="outline" className="text-xs text-orange-600 dark:text-orange-400 border-orange-500/30">
                #{location.instagramHashtag}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

function TrendingLocationSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-[4/3] w-full" />
      <CardContent className="p-4">
        <Skeleton className="h-5 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </CardContent>
    </Card>
  );
}

export default function TrendingSpots() {
  const { data: trendingLocations, isLoading, error } = useQuery<Location[]>({
    queryKey: ["/api/locations/trending"],
    refetchInterval: 5 * 60 * 1000,
  });

  if (error) {
    return null;
  }

  if (isLoading) {
    return (
      <section className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12 border-t" data-testid="section-trending-spots">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
              <Flame className="w-7 h-7 text-orange-500" />
              Trending Lekker Spots
            </h2>
            <p className="text-muted-foreground mt-1">
              Discover what's hot on Instagram right now
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <TrendingLocationSkeleton key={i} />
          ))}
        </div>
      </section>
    );
  }

  if (!trendingLocations || trendingLocations.length === 0) {
    return null;
  }

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12 border-t" data-testid="section-trending-spots">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
            <Flame className="w-7 h-7 text-orange-500" />
            Trending Lekker Spots
          </h2>
          <p className="text-muted-foreground mt-1">
            Discover what's hot on Instagram right now
          </p>
        </div>
        <Link href="/trending" data-testid="link-view-all-trending">
          <span className="text-sm text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1">
            View all trending
            <ArrowUpRight className="w-4 h-4" />
          </span>
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {trendingLocations.slice(0, 5).map((location, index) => (
          <TrendingLocationCard
            key={location.id}
            location={location}
            rank={index + 1}
          />
        ))}
      </div>
    </section>
  );
}
