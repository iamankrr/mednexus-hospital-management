import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaFlask, FaMapMarkerAlt, FaStar, FaPhone, FaHome, 
  FaRupeeSign, FaHeart, FaRegHeart, FaBalanceScale,
  FaChevronLeft, FaChevronRight // ✅ ADDED CHEVRONS
} from 'react-icons/fa';
import { useComparison } from '../context/ComparisonContext';
import toast from 'react-hot-toast';

const LabCard = ({ lab, showFavoriteButton = false, onFavoriteToggle }) => {
  const navigate = useNavigate();
  const { addToCompare, removeFromCompare, isInCompare } = useComparison();

  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  
  // ✅ STATE FOR IMAGE CAROUSEL
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const labId = lab?._id || lab?.id;
  const isAddedToCompare = isInCompare(labId);

  // Normalize images array
  const labImages = lab.images?.length > 0 ? lab.images : (lab.photos?.map(p => p.url) || []);

  useEffect(() => {
    if (showFavoriteButton && labId) {
      checkIfFavorite();
    }
  }, [labId, showFavoriteButton]);

  const checkIfFavorite = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await axios.get('http://localhost:3000/api/favorites', { headers: { 'Authorization': `Bearer ${token}` } });
      const isFav = response.data.data.laboratories?.some(l => {
        const id = typeof l === 'string' ? l : l._id;
        return id === labId;
      });
      setIsFavorite(isFav);
    } catch (error) {}
  };

  const formatDistance = (distance) => {
    if (!distance && distance !== 0) return null;
    if (distance < 1) return `${(distance * 1000).toFixed(0)} m`;
    return `${distance.toFixed(1)} km`;
  };

  const handleClick = () => {
    if (labId) {
      navigate(`/lab/${labId}`, { state: { facilityData: lab } });
    }
  };

  const handleCompareClick = (e) => {
    e.stopPropagation(); 
    if (isAddedToCompare) {
      removeFromCompare(labId); 
    } else {
      const success = addToCompare(lab, 'lab'); 
      if (success) toast.success(`${lab.name} added to comparison!`);
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
    setFavoriteLoading(true);
    try {
      const endpoint = isFavorite ? '/api/favorites/remove' : '/api/favorites/add';
      await axios.post(`http://localhost:3000${endpoint}`, { facilityId: labId, facilityType: 'laboratory' }, { headers: { 'Authorization': `Bearer ${token}` } });
      setIsFavorite(!isFavorite);
      if (onFavoriteToggle) onFavoriteToggle(labId, 'laboratory');
      if (isFavorite) toast.success('Removed from favorites');
      else toast.success('Added to favorites!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update favorites');
    } finally {
      setFavoriteLoading(false);
    }
  };

  // ✅ CAROUSEL FUNCTIONS
  const nextImage = (e) => {
    e.stopPropagation();
    if (labImages.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % labImages.length);
    }
  };

  const prevImage = (e) => {
    e.stopPropagation();
    if (labImages.length > 1) {
      setCurrentImageIndex((prev) => (prev === 0 ? labImages.length - 1 : prev - 1));
    }
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition cursor-pointer border border-gray-200 flex flex-col h-full group relative"
    >
      {/* ✅ IMAGE SECTION WITH CAROUSEL */}
      <div className="relative h-48 bg-gradient-to-br from-purple-100 to-purple-200 overflow-hidden flex-shrink-0">
        {labImages.length > 0 ? (
          <>
            <img
              src={labImages[currentImageIndex]}
              alt={lab.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            
            {/* Arrows (Only show if multiple images exist) */}
            {labImages.length > 1 && (
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
                  {labImages.map((_, idx) => (
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
            <FaFlask className="text-6xl text-purple-400 opacity-50" />
          </div>
        )}

        {/* Favorite Button - Top Right */}
        {showFavoriteButton && (
          <button 
            onClick={handleToggleFavorite}
            disabled={favoriteLoading}
            className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-white transition z-20"
          >
            {isFavorite ? (
              <FaHeart className="text-red-500 w-5 h-5" />
            ) : (
              <FaRegHeart className="text-gray-400 w-5 h-5 hover:text-red-500" />
            )}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow bg-white z-20">
        <div className="flex justify-between items-start gap-4 mb-3">
          <h3 className="font-bold text-gray-900 text-lg line-clamp-1 flex-1">{lab.name}</h3>
          {lab.distance !== undefined && lab.distance !== null && (
            <span className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded-lg text-xs font-bold border border-green-100 whitespace-nowrap shadow-sm">
              📍 {formatDistance(lab.distance)}
            </span>
          )}
        </div>

        <div className="mb-4">
          {lab.googleRating > 0 && (
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1 bg-green-100 px-2 py-1 rounded">
                <FaStar className="text-green-600 text-sm" />
                <span className="text-sm font-semibold text-green-800">{lab.googleRating.toFixed(1)}</span>
              </div>
              <span className="text-xs text-gray-600">({lab.googleReviewCount?.toLocaleString() || 0} Google Reviews)</span>
            </div>
          )}
        </div>

        <div className="flex items-start gap-2 text-sm text-gray-600 mb-2">
          <FaMapMarkerAlt className="text-purple-500 mt-0.5 flex-shrink-0" />
          <span className="line-clamp-1">
            {[lab.address?.city, lab.address?.state].filter(Boolean).join(', ')}
          </span>
        </div>

        {lab.homeCollection && (
          <div className="flex items-center gap-2 text-gray-600 mb-3">
            <FaHome className="text-blue-500" />
            <p className="text-sm font-medium">Home Collection Available</p>
          </div>
        )}

        {lab.avgPrice && (
          <div className="mb-4 space-y-2 mt-auto">
            <div className="flex items-center gap-2 text-gray-700">
              <span className="text-sm font-medium">💰 Tests from:</span>
              <span className="text-sm font-bold text-green-600 flex items-center">
                <FaRupeeSign className="text-xs" />{lab.avgPrice}
              </span>
            </div>
          </div>
        )}
        
        {!lab.avgPrice && <div className="mt-auto"></div>}

        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
          <button onClick={(e) => { e.stopPropagation(); handleClick(); }} className="flex-1 bg-purple-600 text-white py-2.5 rounded-xl font-semibold hover:bg-purple-700 transition shadow-sm text-sm">
            View Details
          </button>

          <button onClick={handleCompareClick} className={`p-2.5 rounded-xl transition shadow-sm flex items-center justify-center border ${isAddedToCompare ? 'bg-purple-600 text-white border-purple-600 hover:bg-purple-700' : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200'}`} title={isAddedToCompare ? "Remove from Compare" : "Add to Compare"}>
            <FaBalanceScale className="text-xl" />
          </button>

          {lab.phone && (
            <a href={`tel:${lab.phone}`} onClick={(e) => e.stopPropagation()} className="bg-gray-100 text-gray-700 p-2.5 rounded-xl hover:bg-gray-200 transition shadow-sm flex items-center justify-center border border-gray-200" title="Call">
              <FaPhone />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default LabCard;