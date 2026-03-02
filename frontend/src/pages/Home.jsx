import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import API_URL from '../config/api'; 
import HospitalCard from '../components/HospitalCard';
import LabCard from '../components/LabCard';
import { hospitalAPI, labAPI } from '../services/api';
import { FaHospital, FaFlask, FaHeart } from 'react-icons/fa'; 
import { useLocation } from '../context/LocationContext'; // ✅ Context used for single source of truth
import CompareBar from '../components/CompareBar';
import AdvancedFilterPanel from '../components/AdvancedFilterPanel';
import KeywordSearch from '../components/KeywordSearch';
import Footer from '../components/Footer'; 

const Home = () => {
  const navigate = useNavigate();
  const { userLocation } = useLocation(); // ✅ Location obtained directly from Context
  
  const [hospitals, setHospitals] = useState([]);
  const [labs, setLabs] = useState([]);
  const [filteredHospitals, setFilteredHospitals] = useState([]);
  const [filteredLabs, setFilteredLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // ✅ PERSISTENCE: Load active tab from sessionStorage
  const [activeTab, setActiveTab] = useState(() => {
    return sessionStorage.getItem('mednexus_active_tab') || 'hospitals';
  });
  
  const [favorites, setFavorites] = useState({
    hospitals: [],
    laboratories: []
  });

  const [filters, setFilters] = useState({
    state: '', city: '', keyword: '', pincode: '', type: 'all',
    minPrice: '', maxPrice: '', minRating: '', emergency: false,
  });

  const [quickSearchKeyword, setQuickSearchKeyword] = useState('');

  // ✅ Tab Change Handler
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    sessionStorage.setItem('mednexus_active_tab', tab);
  };

  const fetchFavorites = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await axios.get(`${API_URL}/api/favorites`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setFavorites(response.data.data || { hospitals: [], laboratories: [] });
    } catch (error) {
      console.log('Favorites fetch skipped');
    }
  };

  const fetchHospitals = useCallback(async () => {
    try {
      setLoading(true);
      const params = { ...filters };
      if (userLocation) {
        params.lat = userLocation.lat;
        params.lng = userLocation.lng;
      }
      const response = await hospitalAPI.getAll(params);
      const dataArray = response?.data?.data || response?.data || [];
      setHospitals(dataArray.map(h => ({ ...h, id: h._id || h.id })));
    } catch (error) {
      console.error('Error fetching hospitals:', error);
    } finally {
      setLoading(false);
    }
  }, [userLocation, filters]);

  const fetchLabs = useCallback(async () => {
    try {
      const params = { ...filters };
      if (userLocation) {
        params.lat = userLocation.lat;
        params.lng = userLocation.lng;
      }
      const response = await labAPI.getAll(params);
      const labsData = Array.isArray(response.data) ? response.data : (response.data.data || []);
      setLabs(labsData.map(l => ({ ...l, id: l._id || l.id })));
    } catch (error) {
      console.error('Error fetching labs:', error);
    }
  }, [userLocation, filters]);

  useEffect(() => {
    fetchFavorites();
  }, []);

  useEffect(() => {
    fetchHospitals();
    fetchLabs();
  }, [fetchHospitals, fetchLabs]);

  // ✅ FULL FILTER LOGIC (No features removed)
  useEffect(() => {
    const applyFilters = () => {
      let filtered = activeTab === 'hospitals' ? [...hospitals] : [...labs];
      const searchKeyword = quickSearchKeyword || filters.keyword;

      if (searchKeyword) {
        filtered = filtered.filter(item =>
          item.name?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
          item.facilities?.some(f => f.toLowerCase().includes(searchKeyword.toLowerCase())) ||
          item.type?.toLowerCase().includes(searchKeyword.toLowerCase())
        );
      }

      if (filters.state) {
        filtered = filtered.filter(item => item.address?.state?.toLowerCase() === filters.state.toLowerCase());
      }

      if (filters.city) {
        filtered = filtered.filter(item => item.address?.city?.toLowerCase() === filters.city.toLowerCase());
      }

      if (filters.pincode) {
        filtered = filtered.filter(item => item.address?.pincode === filters.pincode);
      }

      if (activeTab === 'hospitals' && filters.type && filters.type !== 'all') {
        filtered = filtered.filter(item => item.type === filters.type);
      }

      if (filters.minPrice || filters.maxPrice) {
        filtered = filtered.filter(item => {
          const prices = item.services?.map(s => s.price) || [];
          if (prices.length === 0) return false;
          const minServicePrice = Math.min(...prices);
          if (filters.minPrice && minServicePrice < parseFloat(filters.minPrice)) return false;
          if (filters.maxPrice && minServicePrice > parseFloat(filters.maxPrice)) return false;
          return true;
        });
      }

      if (filters.minRating) {
        filtered = filtered.filter(item => (item.googleRating || item.websiteRating || 0) >= parseFloat(filters.minRating));
      }

      if (filters.emergency) {
        filtered = filtered.filter(item => item.emergencyAvailable === true);
      }

      activeTab === 'hospitals' ? setFilteredHospitals(filtered) : setFilteredLabs(filtered);
    };

    applyFilters();
  }, [hospitals, labs, filters, quickSearchKeyword, activeTab]);

  const handleToggleFavorite = async (facilityId, facilityType) => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    try {
      const isFavorite = facilityType === 'hospital'
        ? favorites.hospitals?.some(h => (h._id || h) === facilityId)
        : favorites.laboratories?.some(l => (l._id || l) === facilityId);

      const endpoint = isFavorite ? '/api/favorites/remove' : '/api/favorites/add';
      const response = await axios.post(`${API_URL}${endpoint}`, 
        { facilityId, facilityType },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setFavorites(response.data.data || { hospitals: [], laboratories: [] });
    } catch (error) { alert('Failed to update favorites'); }
  };

  if (loading && hospitals.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto"></div>
          <p className="text-gray-600 mt-4">Finding nearest facilities...</p>
        </div>
      </div>
    );
  }

  const displayHospitals = filteredHospitals.length > 0 ? filteredHospitals : hospitals;
  const displayLabs = filteredLabs.length > 0 ? filteredLabs : labs;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-10 text-center">
        <h1 className="text-4xl font-bold mb-2">MedNexus</h1>
        <p className="text-xl mb-6">Find hospitals and labs near you instantly.</p>
        <div className="max-w-2xl mx-auto px-4">
          <KeywordSearch
            value={quickSearchKeyword}
            onChange={setQuickSearchKeyword}
            onSearch={() => fetchHospitals()}
            placeholder="Search hospitals, labs, tests..."
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 flex-grow">
        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => handleTabChange('hospitals')}
            className={`flex items-center gap-2 px-6 py-3 font-semibold transition ${activeTab === 'hospitals' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
          >
            <FaHospital /> Hospitals ({displayHospitals.length})
          </button>
          <button
            onClick={() => handleTabChange('labs')}
            className={`flex items-center gap-2 px-6 py-3 font-semibold transition ${activeTab === 'labs' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
          >
            <FaFlask /> Laboratories ({displayLabs.length})
          </button>
        </div>

        <AdvancedFilterPanel onApplyFilters={setFilters} initialFilters={filters} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTab === 'hospitals' ? (
            displayHospitals.map(h => (
              <div key={h.id} className="relative">
                <button onClick={() => handleToggleFavorite(h.id, 'hospital')} className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-md">
                  <FaHeart className={favorites.hospitals?.some(fav => (fav._id || fav) === h.id) ? 'text-red-500' : 'text-gray-400'} />
                </button>
                <HospitalCard hospital={h} />
              </div>
            ))
          ) : (
            displayLabs.map(l => (
              <div key={l.id} className="relative">
                <button onClick={() => handleToggleFavorite(l.id, 'laboratory')} className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-md">
                  <FaHeart className={favorites.laboratories?.some(fav => (fav._id || fav) === l.id) ? 'text-red-500' : 'text-gray-400'} />
                </button>
                <LabCard lab={l} />
              </div>
            ))
          )}
        </div>
      </div>
      <CompareBar />
      <Footer />
    </div>
  );
};

export default Home;