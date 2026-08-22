import { useState, useEffect } from 'react';

// Default to Connaught Place, New Delhi for hackathon demo
const DEFAULT_LAT = 28.6304;
const DEFAULT_LNG = 77.2177;

export function useGeolocation() {
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLocation({ lat: DEFAULT_LAT, lng: DEFAULT_LNG });
      setUsingFallback(true);
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        setLoading(false);
      },
      (err) => {
        console.warn(`Geolocation Error (${err.code}): ${err.message}`);
        setError('Could not get your location. Using default location.');
        setLocation({ lat: DEFAULT_LAT, lng: DEFAULT_LNG });
        setUsingFallback(true);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  return { location, loading, error, usingFallback };
}
