import { useEffect, useRef, useState, useCallback } from 'react';
import { GoogleMap } from '@capacitor/google-maps';

interface MapConfig {
  center: { lat: number; lng: number };
  zoom: number;
}

interface Marker {
  coordinate: { lat: number; lng: number };
  title?: string;
  snippet?: string;
  iconUrl?: string;
  iconSize?: { width: number; height: number };
}

export const useCapacitorMap = (config: MapConfig) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<GoogleMap | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [markers, setMarkers] = useState<string[]>([]);

  const createMap = useCallback(async () => {
    if (!mapRef.current) return;

    try {
      const newMap = await GoogleMap.create({
        id: 'capacitor-google-map',
        element: mapRef.current,
        apiKey: await getApiKey(),
        config: {
          center: config.center,
          zoom: config.zoom,
          androidLiteMode: false,
          disableDefaultUI: true,
          zoomControl: true,
          gestureHandling: 'greedy',
          styles: [
            {
              featureType: 'poi.business',
              stylers: [{ visibility: 'off' }],
            },
            {
              featureType: 'poi.medical',
              stylers: [{ visibility: 'off' }],
            },
            {
              featureType: 'poi.place_of_worship',
              stylers: [{ visibility: 'off' }],
            },
          ],
        },
      });

      setMap(newMap);
      setIsLoaded(true);
    } catch (error) {
      console.error('Error creating map:', error);
    }
  }, [config]);

  const getApiKey = async (): Promise<string> => {
    try {
      // Get API key from Supabase function
      const response = await fetch('/api/google-maps-key');
      const data = await response.json();
      return data.apiKey || 'AIzaSyBFw0Qbyq9zTFTd-tUY6dQTl0JiXk-JvJ0';
    } catch (error) {
      console.error('Error getting API key:', error);
      return 'AIzaSyBFw0Qbyq9zTFTd-tUY6dQTl0JiXk-JvJ0';
    }
  };

  const addMarker = useCallback(async (marker: Marker): Promise<string> => {
    if (!map) return '';

    try {
      const markerId = await map.addMarker({
        coordinate: marker.coordinate,
        title: marker.title,
        snippet: marker.snippet,
      });

      setMarkers(prev => [...prev, markerId]);
      return markerId;
    } catch (error) {
      console.error('Error adding marker:', error);
      return '';
    }
  }, [map]);

  const removeMarker = useCallback(async (markerId: string) => {
    if (!map) return;

    try {
      await map.removeMarker(markerId);
      setMarkers(prev => prev.filter(id => id !== markerId));
    } catch (error) {
      console.error('Error removing marker:', error);
    }
  }, [map]);

  const clearMarkers = useCallback(async () => {
    if (!map) return;

    try {
      // Remove all markers
      for (const markerId of markers) {
        await map.removeMarker(markerId);
      }
      setMarkers([]);
    } catch (error) {
      console.error('Error clearing markers:', error);
    }
  }, [map, markers]);

  const panTo = useCallback(async (coordinate: { lat: number; lng: number }, zoom?: number) => {
    if (!map) return;

    try {
      await map.setCamera({
        coordinate,
        zoom: zoom || config.zoom,
        animate: true,
      });
    } catch (error) {
      console.error('Error panning map:', error);
    }
  }, [map, config.zoom]);

  const setOnMarkerClickListener = useCallback(async (callback: (markerId: string) => void) => {
    if (!map) return;

    try {
      await map.setOnMarkerClickListener((event) => {
        callback(event.markerId);
      });
    } catch (error) {
      console.error('Error setting marker click listener:', error);
    }
  }, [map]);

  useEffect(() => {
    createMap();

    return () => {
      if (map) {
        map.destroy();
      }
    };
  }, [createMap]);

  return {
    mapRef,
    map,
    isLoaded,
    addMarker,
    removeMarker,
    clearMarkers,
    panTo,
    setOnMarkerClickListener,
  };
};