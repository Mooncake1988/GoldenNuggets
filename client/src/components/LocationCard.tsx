import { MapPin, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface LocationCardProps {
  id: string;
  name: string;
  category: string;
  neighborhood: string;
  description: string;
  image: string;
  tags: string[];
  onClick?: () => void;
}

export default function LocationCard({
  id,
  name,
  category,
  neighborhood,
  description,
  image,
  tags,
  onClick,
}: LocationCardProps) {
  return (
    <Card
      className="overflow-hidden hover-elevate active-elevate-2 cursor-pointer transition-all duration-300"
      onClick={() => {
        onClick?.();
        console.log(`Location clicked: ${name}`);
      }}
      data-testid={`card-location-${id}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover"
        />
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
  );
}
