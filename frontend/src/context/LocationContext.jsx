import React, { createContext, useState, useContext, useEffect } from 'react';

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [userAddress, setUserAddress] = useState('Detecting location...');
  const [loading, setLoading] = useState(false);

  // ✅ Reverse Geocoding to get human-readable address
  const getAddressFromCoordinates = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en',
            'User-Agent': 'MedNexus/1.0'
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch address');

      const data = await response.json();

      if (data && data.address) {
        const addr = data.address;
        const parts = [];
        const area = addr.suburb || addr.neighbourhood || addr.road || addr.residential;
        const city = addr.city || addr.town || addr.village;

        if (area) parts.push(area);
        if (city && city !== area) parts.push(city);

        return parts.join(', ') || 'Location detected';
      }
      return 'Location detected';
    } catch (error) {
      console.error('❌ Address Error:', error);
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  };

  // ✅ Main logic to set location and save to storage
  const setLocationData = async (lat, lng) => {
    const location = { lat, lng }; // ✅ Standardized keys
    setUserLocation(location);
    localStorage.setItem('userLocation', JSON.stringify(location));

    const address = await getAddressFromCoordinates(lat, lng);
    setUserAddress(address);
    localStorage.setItem('userAddress', address);
    setLoading(false);
  };

  // ✅ Manual or Auto Detection
  const getUserLocation = (isAuto = false) => {
    if (!navigator.geolocation) {
      setUserAddress('Location not available');
      return;
    }

    if (!isAuto) setLoading(true);
    setUserAddress('Detecting location...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        await setLocationData(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        console.log('⚠️ Location Detection Failed:', error.message);
        setLoading(false);
        if (!isAuto) alert('Please enable location permissions in your browser.');
        setUserAddress('Set your location');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  // ✅ Initial Load Logic
  useEffect(() => {
    const savedLocation = localStorage.getItem('userLocation');
    const savedAddress = localStorage.getItem('userAddress');

    if (savedLocation && savedAddress) {
      try {
        setUserLocation(JSON.parse(savedLocation));
        setUserAddress(savedAddress);
      } catch (e) {
        getUserLocation(true);
      }
    } else {
      getUserLocation(true);
    }
  }, []);

  return (
    <LocationContext.Provider value={{ userLocation, userAddress, getUserLocation, loading }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) throw new Error('useLocation must be used within a LocationProvider');
  return context;
};

export default LocationContext;