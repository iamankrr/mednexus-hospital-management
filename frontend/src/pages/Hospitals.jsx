import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import axios from 'axios';
import HospitalCard from '../components/HospitalCard';
import { FaHospital, FaSearch } from 'react-icons/fa';
import Footer from '../components/Footer';
import API_URL from '../config/api';

const Hospitals = () => {
  const [hospitals, setHospitals] = useState(() => {
    const cached = sessionStorage.getItem('hospitalsData');
    return cached ? JSON.parse(cached) : [];
  });

  const [loading, setLoading] = useState(() => {
    return sessionStorage.getItem('hospitalsData') ? false : true;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [userLocation, setUserLocation] = useState(null);

  // Ref to track if location has been fetched (avoid duplicate calls)
  const locationFetchedRef = useRef(false);

  // Restore scroll position after data loads
  useLayoutEffect(() => {
    if (!loading && hospitals.length > 0) {
      const savedScroll = sessionStorage.getItem('hospitalsScroll');
      if (savedScroll) {
        window.scrollTo({ top: parseInt(savedScroll, 10), behavior: 'instant' });
      }
    }
  }, [loading, hospitals.length]);

  // Save scroll position on scroll
  useEffect(() => {
    const handleScroll = () => {
      sessionStorage.setItem('hospitalsScroll', window.scrollY.toString());
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // On mount: always get location first, then fetch hospitals
  useEffect(() => {
    getUserLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(loc);
          locationFetchedRef.current = true;
          fetchHospitalsWithLocation(loc); // ✅ Location directly pass
        },
        (error) => {
          // Permission denied or error — fetch without location
          console.warn('Geolocation error:', error.message);
          locationFetchedRef.current = true;
          fetchHospitalsWithLocation(null);
        },
        {
          timeout: 8000,       // ✅ 8s timeout (desktop browsers slow hote hain)
          maximumAge: 60000,   // 1 min cached location OK hai
          enableHighAccuracy: false,
        }
      );
    } else {
      // Geolocation not supported
      locationFetchedRef.current = true;
      fetchHospitalsWithLocation(null);
    }
  };

  // ✅ Takes location as parameter — no stale closure issue
  const fetchHospitalsWithLocation = async (location) => {
    try {
      // Show loading only when no cached data exists
      setLoading(() => {
        const cached = sessionStorage.getItem('hospitalsData');
        return !cached;
      });

      const params = {};
      if (location) {
        params.latitude = location.lat;
        params.longitude = location.lng;
      }

      const response = await axios.get(`${API_URL}/api/hospitals`, { params });

      if (response.data?.data) {
        const normalized = response.data.data.map((h) => ({
          ...h,
          id: h._id || h.id,
        }));
        setHospitals(normalized);
        sessionStorage.setItem('hospitalsData', JSON.stringify(normalized));
      }
    } catch (error) {
      console.error('Fetch hospitals error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredHospitals = hospitals.filter(
    (hospital) =>
      hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hospital.address?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hospital.address?.state?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading hospitals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <FaHospital className="text-4xl text-blue-600" />
              <h1 className="text-4xl font-bold text-gray-900">All Hospitals</h1>
            </div>
            <p className="text-gray-600">Find the best hospitals near you</p>
          </div>

          <div className="mb-6">
            <div className="relative max-w-2xl mx-auto">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search hospitals by name, city or state..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mb-4">
            <p className="text-gray-600">
              Showing <strong>{filteredHospitals.length}</strong> hospital
              {filteredHospitals.length !== 1 ? 's' : ''}
            </p>
          </div>

          {filteredHospitals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredHospitals.map((hospital) => (
                <HospitalCard key={hospital.id} hospital={hospital} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FaHospital className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">No hospitals found</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Hospitals;