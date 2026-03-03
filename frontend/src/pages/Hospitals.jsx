import React, { useState, useEffect, useLayoutEffect } from 'react';
import axios from 'axios';
import HospitalCard from '../components/HospitalCard';
import { FaHospital, FaSearch } from 'react-icons/fa';
import Footer from '../components/Footer';

const Hospitals = () => {
  // ✅ FIX 1: Initial state ko direct cache se load karo (Zero Loading Time)
  const [hospitals, setHospitals] = useState(() => {
    const cached = sessionStorage.getItem('hospitalsData');
    return cached ? JSON.parse(cached) : [];
  });
  
  // Agar cache hai toh loading pehle se hi false rakho
  const [loading, setLoading] = useState(() => {
    return sessionStorage.getItem('hospitalsData') ? false : true;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [userLocation, setUserLocation] = useState(null);

  // ✅ FIX 2: Instant Scroll Restoration
  useLayoutEffect(() => {
    if (!loading && hospitals.length > 0) {
      const savedScroll = sessionStorage.getItem('hospitalsScroll');
      if (savedScroll) {
        window.scrollTo({ top: parseInt(savedScroll, 10), behavior: 'instant' });
      }
    }
  }, [loading, hospitals.length]);

  // Har scroll par position save karo
  useEffect(() => {
    const handleScroll = () => {
      sessionStorage.setItem('hospitalsScroll', window.scrollY.toString());
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sirf tab location maango jab naya user aaye (cache empty ho)
  useEffect(() => {
    if (hospitals.length === 0) {
      getUserLocation();
    }
  }, []);

  // ✅ FIX 3: API call sirf tab hogi jab Cache empty hoga
  useEffect(() => {
    if (hospitals.length === 0) {
      if (userLocation !== null) {
        fetchHospitals();
      } else {
        const timer = setTimeout(() => {
          if (!userLocation) fetchHospitals();
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [userLocation]);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        },
        (error) => {
          setUserLocation(null);
        }
      );
    } else {
      setUserLocation(null);
    }
  };

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const params = {};
      if (userLocation) {
        params.lat = userLocation.lat;
        params.lng = userLocation.lng;
      }

      const response = await axios.get('http://localhost:3000/api/hospitals', { params });
      
      if (response.data?.data) {
        const normalized = response.data.data.map(h => ({ ...h, id: h._id || h.id }));
        setHospitals(normalized);
        sessionStorage.setItem('hospitalsData', JSON.stringify(normalized)); // Cache data
      }
    } catch (error) {
      console.error('Fetch hospitals error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredHospitals = hospitals.filter(hospital =>
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
              Showing <strong>{filteredHospitals.length}</strong> hospital{filteredHospitals.length !== 1 ? 's' : ''}
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