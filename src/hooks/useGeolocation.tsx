import { useState, useEffect } from 'react';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    console.log('🗺️ Géolocalisation: Initialisation...');
    
    if (!navigator.geolocation) {
      console.error('🗺️ Géolocalisation non supportée');
      setState(prev => ({
        ...prev,
        error: 'Géolocalisation non supportée par ce navigateur',
        loading: false,
      }));
      return;
    }

    const handleSuccess = (position: GeolocationPosition) => {
      console.log('🗺️ Géolocalisation: Succès!', {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy
      });
      setState({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        error: null,
        loading: false,
      });
    };

    const handleError = (error: GeolocationPositionError) => {
      let errorMessage = 'Erreur de géolocalisation';
      
      console.error('🗺️ Géolocalisation: Erreur!', {
        code: error.code,
        message: error.message
      });
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Permission de géolocalisation refusée';
          console.error('🗺️ Permission refusée par l\'utilisateur');
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Position non disponible';
          console.error('🗺️ Position non disponible');
          break;
        case error.TIMEOUT:
          errorMessage = 'Délai de géolocalisation dépassé';
          console.error('🗺️ Timeout dépassé');
          break;
      }

      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));
    };

    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000, // 5 minutes
    });
  }, []);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  return {
    ...state,
    calculateDistance,
  };
}