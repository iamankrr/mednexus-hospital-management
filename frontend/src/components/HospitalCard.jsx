import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaHospital, FaMapMarkerAlt, FaStar, FaHeart, 
  FaBalanceScale, FaPhone, FaChevronLeft, FaChevronRight // ✅ ADDED CHEVRONS
} from 'react-icons/fa';
import { HOSPITAL_TYPES } from './HospitalTypeFilter';
import { useComparison } from '../context/ComparisonContext';
import toast from 'react-hot-toast';

const HospitalCard = ({ hospital, showFavoriteButton = false, onFavoriteToggle }) => {
  const navigate = useNavigate();
  const { addToCompare, compareList } = useComparison();
  const [isFavorite, setIsFavorite] = useState(false);
  
  // ✅ STATE FOR IMAGE CAROUSEL
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const hospitalId = hospital?._id || hospital?.id;

  useEffect(() => {
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
      const isFav = response.data.data.hospitals?.some(h => {
        const id = typeof h === 'string' ? h : h._id;
        return id === hospitalId; 
      });
      setIsFavorite(isFav);
    } catch (error) {}
  };

  const handleClick = () => {
    if (hospitalId) {
      navigate(`/hospital/${hospitalId}`, { state: { facilityData: hospital } }); 
    }
  };

  const handleToggleFavorite = async (e) => {
    e.stopPropagation();
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to add favorites');
      navigate('/login');
      return;
    }
    try {
      const endpoint = isFavorite ? '/api/favorites/remove' : '/api/favorites/add';
      await axios.post(`http://localhost:3000${endpoint}`, { facilityId: hospitalId, facilityType: 'hospital' }, { headers: { 'Authorization': `Bearer ${token}` } });
      setIsFavorite(!isFavorite);
      if (onFavoriteToggle) onFavoriteToggle(hospitalId, 'hospital');
      if (isFavorite) toast.success('Removed from favorites');
      else toast.success('Added to favorites!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update favorites');
    }
  };

  const handleAddToCompare = (e) => {
    e.stopPropagation();
    const success = addToCompare(hospital, 'hospital');
    if (success) toast.success(`${hospital.name} added to comparison!`);
  };

  const isInCompare = compareList?.find(h => (h._id || h.id) === hospitalId);

  const formatDistance = (distance) => {
    if (!distance && distance !== 0) return null;
    if (distance < 1) return `${(distance * 1000).toFixed(0)} m`;
    return `${distance.toFixed(1)} km`;
  };

  // ✅ CAROUSEL FUNCTIONS
  const nextImage = (e) => {
    e.stopPropagation(); // Card click rokne ke liye
    if (hospital.images?.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % hospital.images.length);
    }
  };

  const prevImage = (e) => {
    e.stopPropagation();
    if (hospital.images?.length > 1) {
      setCurrentImageIndex((prev) => (prev === 0 ? hospital.images.length - 1 : prev - 1));
    }
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition duration-300 cursor-pointer border border-gray-200 group flex flex-col h-full relative"
    >
      {/* ✅ IMAGE SECTION WITH CAROUSEL */}
      <div className="relative h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex-shrink-0 overflow-hidden">
        {hospital.images && hospital.images.length > 0 ? (
          <>
            <img
              src={hospital.images[currentImageIndex]}
              alt={hospital.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            
            {/* Arrows (Only show if multiple images exist) */}
            {hospital.images.length > 1 && (
              <>
                <button 
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
                >
                  <FaChevronLeft className="text-sm" />
                </button>
                <button 
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
                >
                  <FaChevronRight className="text-sm" />
                </button>

                {/* Dots Indicator */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                  {hospital.images.map((_, idx) => (
                    <span 
                      key={idx} 
                      className={`block h-1.5 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/60'}`} 
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FaHospital className="text-6xl text-blue-400 opacity-50" />
          </div>
        )}

        {/* Distance Badge */}
        {hospital.distance !== undefined && hospital.distance !== null && (
          <span className="absolute top-3 left-3 px-2 py-1 bg-green-100/90 backdrop-blur-sm text-green-700 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm z-20">
            📍 {formatDistance(hospital.distance)}
          </span>
        )}

        {/* Favorite Button */}
        {showFavoriteButton && (
          <button
            onClick={handleToggleFavorite}
            className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition z-20"
          >
            <FaHeart className={`text-xl ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
          </button>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5 flex flex-col flex-grow z-20 bg-white">
        <div className="mb-3">
          <h3 className="font-bold text-gray-900 text-xl mb-2 line-clamp-1">{hospital.name}</h3>
          {hospital.type && (
            <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-medium border border-blue-100">
              {HOSPITAL_TYPES?.find(t => t.value === hospital.type)?.icon || '🏥'} {HOSPITAL_TYPES?.find(t => t.value === hospital.type)?.label || hospital.type}
            </span>
          )}
        </div>

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

        <div className="flex items-start gap-2 text-sm text-gray-600 mb-4 h-10 overflow-hidden">
          <FaMapMarkerAlt className="text-blue-500 mt-1 flex-shrink-0" />
          <span className="line-clamp-2">
            {[hospital.address?.city, hospital.address?.state, hospital.address?.pincode].filter(Boolean).join(', ')}
          </span>
        </div>

        <div className="mt-auto pt-4 border-t border-gray-100 flex gap-2">
          <button onClick={(e) => { e.stopPropagation(); handleClick(); }} className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition text-sm">
            View Details
          </button>
          
          <button onClick={handleAddToCompare} disabled={isInCompare} className={`flex items-center justify-center ${isInCompare ? 'bg-green-500' : 'bg-orange-500 hover:bg-orange-600'} text-white px-3 py-2 rounded-lg transition duration-200`} title={isInCompare ? "Added to Compare" : "Compare"}>
            <FaBalanceScale />
          </button>
          
          {hospital.phone && (
            <a href={`tel:${hospital.phone}`} onClick={(e) => e.stopPropagation()} className="flex items-center justify-center bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition duration-200 border border-gray-200" title="Call">
              <FaPhone />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default HospitalCard;