import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaHospital, 
  FaMapMarkerAlt, 
  FaStar, 
  FaPhone, 
  FaHeart,
  FaChevronLeft,
  FaChevronRight,
  FaExchangeAlt,
  FaBuilding
} from 'react-icons/fa';
import { useComparison } from '../context/ComparisonContext';

// Helper for category icons
const getCategoryIcon = (category) => {
  const cat = category?.toLowerCase() || '';
  if (cat.includes('gov')) return '🏛️';
  if (cat.includes('public')) return '🏥';
  if (cat.includes('charity') || cat.includes('ngo')) return '❤️';
  return '💼'; // Private default
};

const HospitalCard = ({ hospital, onFavoriteToggle, isFavorite }) => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // ✅ FIX: Get user to check role for hiding the favorite button for admins
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  
  let comparison = null;
  try {
    comparison = useComparison();
  } catch (error) {
    console.warn('Comparison context not available');
  }

  const addToComparison = comparison?.addToComparison || (() => {});
  const removeFromComparison = comparison?.removeFromComparison || (() => {});
  const isInComparison = comparison?.isInComparison || (() => false);

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => 
      prev === 0 ? (hospital.images?.length || 1) - 1 : prev - 1
    );
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => 
      prev === (hospital.images?.length || 1) - 1 ? 0 : prev + 1
    );
  };

  const handleCompareToggle = (e) => {
    e.stopPropagation();
    if (isInComparison(hospital._id)) {
      removeFromComparison(hospital._id);
    } else {
      addToComparison(hospital);
    }
  };

  const handleCall = (e) => {
    e.stopPropagation();
    if (hospital.phone) {
      window.location.href = `tel:${hospital.phone}`;
    }
  };

  const displayAddress = [hospital.address?.area, hospital.address?.city]
    .filter(Boolean) 
    .join(', ');     

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 flex flex-col h-full">
      {/* Image Section */}
      <div 
        className="relative h-52 bg-gradient-to-br from-blue-100 to-blue-50 overflow-hidden group cursor-pointer flex-shrink-0"
        onClick={() => navigate(`/hospital/${hospital._id}`)}
      >
        {hospital.images && hospital.images.length > 0 ? (
          <>
            <img
              src={hospital.images[currentImageIndex]}
              alt={hospital.name}
              className="w-full h-full object-cover"
              loading="lazy" 
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
              }}
            />
            
            {hospital.images.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                >
                  <FaChevronLeft className="text-gray-700" />
                </button>
                
                <button
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                >
                  <FaChevronRight className="text-gray-700" />
                </button>

                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                  {hospital.images.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-2 h-2 rounded-full transition-all ${
                        idx === currentImageIndex 
                          ? 'bg-white w-6' 
                          : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <FaHospital className="text-6xl text-blue-300" />
          </div>
        )}

        {/* Distance Badge */}
        {hospital.distance !== undefined && hospital.distance !== null && (
          <div className="absolute top-3 left-3 bg-green-600 text-white px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1 shadow-lg">
            <FaMapMarkerAlt className="text-xs" />
            <span>{hospital.distance.toFixed(1)} km</span>
          </div>
        )}

        {/* ✅ FIX: Hide Favorite Button if User is Admin or Owner */}
        {(!user || user.role === 'user') && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFavoriteToggle?.(hospital._id);
            }}
            className="absolute top-3 right-3 bg-white p-2.5 rounded-full shadow-lg hover:scale-110 transition-transform z-10"
          >
            <FaHeart 
              className={`text-lg ${
                isFavorite ? 'text-red-500' : 'text-gray-300'
              }`} 
            />
          </button>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5 flex flex-col flex-grow">
        
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition cursor-pointer"
            onClick={() => navigate(`/hospital/${hospital._id}`)}>
          {hospital.name}
        </h3>

        <div className="flex items-center gap-1 text-sm text-gray-600 mb-4">
          <FaMapMarkerAlt className="text-blue-500 flex-shrink-0" />
          <span className="line-clamp-1">
            {displayAddress}
          </span>
        </div>

        {/* Ratings Section */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-1 mb-1">
              <FaStar className="text-yellow-400 text-sm" />
              <span className="font-bold text-gray-900">
                {hospital.googleRating?.toFixed(1) || 'N/A'}
              </span>
              <span className="text-gray-500 text-xs">
                ({hospital.googleReviewCount || 0})
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium">Google Reviews</p>
          </div>

          <div>
            <div className="flex items-center gap-1 mb-1 justify-end">
              <FaStar className="text-blue-400 text-sm" />
              <span className="font-bold text-gray-900">
                {hospital.appRating?.toFixed(1) || '0.0'}
              </span>
              <span className="text-gray-500 text-xs">
                ({hospital.appReviewCount || 0})
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium text-right">App Reviews</p>
          </div>
        </div>

        {/* CATEGORY & TYPE TAGS */}
        <div className="mb-5 flex flex-wrap gap-2 mt-auto">
          <span className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 border border-gray-200 rounded-full text-xs font-bold uppercase">
            {getCategoryIcon(hospital.category)} {hospital.category || 'Private'}
          </span>
          <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-xs font-bold capitalize">
            {hospital.type}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2">
          {/* View Details */}
          <button
            onClick={() => navigate(`/hospital/${hospital._id}`)}
            className="col-span-3 bg-blue-600 text-white py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-sm"
          >
            View Details
          </button>

          {/* Compare */}
          {comparison && (
            <button
              onClick={handleCompareToggle}
              className={`flex items-center justify-center gap-1 py-2 rounded-lg font-medium transition ${
                isInComparison(hospital._id)
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
              }`}
            >
              <FaExchangeAlt className="text-sm" />
              <span className="text-xs">Compare</span>
            </button>
          )}

          {/* Call */}
          <button
            onClick={handleCall}
            disabled={!hospital.phone}
            className={`flex items-center justify-center gap-1 py-2 rounded-lg font-medium transition ${
              hospital.phone ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            } ${comparison ? '' : 'col-span-1'}`}
          >
            <FaPhone className="text-sm" />
            <span className="text-xs">Call</span>
          </button>

          {/* Map */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (hospital.googlePlaceId) {
                window.open(`https://maps.google.com/?query=${encodeURIComponent(hospital.name)}&query_place_id=${hospital.googlePlaceId}`, '_blank');
              } else if (hospital.location?.coordinates) {
                const [lng, lat] = hospital.location.coordinates;
                window.open(`https://maps.google.com/?q=${lat},${lng}`, '_blank');
              } else if (hospital.address) {
                const query = encodeURIComponent(`${hospital.name}, ${hospital.address.area || ''}, ${hospital.address.city || ''}`);
                window.open(`https://maps.google.com/?q=${query}`, '_blank');
              }
            }}
            className={`flex items-center justify-center gap-1 bg-purple-50 text-purple-600 py-2 rounded-lg font-medium hover:bg-purple-100 transition ${
              comparison ? '' : 'col-span-2'
            }`}
          >
            <FaMapMarkerAlt className="text-sm" />
            <span className="text-xs">Map</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HospitalCard;