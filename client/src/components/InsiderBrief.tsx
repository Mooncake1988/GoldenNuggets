import { useQuery } from "@tanstack/react-query";
import type { InsiderTip } from "@shared/schema";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Wifi,
  Dog,
  Camera,
  Clock,
  Utensils,
  Car,
  Wallet,
  Users,
  Sun,
  MapPin,
  Info,
  Star,
  Image,
  Lightbulb,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  wifi: Wifi,
  dog: Dog,
  camera: Camera,
  clock: Clock,
  utensils: Utensils,
  car: Car,
  wallet: Wallet,
  users: Users,
  sun: Sun,
  "map-pin": MapPin,
  info: Info,
  star: Star,
  image: Image,
};

interface InsiderBriefProps {
  locationId: string;
}

export default function InsiderBrief({ locationId }: InsiderBriefProps) {
  const { data: tips, isLoading } = useQuery<InsiderTip[]>({
    queryKey: [`/api/locations/${locationId}/insider-tips`],
  });

  if (isLoading || !tips || tips.length === 0) {
    return null;
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          Good to Know
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <Accordion type="single" collapsible className="w-full">
          {tips.map((tip) => {
            const IconComponent = iconMap[tip.icon || "info"] || Info;
            return (
              <AccordionItem key={tip.id} value={tip.id} className="border-b last:border-b-0">
                <AccordionTrigger 
                  className="hover:no-underline py-3 gap-3"
                  data-testid={`accordion-trigger-${tip.id}`}
                >
                  <div className="flex items-center gap-3 text-left">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <IconComponent className="h-4 w-4 text-primary" />
                    </div>
                    <span className="font-medium text-sm">{tip.question}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 pt-0 pl-11">
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {tip.answer}
                  </p>
                  {tip.images && tip.images.length > 0 && (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {tip.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`${tip.question} - image ${index + 1}`}
                          className="rounded-md object-cover w-full aspect-video cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => window.open(image, "_blank")}
                          data-testid={`img-tip-${tip.id}-${index}`}
                        />
                      ))}
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
}
