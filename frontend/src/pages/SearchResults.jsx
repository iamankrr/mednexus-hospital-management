import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import HospitalCard from '../components/HospitalCard';
import FilterPanel from '../components/FilterPanel';
import Loader from '../components/Loader';
import { hospitalAPI } from '../services/api';
import { useLocation as useUserLocation } from '../context/LocationContext';
import { calculateDistance } from '../utils/distance';
import { FaArrowLeft } from 'react-icons/fa';

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchData = location.state || {};
  const { userLocation } = useUserLocation();

  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('nearest');
  const [filters, setFilters] = useState({
    minRating: 0,
    maxDistance: 50,
    emergencyOnly: false,
    selectedFacilities: [],
    minBudget: 0,
    maxBudget: 10000,
    selectedSpecializations: []
  });

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await hospitalAPI.getAll();

      if (response.data.success) {
        let hospitalsData = response.data.data || [];

        // Apply manual location filter (State → District → City)
        if (searchData.manualLocation) {
          const { state, district, city } = searchData.manualLocation;
          
          hospitalsData = hospitalsData.filter(hospital => {
            // State filter (required)
            if (state && hospital.address?.state !== state) {
              return false;
            }
            
            // District filter (if selected)
            if (district && hospital.address?.city !== district) {
              return false;
            }
            
            // City/Area filter (if selected)
            if (city && hospital.address?.area !== city) {
              return false;
            }
            
            return true;
          });
        }

        // Apply pin code filter
        if (searchData.pinCode) {
          hospitalsData = hospitalsData.filter(hospital =>
            hospital.address?.pincode === searchData.pinCode
          );
        }

        // Apply text search filters
        if (searchData.query) {
          const query = searchData.query.toLowerCase();
          hospitalsData = hospitalsData.filter(hospital =>
            hospital.name.toLowerCase().includes(query) ||
            hospital.address?.city?.toLowerCase().includes(query) ||
            hospital.address?.area?.toLowerCase().includes(query)
          );
        }

        // Apply location filter
        if (searchData.location) {
          const location = searchData.location.toLowerCase();
          hospitalsData = hospitalsData.filter(hospital =>
            hospital.address?.city?.toLowerCase().includes(location) ||
            hospital.address?.area?.toLowerCase().includes(location) ||
            hospital.address?.state?.toLowerCase().includes(location)
          );
        }

        // Calculate distance if user location available
        if (userLocation) {
          hospitalsData = hospitalsData.map(hospital => ({
            ...hospital,
            distance: hospital.location?.coordinates
              ? calculateDistance(
                  userLocation.latitude,
                  userLocation.longitude,
                  hospital.location.coordinates[1],
                  hospital.location.coordinates[0]
                )
              : null
          }));
        }

        setHospitals(hospitalsData);
      }
    } catch (err) {
      console.error('Error fetching hospitals:', err);
      setError('Failed to load hospitals');
    } finally {
      setLoading(false);
    }
  };

  const filteredHospitals = useMemo(() => {
    return hospitals.filter(hospital => {
      // Rating filter
      if (filters.minRating > 0 && hospital.websiteRating < filters.minRating) {
        return false;
      }

      // Distance filter
      if (userLocation && hospital.distance !== null) {
        if (hospital.distance > filters.maxDistance) {
          return false;
        }
      }

      // Emergency filter
      if (filters.emergencyOnly && !hospital.emergencyAvailable) {
        return false;
      }

      // Facilities filter
      if (filters.selectedFacilities.length > 0) {
        const hasAllFacilities = filters.selectedFacilities.every(
          facility => hospital.facilities?.includes(facility)
        );
        if (!hasAllFacilities) {
          return false;
        }
      }

      // Budget filter
      if (filters.minBudget > 0 || filters.maxBudget < 10000) {
        const hospitalPrice = hospital.tests?.[0]?.price || 0;
        if (hospitalPrice < filters.minBudget || hospitalPrice > filters.maxBudget) {
          return false;
        }
      }

      // Specialization filter
      if (filters.selectedSpecializations.length > 0) {
        const hasSpecialization = filters.selectedSpecializations.some(
          spec => hospital.facilities?.includes(spec)
        );
        if (!hasSpecialization) {
          return false;
        }
      }

      return true;
    });
  }, [hospitals, filters, userLocation]);

  // Sort hospitals
  const sortedHospitals = useMemo(() => {
    let sorted = [...filteredHospitals];

    switch (sortBy) {
      case 'nearest':
        sorted.sort((a, b) => {
          if (a.distance === null) return 1;
          if (b.distance === null) return -1;
          return a.distance - b.distance;
        });
        break;

      case 'rating':
        sorted.sort((a, b) => (b.websiteRating || 0) - (a.websiteRating || 0));
        break;

      case 'price':
        sorted.sort((a, b) => {
          const priceA = a.tests?.[0]?.price || 9999;
          const priceB = b.tests?.[0]?.price || 9999;
          return priceA - priceB;
        });
        break;

      case 'emergency':
        sorted.sort((a, b) => {
          if (a.emergencyAvailable === b.emergencyAvailable) {
            if (a.distance === null) return 1;
            if (b.distance === null) return -1;
            return a.distance - b.distance;
          }
          return b.emergencyAvailable - a.emergencyAvailable;
        });
        break;

      default:
        break;
    }

    return sorted;
  }, [filteredHospitals, sortBy]);

  const availableFacilities = useMemo(() => {
    const facilities = new Set();
    hospitals.forEach(hospital => {
      hospital.facilities?.forEach(facility => facilities.add(facility));
    });
    return Array.from(facilities);
  }, [hospitals]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  // ✅ SAFELY FORMAT HOSPITAL DATA
  const formatHospitalData = (hospital) => {
    return {
      // Ensure we extract ID properly whether it's _id or id
      id: hospital._id || hospital.id,
      _id: hospital._id || hospital.id,
      name: hospital.name,
      address: hospital.address ? {
        street: hospital.address.street || '',
        city: hospital.address.city || '',
        state: hospital.address.state || '',
        pincode: hospital.address.pincode || ''
      } : {},
      rating: hospital.websiteRating || 0,
      websiteRating: hospital.websiteRating || 0,
      totalReviews: hospital.totalReviews || 0,
      googleRating: hospital.googleRating || 0,
      googleReviewCount: hospital.googleReviewCount || 0,
      distance: hospital.distance,
      price: hospital.tests?.[0]?.price || 500,
      facilities: hospital.facilities || [],
      emergencyAvailable: hospital.emergencyAvailable || false,
      images: hospital.images || []
    };
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-500 mb-4"
          >
            <FaArrowLeft /> Back to Home
          </button>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-800">
                {searchData.manualLocation
                  ? `Results in ${searchData.manualLocation.city ? searchData.manualLocation.city + ', ' : ''}${searchData.manualLocation.district ? searchData.manualLocation.district + ', ' : ''}${searchData.manualLocation.state}`
                  : searchData.pinCode
                  ? `Results for Pin Code: ${searchData.pinCode}`
                  : searchData.query
                  ? `Results for "${searchData.query}"`
                  : 'All Hospitals'
                }
              </h1>
              <p className="text-gray-600 mt-2">
                Showing {sortedHospitals.length} of {hospitals.length} hospitals
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="nearest">📍 Nearest</option>
                <option value="rating">⭐ Best Rating</option>
                <option value="price">💰 Lowest Cost</option>
                <option value="emergency">🚨 Emergency Available</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <FilterPanel 
              onFilterChange={handleFilterChange}
              availableFacilities={availableFacilities}
            />
          </div>

          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader />
              </div>
            ) : sortedHospitals.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-md">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-2">No Results Found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your filters</p>
                <button
                  onClick={() => navigate('/')}
                  className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
                >
                  Back to Home
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedHospitals.map((hospital) => {
                  // Key is safely assigned
                  const uniqueKey = hospital._id || hospital.id || Math.random().toString();
                  return (
                    <HospitalCard
                      key={uniqueKey}
                      hospital={formatHospitalData(hospital)}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;