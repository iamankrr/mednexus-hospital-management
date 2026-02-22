import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LabCard from '../components/LabCard';
import { FaFlask, FaSearch } from 'react-icons/fa';
import Footer from '../components/Footer';

const Labs = () => {
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    getUserLocation();
  }, []);

  useEffect(() => {
    if (userLocation !== null) {
      fetchLabs();
    } else {
      const timer = setTimeout(() => {
        if (!userLocation) {
          fetchLabs();
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [userLocation]);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          console.log('📍 Location obtained:', position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.log('📍 Location denied or unavailable');
          setUserLocation(null);
        }
      );
    } else {
      setUserLocation(null);
    }
  };

  const fetchLabs = async () => {
    try {
      setLoading(true);
      console.log('Fetching all labs...');
      
      const params = {};
      if (userLocation) {
        params.lat = userLocation.lat;
        params.lng = userLocation.lng;
      }

      const response = await axios.get('http://localhost:3000/api/labs', { params });
      
      console.log('Labs response:', response.data);
      
      if (response.data?.data) {
        const normalized = response.data.data.map(l => ({
          ...l,
          id: l._id || l.id
        }));
        setLabs(normalized);
        console.log('✅ Labs loaded:', normalized.length);
      }
    } catch (error) {
      console.error('Fetch labs error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLabs = labs.filter(lab =>
    lab.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lab.address?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lab.address?.state?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading labs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <FaFlask className="text-4xl text-purple-600" />
              <h1 className="text-4xl font-bold text-gray-900">All Diagnostic Labs</h1>
            </div>
            <p className="text-gray-600">Find the best diagnostic labs near you</p>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-2xl mx-auto">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search labs by name, city or state..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-4">
            <p className="text-gray-600">
              Showing <strong>{filteredLabs.length}</strong> lab{filteredLabs.length !== 1 ? 's' : ''}
              {filteredLabs[0]?.distance !== undefined && ' (sorted by distance)'}
            </p>
          </div>

          {/* Lab Grid */}
          {filteredLabs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLabs.map((lab) => (
                <LabCard key={lab.id} lab={lab} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FaFlask className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">No labs found</p>
              <p className="text-gray-400 text-sm">Try a different search term</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Labs;