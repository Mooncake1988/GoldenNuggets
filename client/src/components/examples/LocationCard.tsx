import LocationCard from '../LocationCard'
import coffeeImage from '@assets/stock_images/artisan_coffee_latte_3a3fed7c.jpg'

export default function LocationCardExample() {
  return (
    <div className="max-w-sm">
      <LocationCard
        id="1"
        slug="truth-coffee"
        name="Truth Coffee"
        category="Coffee Shop"
        neighborhood="CBD"
        description="Steampunk-themed coffee roastery serving exceptional artisan coffee in a unique industrial setting."
        image={coffeeImage}
        tags={["Specialty Coffee", "Brunch", "Instagram Worthy"]}
      />
    </div>
  )
}
