import { useEffect, useRef } from "react";

declare global {
  interface Window {
    L: any;
  }
}

interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
  category: string;
}

interface MapViewProps {
  locations: Location[];
  height?: string;
}

export default function MapView({ locations, height = "70vh" }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || !window.L) return;

    if (!mapInstanceRef.current) {
      const map = window.L.map(mapRef.current).setView([-33.9249, 18.4241], 12);

      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    
    const markers: any[] = [];
    locations.forEach((location) => {
      const marker = window.L.marker([location.lat, location.lng]).addTo(map);
      marker.bindPopup(`<strong>${location.name}</strong><br/>${location.category}`);
      markers.push(marker);
    });

    return () => {
      markers.forEach(marker => marker.remove());
    };
  }, [locations]);

  return (
    <div
      ref={mapRef}
      style={{ height }}
      className="w-full rounded-lg border"
      data-testid="map-container"
    />
  );
}
