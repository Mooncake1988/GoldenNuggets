import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import CategoryFilter from "@/components/CategoryFilter";
import LocationCard from "@/components/LocationCard";
import Footer from "@/components/Footer";
import coffeeImage from "@assets/stock_images/artisan_coffee_latte_3a3fed7c.jpg";
import restaurantImage from "@assets/stock_images/gourmet_restaurant_f_5145c4a0.jpg";
import beachImage from "@assets/stock_images/cape_town_beach_ocea_bc37eb48.jpg";
import hikeImage from "@assets/stock_images/hiking_mountain_trai_c72224ba.jpg";
import marketImage from "@assets/stock_images/vibrant_local_market_f99b1ee1.jpg";
import barImage from "@assets/stock_images/craft_cocktail_bar_d_d68fc503.jpg";

export default function Home() {
  const mockLocations = [
    {
      id: "1",
      name: "Truth Coffee",
      category: "Coffee Shop",
      neighborhood: "CBD",
      description: "Steampunk-themed coffee roastery serving exceptional artisan coffee in a unique industrial setting.",
      image: coffeeImage,
      tags: ["Specialty Coffee", "Brunch", "Instagram Worthy"],
    },
    {
      id: "2",
      name: "The Test Kitchen",
      category: "Restaurant",
      neighborhood: "Woodstock",
      description: "Award-winning fine dining restaurant offering innovative tasting menus with South African ingredients.",
      image: restaurantImage,
      tags: ["Fine Dining", "Tasting Menu", "Local Cuisine"],
    },
    {
      id: "3",
      name: "Camps Bay Beach",
      category: "Beach",
      neighborhood: "Camps Bay",
      description: "Stunning white sand beach with crystal clear water, backed by the Twelve Apostles mountain range.",
      image: beachImage,
      tags: ["Swimming", "Sunset Views", "Beach Bars"],
    },
    {
      id: "4",
      name: "Lion's Head Hike",
      category: "Hike",
      neighborhood: "Signal Hill",
      description: "Moderate hike offering 360-degree views of Cape Town, Table Mountain, and the Atlantic Ocean.",
      image: hikeImage,
      tags: ["Sunrise Hike", "Scenic Views", "Moderate Difficulty"],
    },
    {
      id: "5",
      name: "Neighbourgoods Market",
      category: "Market",
      neighborhood: "Woodstock",
      description: "Vibrant weekend market featuring local artisan food, craft beer, and live music in a creative space.",
      image: marketImage,
      tags: ["Weekend Market", "Street Food", "Local Crafts"],
    },
    {
      id: "6",
      name: "Cause Effect Cocktail Kitchen",
      category: "Bar",
      neighborhood: "CBD",
      description: "Sophisticated cocktail bar known for creative drinks and a relaxed atmosphere in the city center.",
      image: barImage,
      tags: ["Craft Cocktails", "Live Music", "Date Night"],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <HeroSection />
      <CategoryFilter />
      
      <main className="flex-1">
        <section className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16">
          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Featured Locations</h2>
            <p className="text-muted-foreground">Discover the best hidden gems Cape Town has to offer</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {mockLocations.map((location) => (
              <LocationCard key={location.id} {...location} />
            ))}
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
