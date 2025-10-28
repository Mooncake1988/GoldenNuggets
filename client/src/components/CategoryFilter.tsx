import { Coffee, UtensilsCrossed, Waves, Mountain, ShoppingBag, Wine } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const categories = [
  { id: "all", name: "All", icon: null },
  { id: "coffee", name: "Coffee Shops", icon: Coffee },
  { id: "restaurants", name: "Restaurants", icon: UtensilsCrossed },
  { id: "beaches", name: "Beaches", icon: Waves },
  { id: "hikes", name: "Hikes", icon: Mountain },
  { id: "markets", name: "Markets", icon: ShoppingBag },
  { id: "bars", name: "Bars & Nightlife", icon: Wine },
];

export default function CategoryFilter() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  return (
    <div className="sticky top-16 md:top-20 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4">
        <div className="flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = selectedCategory === category.id;
            
            return (
              <Badge
                key={category.id}
                variant={isActive ? "default" : "outline"}
                className="shrink-0 snap-start cursor-pointer px-4 py-2 text-sm font-medium"
                onClick={() => {
                  setSelectedCategory(category.id);
                  console.log(`Category selected: ${category.name}`);
                }}
                data-testid={`badge-category-${category.id}`}
              >
                {Icon && <Icon className="h-4 w-4 mr-2" />}
                {category.name}
              </Badge>
            );
          })}
        </div>
      </div>
    </div>
  );
}
