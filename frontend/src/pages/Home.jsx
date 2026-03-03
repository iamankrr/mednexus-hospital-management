import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import API_URL from '../config/api'; 
import HospitalCard from '../components/HospitalCard';
import LabCard from '../components/LabCard';
import SkeletonCard from '../components/SkeletonCard';
import MapView from '../components/MapView'; // ✅ IMPORTED MAP VIEW
import { hospitalAPI, labAPI } from '../services/api';
import { FaSearch, FaMapMarkerAlt, FaHospital, FaFlask, FaFilter, FaHeart, FaListUl, FaMap } from 'react-icons/fa'; 
import { useLocation } from '../context/LocationContext';
import CompareBar from '../components/CompareBar';
import AdvancedFilterPanel from '../components/AdvancedFilterPanel';
import KeywordSearch from '../components/KeywordSearch';
import Footer from '../components/Footer'; 
import toast from 'react-hot-toast'; 

const Home = () => {
  const navigate = useNavigate();
  const { locationName } = useLocation(); 
  
  // ✅ STATE FOR MAP TOGGLE
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'

  const [hospitals, setHospitals] = useState(() => {
    const cached = sessionStorage.getItem('homeHospitalsData');
    return cached ? JSON.parse(cached) : [];
  });
  
  const [labs, setLabs] = useState(() => {
    const cached = sessionStorage.getItem('homeLabsData');
    return cached ? JSON.parse(cached) : [];
  });

  const [filteredHospitals, setFilteredHospitals] = useState([]);
  const [filteredLabs, setFilteredLabs] = useState([]);
  
  const [loading, setLoading] = useState(() => {
    return (sessionStorage.getItem('homeHospitalsData') || sessionStorage.getItem('homeLabsData')) ? false : true;
  });
  
  const [activeTab, setActiveTab] = useState(() => {
    return sessionStorage.getItem('mednexus_active_tab') || 'hospitals';
  });
  
  const [favorites, setFavorites] = useState({
    hospitals: [],
    laboratories: []
  });

  const [userLocation, setUserLocation] = useState(() => {
    const savedLocation = sessionStorage.getItem('mednexus_user_location');
    return savedLocation ? JSON.parse(savedLocation) : null;
  });
  
  const [locationRequested, setLocationRequested] = useState(!!userLocation);

  const [filters, setFilters] = useState({
    state: '', city: '', keyword: '', pincode: '', type: 'all',
    minPrice: '', maxPrice: '', minRating: '', emergency: false,
  });

  const [quickSearchKeyword, setQuickSearchKeyword] = useState('');

  // ✅ Updated Scroll Logic to only run on 'list' view
  useLayoutEffect(() => {
    if (!loading && (hospitals.length > 0 || labs.length > 0) && viewMode === 'list') {
      const savedScroll = sessionStorage.getItem('homeScroll');
      if (savedScroll) {
        window.scrollTo({ top: parseInt(savedScroll, 10), behavior: 'instant' });
      }
    }
  }, [loading, hospitals.length, labs.length, viewMode]);

  useEffect(() => {
    const handleScroll = () => {
      if (viewMode === 'list') {
        sessionStorage.setItem('homeScroll', window.scrollY.toString());
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [viewMode]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    sessionStorage.setItem('mednexus_active_tab', tab);
  };

  useEffect(() => {
    if (!locationRequested && navigator.geolocation) {
      setLocationRequested(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = { lat: position.coords.latitude, lng: position.coords.longitude };
          setUserLocation(location);
          sessionStorage.setItem('mednexus_user_location', JSON.stringify(location));
        },
        (error) => {
          setUserLocation(null);
          setLoading(false);
        }
      );
    } else if (!userLocation && hospitals.length === 0) {
        setLoading(false);
    }
  }, [locationRequested, userLocation, hospitals.length]);

  useEffect(() => {
    fetchFavorites();
  }, []);

  useEffect(() => {
    const cachedLat = sessionStorage.getItem('mednexus_cached_lat');
    const currentLat = userLocation ? String(userLocation.lat) : null;

    if (locationRequested) {
      if (hospitals.length === 0 && labs.length === 0) {
          fetchHospitals();
          fetchLabs();
      } else if (currentLat && cachedLat !== currentLat) {
          fetchHospitals();
          fetchLabs();
      }
    }
  }, [userLocation, locationRequested]);

  useEffect(() => {
    applyFilters();
  }, [hospitals, labs, filters, quickSearchKeyword, activeTab]);

  const fetchFavorites = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await axios.get(`${API_URL}/api/favorites`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setFavorites(response.data.data || { hospitals: [], laboratories: [] });
    } catch (error) {}
  };

  const fetchHospitals = async () => {
    try {
      if (hospitals.length === 0) setLoading(true);
      const params = { ...filters };
      if (userLocation) {
        params.lat = userLocation.lat;
        params.lng = userLocation.lng;
        sessionStorage.setItem('mednexus_cached_lat', String(userLocation.lat));
      }

      const response = await hospitalAPI.getAll(params);
      const dataArray = response?.data?.data || response?.data || [];

      if (dataArray) {
        const normalizedHospitals = dataArray.map(hospital => ({
          ...hospital, id: hospital._id || hospital.id
        }));
        setHospitals(normalizedHospitals);
        sessionStorage.setItem('homeHospitalsData', JSON.stringify(normalizedHospitals));
      }
    } catch (error) {
      console.error('Error fetching hospitals:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLabs = async () => {
    try {
      const params = { ...filters };
      if (userLocation) {
        params.lat = userLocation.lat;
        params.lng = userLocation.lng;
      }

      const response = await labAPI.getAll(params);
      if (response?.data) {
        const labsData = Array.isArray(response.data) ? response.data : (response.data.data || []);
        const normalizedLabs = labsData.map(lab => ({
          ...lab, id: lab._id || lab.id
        }));
        setLabs(normalizedLabs);
        sessionStorage.setItem('homeLabsData', JSON.stringify(normalizedLabs));
      }
    } catch (error) {}
  };

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
      filtered = filtered.filter(item =>
        item.address?.state?.toLowerCase() === filters.state.toLowerCase()
      );
    }

    if (filters.city) {
      filtered = filtered.filter(item =>
        item.address?.city?.toLowerCase() === filters.city.toLowerCase()
      );
    }

    if (filters.pincode) {
      filtered = filtered.filter(item =>
        item.address?.pincode === filters.pincode
      );
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
      filtered = filtered.filter(item =>
        (item.googleRating || item.websiteRating || 0) >= parseFloat(filters.minRating)
      );
    }

    if (filters.emergency) {
      filtered = filtered.filter(item => item.emergencyAvailable === true);
    }

    if (activeTab === 'hospitals') {
      setFilteredHospitals(filtered);
    } else {
      setFilteredLabs(filtered);
    }
  };

  const handleAdvancedFilters = (newFilters) => {
    setFilters(newFilters);
  };

  const handleQuickSearch = () => {
    applyFilters();
  };

  const handleToggleFavorite = async (facilityId, facilityType) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to add favorites'); 
      navigate('/login');
      return;
    }

    try {
      const isFavorite = facilityType === 'hospital'
        ? favorites.hospitals?.some(h => {
            const id = typeof h === 'string' ? h : h._id;
            return id === facilityId;
          })
        : favorites.laboratories?.some(l => {
            const id = typeof l === 'string' ? l : l._id;
            return id === facilityId;
          });

      const endpoint = isFavorite ? '/api/favorites/remove' : '/api/favorites/add';

      const response = await axios.post(
        `${API_URL}${endpoint}`,
        { facilityId, facilityType },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      setFavorites(response.data.data || response.data.favorites || { hospitals: [], laboratories: [] });
      
      if (isFavorite) {
        toast.success('Removed from favorites');
      } else {
        toast.success('Added to favorites!');
      }

    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update favorites'); 
    }
  };

  const displayHospitals = filteredHospitals.length > 0 ? filteredHospitals : hospitals;
  const displayLabs = filteredLabs.length > 0 ? filteredLabs : labs;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="text-4xl">🏥</span>
            <h1 className="text-4xl font-bold">MedNexus</h1>
          </div>
          <p className="text-xl mb-1 font-semibold">The smarter way to choose your care</p>
          <p className="text-base mb-6 text-blue-100">
            Find hospitals and diagnostic labs near you. Book appointments instantly.
          </p>
          
          <div className="flex justify-center gap-8 mb-6">
            <div>
              <p className="text-2xl font-bold">{hospitals.length}</p>
              <p className="text-sm text-blue-100">Hospitals</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{labs.length}</p>
              <p className="text-sm text-blue-100">Diagnostic Labs</p>
            </div>
            <div className="flex items-center gap-2">
              <img 
                src="https://upload.wikimedia.org/wikipedia/en/thumb/4/41/Flag_of_India.svg/320px-Flag_of_India.svg.png" 
                alt="India" 
                className="h-6 w-8 object-cover rounded"
              />
              <div>
                <p className="text-2xl font-bold">Covered</p>
                <p className="text-sm text-blue-100">Pan-India</p>
              </div>
            </div>
          </div>

          <div className="max-w-2xl mx-auto mt-6">
            <KeywordSearch
              value={quickSearchKeyword}
              onChange={setQuickSearchKeyword}
              onSearch={handleQuickSearch}
              placeholder="Search hospitals, labs, tests, specialists..."
              data={[...hospitals, ...labs]}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 flex-grow">
        
        {/* ✅ STICKY WRAPPER START */}
        <div className="sticky top-0 z-40 bg-gray-50/95 backdrop-blur-md pt-2 pb-4 mb-6 border-b border-gray-200/50 shadow-sm -mx-4 px-4 sm:mx-0 sm:px-0">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 border-b border-gray-200 pb-2">
            {/* Tabs */}
            <div className="flex gap-4">
              <button
                onClick={() => handleTabChange('hospitals')}
                className={`flex items-center gap-2 px-4 py-2 font-semibold transition ${
                  activeTab === 'hospitals'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <FaHospital /> Hospitals ({displayHospitals.length})
              </button>
              <button
                onClick={() => handleTabChange('labs')}
                className={`flex items-center gap-2 px-4 py-2 font-semibold transition ${
                  activeTab === 'labs'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <FaFlask /> Laboratories ({displayLabs.length})
              </button>
            </div>

            {/* ✅ MAP / LIST TOGGLE BUTTON */}
            <div className="flex items-center bg-gray-200 p-1 rounded-xl">
              <button 
                onClick={() => setViewMode('list')} 
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                  viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <FaListUl /> List
              </button>
              <button 
                onClick={() => setViewMode('map')} 
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                  viewMode === 'map' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <FaMap /> Map
              </button>
            </div>
          </div>

          <AdvancedFilterPanel
            onApplyFilters={handleAdvancedFilters}
            initialFilters={filters}
          />

          {/* ACTIVE FILTERS BADGES */}
          {(filters.state || filters.city || filters.pincode || filters.type !== 'all' || 
            filters.minPrice || filters.maxPrice || filters.minRating || filters.emergency || quickSearchKeyword) && (
            <div className="mt-4 p-3 bg-blue-50/80 rounded-xl border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-blue-800 text-sm">🔍 Active Filters:</span>
                <button
                  onClick={() => {
                    setFilters({
                      state: '', city: '', keyword: '', pincode: '', type: 'all',
                      minPrice: '', maxPrice: '', minRating: '', emergency: false
                    });
                    setQuickSearchKeyword('');
                  }}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 underline"
                >
                  Clear All
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {quickSearchKeyword && (
                  <span className="px-2 py-1 bg-white text-blue-700 rounded-full text-xs font-medium border border-blue-200">
                    Keyword: {quickSearchKeyword}
                  </span>
                )}
                {filters.state && (
                  <span className="px-2 py-1 bg-white text-blue-700 rounded-full text-xs font-medium border border-blue-200">
                    State: {filters.state}
                  </span>
                )}
                {filters.city && (
                  <span className="px-2 py-1 bg-white text-blue-700 rounded-full text-xs font-medium border border-blue-200">
                    City: {filters.city}
                  </span>
                )}
                {filters.pincode && (
                  <span className="px-2 py-1 bg-white text-blue-700 rounded-full text-xs font-medium border border-blue-200">
                    PIN: {filters.pincode}
                  </span>
                )}
                {filters.type !== 'all' && (
                  <span className="px-2 py-1 bg-white text-blue-700 rounded-full text-xs font-medium border border-blue-200">
                    Type: {filters.type}
                  </span>
                )}
                {filters.minRating && (
                  <span className="px-2 py-1 bg-white text-blue-700 rounded-full text-xs font-medium border border-blue-200">
                    Rating: {filters.minRating}+ ⭐
                  </span>
                )}
                {filters.emergency && (
                  <span className="px-2 py-1 bg-white text-blue-700 rounded-full text-xs font-medium border border-blue-200">
                    🚨 Emergency Only
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
        {/* ✅ STICKY WRAPPER END */}

        {/* ✅ CONDITIONAL RENDERING: MAP vs LIST */}
        {viewMode === 'map' ? (
          <div className="animate-fadeIn">
            {/* Render MAP VIEW */}
            <MapView 
              items={activeTab === 'hospitals' ? displayHospitals : displayLabs} 
              type={activeTab === 'hospitals' ? 'hospital' : 'laboratory'}
              userLocation={userLocation}
            />
          </div>
        ) : (
          /* Render LIST VIEW (GRID) */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10 animate-fadeIn">
            {loading && hospitals.length === 0 && labs.length === 0 ? (
              Array(6).fill(0).map((_, index) => <SkeletonCard key={index} />)
            ) : (
              <>
                {activeTab === 'hospitals' && displayHospitals.map((hospital) => {
                  const id = hospital._id || hospital.id;
                  
                  const isFav = favorites.hospitals?.some(h => {
                    const favId = typeof h === 'string' ? h : h._id;
                    return favId === id;
                  });

                  return (
                    <div key={id} className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(id, 'hospital');
                        }}
                        className="absolute top-4 right-4 z-30 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition"
                      >
                        <FaHeart className={`text-xl ${isFav ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
                      </button>
                      <HospitalCard hospital={hospital} />
                    </div>
                  );
                })}
                
                {activeTab === 'labs' && displayLabs.map((lab) => {
                  const id = lab._id || lab.id;
                  
                  const isFav = favorites.laboratories?.some(l => {
                    const favId = typeof l === 'string' ? l : l._id;
                    return favId === id;
                  });

                  return (
                    <div key={id} className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(id, 'laboratory');
                        }}
                        className="absolute top-4 right-4 z-30 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition"
                      >
                        <FaHeart className={`text-xl ${isFav ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
                      </button>
                      <LabCard lab={lab} />
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}

        {/* Empty States (Only show when not loading, in list view, and array is empty) */}
        {!loading && activeTab === 'hospitals' && displayHospitals.length === 0 && viewMode === 'list' && (
          <div className="text-center py-12">
            <FaHospital className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No hospitals found matching your filters</p>
            <button
              onClick={() => {
                setFilters({
                  state: '', city: '', keyword: '', pincode: '', type: 'all',
                  minPrice: '', maxPrice: '', minRating: '', emergency: false
                });
                setQuickSearchKeyword('');
              }}
              className="mt-4 text-blue-600 hover:text-blue-800 underline"
            >
              Clear all filters
            </button>
          </div>
        )}
        {!loading && activeTab === 'labs' && displayLabs.length === 0 && viewMode === 'list' && (
          <div className="text-center py-12">
            <FaFlask className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No laboratories found matching your filters</p>
            <button
              onClick={() => {
                setFilters({
                  state: '', city: '', keyword: '', pincode: '', type: 'all',
                  minPrice: '', maxPrice: '', minRating: '', emergency: false
                });
                setQuickSearchKeyword('');
              }}
              className="mt-4 text-blue-600 hover:text-blue-800 underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      <CompareBar />
      <Footer />
    </div>
  );
};

export default Home;