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
        <Badge className={`absolute top-3 left-3 backdrop-blur-sm font-semibold shadow-lg ${getCategoryColor(category)}`}>
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
          {tags.map((tag, index) => {
            const tagColors = [
              "bg-primary/10 text-primary dark:text-primary border-primary/20",
              "bg-accent/10 text-accent dark:text-accent border-accent/20",
              "bg-secondary/10 text-secondary-foreground dark:text-secondary border-secondary/20",
              "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
              "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
            ];
            const colorClass = tagColors[index % tagColors.length];
            
            return (
              <Badge key={tag} className={`text-xs ${colorClass}`}>
                {tag}
              </Badge>
            );
          })}
        </div>
      </CardContent>
    </Card>
    </Link>
  );
}
