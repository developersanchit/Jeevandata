import { useState, useEffect } from 'react';

// Default to Connaught Place, New Delhi for hackathon demo
const DEFAULT_LAT = 28.6304;
const DEFAULT_LNG = 77.2177;

let cachedLocation: { lat: number; lng: number } | null = null;

export function useGeolocation() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(cachedLocation);
  const [loading, setLoading] = useState<boolean>(cachedLocation === null);
  const [error] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState<boolean>(cachedLocation !== null);

  useEffect(() => {
    if (cachedLocation) {
      setLocation(cachedLocation);
      setUsingFallback(true);
      setLoading(false);
      return;
    }

    const timer = setTimeout(() => {
      const loc = { lat: DEFAULT_LAT, lng: DEFAULT_LNG };
      cachedLocation = loc;
      setLocation(loc);
      setUsingFallback(true);
      setLoading(false);
    }, 350); // Snappy simulated location lookup

    return () => clearTimeout(timer);
  }, []);

  return { location, loading, error, usingFallback };
}
