import React, { createContext, useState, useContext, useEffect } from 'react';

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [userAddress, setUserAddress] = useState('Detecting location...');
  const [loading, setLoading] = useState(false);

  const getAddressFromCoordinates = async (lat, lng) => {
    try {
      console.log('🔍 Getting address for:', lat, lng);

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en',
            'User-Agent': 'HospitalFinder/1.0'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch address');
      }

      const data = await response.json();
      console.log('📍 Address data:', data);

      if (data && data.address) {
        const addr = data.address;
        const parts = [];

        const area =
          addr.suburb ||
          addr.neighbourhood ||
          addr.road ||
          addr.residential ||
          addr.quarter;

        const city =
          addr.city ||
          addr.town ||
          addr.village ||
          addr.county ||
          addr.state_district;

        if (area) parts.push(area);
        if (city && city !== area) parts.push(city);

        const finalAddress =
          parts.join(', ') ||
          data.display_name?.split(',').slice(0, 2).join(',') ||
          'Location detected';

        console.log('✅ Final address:', finalAddress);
        return finalAddress;
      }

      return 'Location detected';
    } catch (error) {
      console.error('❌ Error getting address:', error);
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  };

  const autoDetectLocation = () => {
    if (!navigator.geolocation) {
      setUserAddress('Location not available');
      return;
    }

    console.log('🔄 Auto detecting location on page load...');
    setLoading(true);
    setUserAddress('Detecting location...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        console.log('✅ Auto detected:', position.coords);

        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };

        setUserLocation(location);
        localStorage.setItem('userLocation', JSON.stringify(location));

        const address = await getAddressFromCoordinates(
          location.latitude,
          location.longitude
        );

        setUserAddress(address);
        localStorage.setItem('userAddress', address);
        setLoading(false);
      },
      (error) => {
        console.log('⚠️ Auto detect failed:', error.message);
        setLoading(false);
        setUserAddress('Set your location');
        // Silent fail on auto detect
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const getUserLocation = () => {
    console.log('🔄 Manual location detection...');

    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      setUserAddress('Location not available');
      return;
    }

    setLoading(true);
    setUserAddress('Detecting location...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        console.log('✅ Got coordinates:', position.coords);

        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };

        setUserLocation(location);
        localStorage.setItem('userLocation', JSON.stringify(location));

        const address = await getAddressFromCoordinates(
          location.latitude,
          location.longitude
        );

        setUserAddress(address);
        localStorage.setItem('userAddress', address);
        setLoading(false);
      },
      (error) => {
        console.error('❌ Location error:', error.code, error.message);
        setLoading(false);

        switch (error.code) {
          case 1:
            alert(
              'Location access denied!\n\nTo enable:\n1. Click 🔒 in address bar\n2. Allow location\n3. Refresh page'
            );
            setUserAddress('Location denied');
            break;
          case 2:
            alert('Unable to detect location. Check GPS/WiFi.');
            setUserAddress('Location unavailable');
            break;
          case 3:
            alert('Location timeout. Please try again.');
            setUserAddress('Location timeout');
            break;
          default:
            alert('Error detecting location.');
            setUserAddress('Set your location');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  };

  // ✅ Auto detect on page load
  useEffect(() => {
    const savedLocation = localStorage.getItem('userLocation');
    const savedAddress = localStorage.getItem('userAddress');

    if (savedLocation && savedAddress) {
      // Use saved location
      try {
        setUserLocation(JSON.parse(savedLocation));
        setUserAddress(savedAddress);
        console.log('✅ Loaded saved location:', savedAddress);
      } catch (e) {
        // Corrupt data - detect fresh
        autoDetectLocation();
      }
    } else {
      // No saved location - auto detect
      autoDetectLocation();
    }
  }, []);

  return (
    <LocationContext.Provider
      value={{
        userLocation,
        userAddress,
        getUserLocation,
        loading
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

export default LocationContext;