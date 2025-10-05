import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card } from './ui/card';

interface Offer {
  id: string;
  title: string;
  partner: {
    name: string;
    lat?: number;
    lng?: number;
  };
}

interface OffersMapProps {
  offers: Offer[];
  onOfferClick?: (offerId: string) => void;
}

export function OffersMap({ offers, onOfferClick }: OffersMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    const MAPBOX_TOKEN = 'pk.eyJ1IjoicGFzc2JhbGkiLCJhIjoiY204ZGlkbWxyMGtzYjJqc2p4Y2FqMTRkbyJ9.8FcHp5NafqY-g4gJ83cTuQ';
    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [115.1889, -8.3405], // Bali center
      zoom: 10,
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: false,
      }),
      'top-right'
    );

    // Cleanup function
    return () => {
      markers.current.forEach(marker => marker.remove());
      markers.current = [];
      map.current?.remove();
    };
  }, []);

  // Update markers when offers change
  useEffect(() => {
    if (!map.current) return;

    // Remove existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Filter offers with valid coordinates
    const offersWithLocation = offers.filter(
      offer => offer.partner?.lat && offer.partner?.lng
    );

    if (offersWithLocation.length === 0) return;

    // Create bounds to fit all markers
    const bounds = new mapboxgl.LngLatBounds();

    // Add markers for each offer
    offersWithLocation.forEach((offer) => {
      const { lat, lng } = offer.partner;
      
      // Create marker element
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.width = '32px';
      el.style.height = '32px';
      el.style.cursor = 'pointer';
      el.innerHTML = `
        <div style="
          width: 32px;
          height: 32px;
          background: hsl(var(--primary));
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s;
        ">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
      `;

      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.2)';
      });
      
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
      });

      el.addEventListener('click', () => {
        if (onOfferClick) {
          onOfferClick(offer.id);
        }
      });

      // Create popup
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
      }).setHTML(`
        <div style="padding: 8px;">
          <h3 style="font-weight: bold; margin-bottom: 4px; color: hsl(var(--foreground));">${offer.partner.name}</h3>
          <p style="font-size: 12px; color: hsl(var(--muted-foreground));">${offer.title}</p>
        </div>
      `);

      // Create and add marker
      const marker = new mapboxgl.Marker(el)
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(map.current!);

      markers.current.push(marker);
      bounds.extend([lng, lat]);
    });

    // Fit map to show all markers
    if (offersWithLocation.length > 0) {
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 14,
      });
    }
  }, [offers, onOfferClick]);

  return (
    <Card className="relative w-full h-[500px] overflow-hidden border-border/50">
      <div ref={mapContainer} className="absolute inset-0" />
    </Card>
  );
}
