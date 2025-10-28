import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MapView from "@/components/MapView";
import { Card, CardContent } from "@/components/ui/card";

export default function MapPage() {
  const mockLocations = [
    { id: "1", name: "Truth Coffee", lat: -33.9249, lng: 18.4241, category: "Coffee Shop" },
    { id: "2", name: "The Test Kitchen", lat: -33.9275, lng: 18.4491, category: "Restaurant" },
    { id: "3", name: "Camps Bay Beach", lat: -33.9503, lng: 18.3773, category: "Beach" },
    { id: "4", name: "Lion's Head", lat: -33.9320, lng: 18.3967, category: "Hike" },
    { id: "5", name: "Neighbourgoods Market", lat: -33.9295, lng: 18.4462, category: "Market" },
    { id: "6", name: "Cause Effect", lat: -33.9221, lng: 18.4232, category: "Bar" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Explore on Map</h1>
            <p className="text-muted-foreground">Discover all locations across Cape Town</p>
          </div>
          
          <Card>
            <CardContent className="p-4">
              <MapView locations={mockLocations} height="calc(100vh - 300px)" />
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
