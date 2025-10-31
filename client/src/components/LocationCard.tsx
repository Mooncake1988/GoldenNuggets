import { MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

interface LocationCardProps {
  id: string;
  slug: string;
  name: string;
  category: string;
  neighborhood: string;
  description: string;
  image: string;
  tags: string[];
}

export default function LocationCard({
  id,
  slug,
  name,
  category,
  neighborhood,
  description,
  image,
  tags,
}: LocationCardProps) {
  return (
    <Link href={`/location/${slug}`} data-testid={`link-location-${id}`}>
      <Card
        className="overflow-hidden hover-elevate active-elevate-2 cursor-pointer transition-all duration-300"
        data-testid={`card-location-${id}`}
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          {image ? (
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <MapPin className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
        <Badge className="absolute top-3 left-3 bg-background/80 backdrop-blur-sm text-foreground border-0">
          {category}
        </Badge>
      </div>
      <CardContent className="p-4 md:p-6">
        <h3 className="font-bold text-xl mb-1" data-testid={`text-location-name-${id}`}>{name}</h3>
        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
          <MapPin className="h-3 w-3" />
          <span>{neighborhood}</span>
        </div>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {description}
        </p>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
    </Link>
  );
}
