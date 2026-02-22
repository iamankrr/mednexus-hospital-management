import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaHospital, FaMapMarkerAlt, FaStar, FaHeart, FaBalanceScale, FaPhone } from 'react-icons/fa';
import { HOSPITAL_TYPES } from './HospitalTypeFilter';
import { useComparison } from '../context/ComparisonContext';

const HospitalCard = ({ hospital, showFavoriteButton = false, onFavoriteToggle }) => {
  const navigate = useNavigate();
  const { addToCompare, compareList } = useComparison();
  const [isFavorite, setIsFavorite] = useState(false);

  // ✅ SAFELY GET ID
  const hospitalId = hospital?._id || hospital?.id;

  useEffect(() => {
    // Only check if showFavoriteButton is true to save API calls
    if (showFavoriteButton && hospitalId) {
      checkIfFavorite();
    }
  }, [hospitalId, showFavoriteButton]);

  const checkIfFavorite = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get('http://localhost:3000/api/favorites', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const favorites = response.data.data;
      const isFav = favorites.hospitals?.some(h => {
        const id = typeof h === 'string' ? h : h._id;
        return id === hospitalId; 
      });

      setIsFavorite(isFav);
    } catch (error) {
      // Silently fail if not logged in
    }
  };

  const handleClick = () => {
    if (hospitalId) {
      navigate(`/hospital/${hospitalId}`); 
    }
  };

  const handleToggleFavorite = async (e) => {
    e.stopPropagation();

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to add favorites');
      navigate('/login');
      return;
    }

    try {
      const endpoint = isFavorite ? '/api/favorites/remove' : '/api/favorites/add';
      
      await axios.post(
        `http://localhost:3000${endpoint}`,
        {
          facilityId: hospitalId, 
          facilityType: 'hospital'
        },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      setIsFavorite(!isFavorite);
      
      // Call parent callback if provided (e.g., from Home.jsx)
      if (onFavoriteToggle) {
        onFavoriteToggle(hospitalId, 'hospital');
      }
      
      alert(isFavorite ? '✅ Removed from favorites' : '✅ Added to favorites');
    } catch (error) {
      console.error('Favorite error:', error);
      alert(error.response?.data?.message || 'Failed to update favorites');
    }
  };

  const handleAddToCompare = (e) => {
    e.stopPropagation();
    const success = addToCompare(hospital, 'hospital');
    if (success) {
      alert(`${hospital.name} added to comparison!`);
    }
  };

  // Safe check for Compare
  const isInCompare = compareList?.find(h => (h._id || h.id) === hospitalId);

  const formatDistance = (distance) => {
    if (!distance && distance !== 0) return null;
    if (distance < 1) {
      return `${(distance * 1000).toFixed(0)} m`;
    }
    return `${distance.toFixed(1)} km`;
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition duration-300 cursor-pointer border border-gray-200 group flex flex-col h-full"
    >
      {/* Image Section */}
      <div className="relative h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex-shrink-0">
        {hospital.images && hospital.images.length > 0 ? (
          <img
            src={hospital.images[0]}
            alt={hospital.name}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FaHospital className="text-6xl text-blue-400 opacity-50" />
          </div>
        )}

        {/* ✅ Distance Badge - MOVED TO BOTTOM LEFT */}
        {hospital.distance !== undefined && hospital.distance !== null && (
          <span className="absolute bottom-3 left-3 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm">
            📍 {formatDistance(hospital.distance)}
          </span>
        )}

        {/* ✅ Favorite Button - MOVED TO TOP RIGHT */}
        {showFavoriteButton && (
          <button
            onClick={handleToggleFavorite}
            className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition z-10"
          >
            <FaHeart className={`text-xl ${
              isFavorite ? 'text-red-500 fill-current' : 'text-gray-400'
            }`} />
          </button>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5 flex flex-col flex-grow">
        
        {/* Name and Type */}
        <div className="mb-3">
          <h3 className="font-bold text-gray-900 text-xl mb-2 line-clamp-1">
            {hospital.name}
          </h3>
          {hospital.type && (
            <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-medium border border-blue-100">
              {HOSPITAL_TYPES?.find(t => t.value === hospital.type)?.icon || '🏥'}
              {' '}
              {HOSPITAL_TYPES?.find(t => t.value === hospital.type)?.label || hospital.type}
            </span>
          )}
        </div>

        {/* Ratings */}
        <div className="flex flex-col gap-1 mb-3">
          {hospital.googleRating > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-green-100 px-2 py-0.5 rounded text-xs">
                <FaStar className="text-green-600" />
                <span className="font-semibold text-green-800">{hospital.googleRating.toFixed(1)}</span>
              </div>
              <span className="text-xs text-gray-600">({hospital.googleReviewCount} Google reviews)</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-blue-100 px-2 py-0.5 rounded text-xs">
              <FaStar className="text-blue-600" />
              <span className="font-semibold text-blue-800">{(hospital.websiteRating || hospital.rating || 0).toFixed(1)}</span>
            </div>
            <span className="text-xs text-gray-600">({hospital.totalReviews || 0} User reviews)</span>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-start gap-2 text-sm text-gray-600 mb-4 h-10 overflow-hidden">
          <FaMapMarkerAlt className="text-blue-500 mt-1 flex-shrink-0" />
          <span className="line-clamp-2">
            {[
              hospital.address?.city,
              hospital.address?.state,
              hospital.address?.pincode
            ].filter(Boolean).join(', ')}
          </span>
        </div>

        {/* Pushes action buttons to the bottom */}
        <div className="mt-auto pt-4 border-t border-gray-100 flex gap-2">
          <button
            onClick={handleClick}
            className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition text-sm"
          >
            View Details
          </button>
          
          <button 
            onClick={handleAddToCompare}
            disabled={isInCompare}
            className={`flex items-center justify-center ${
              isInCompare ? 'bg-green-500' : 'bg-orange-500 hover:bg-orange-600'
            } text-white px-3 py-2 rounded-lg transition duration-200`}
            title={isInCompare ? "Added to Compare" : "Compare"}
          >
            <FaBalanceScale />
          </button>
          
          {hospital.phone && (
            <a 
              href={`tel:${hospital.phone}`}
              onClick={(e) => e.stopPropagation()} 
              className="flex items-center justify-center bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition duration-200 border border-gray-200" 
              title="Call"
            >
              <FaPhone />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default HospitalCard;