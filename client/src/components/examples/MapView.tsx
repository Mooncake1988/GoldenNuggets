import MapView from '../MapView'

export default function MapViewExample() {
  const sampleLocations = [
    { id: "1", name: "Truth Coffee", lat: -33.9249, lng: 18.4241, category: "Coffee Shop" },
    { id: "2", name: "The Test Kitchen", lat: -33.9249, lng: 18.4341, category: "Restaurant" },
    { id: "3", name: "Camps Bay Beach", lat: -33.9503, lng: 18.3773, category: "Beach" },
  ];

  return <MapView locations={sampleLocations} height="500px" />
}
