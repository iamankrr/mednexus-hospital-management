import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaFlask, 
  FaMapMarkerAlt, 
  FaStar, 
  FaPhone, 
  FaHeart,
  FaChevronLeft,
  FaChevronRight,
  FaExchangeAlt
} from 'react-icons/fa';
import { useComparison } from '../context/ComparisonContext';

const LabCard = ({ lab, onFavoriteToggle, isFavorite }) => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
    setCurrentImageIndex(prev => prev === 0 ? (lab.images?.length || 1) - 1 : prev - 1);
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => prev === (lab.images?.length || 1) - 1 ? 0 : prev + 1);
  };

  // ✅ FIX: Explicitly passing 'laboratory' type
  const handleCompareToggle = (e) => {
    e.stopPropagation();
    const id = lab._id || lab.id;
    if (isInComparison(id)) {
      removeFromComparison(id);
    } else {
      addToComparison(lab, 'laboratory'); 
    }
  };

  const handleCall = (e) => {
    e.stopPropagation();
    if (lab.phone) window.location.href = `tel:${lab.phone}`;
  };

  const handleMapOpen = (e) => {
    e.stopPropagation();
    const mapBase = "https://www" + ".google." + "com/maps/dir/?api=1";
    let finalUrl = mapBase;
    
    if (lab.googlePlaceId) {
      finalUrl += "&destination=" + encodeURIComponent(lab.name) + "&destination_place_id=" + lab.googlePlaceId;
    } else if (lab.location?.coordinates) {
      const [lng, lat] = lab.location.coordinates;
      finalUrl += "&destination=" + lat + "," + lng;
    } else if (lab.address) {
      const query = encodeURIComponent(`${lab.name}, ${lab.address.area || ''}, ${lab.address.city || ''}`);
      finalUrl += "&destination=" + query;
    }
    window.open(finalUrl, '_blank');
  };

  const displayAddress = [lab.address?.area, lab.address?.city].filter(Boolean).join(', ');

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 flex flex-col h-full">
      <div className="relative h-56 bg-gradient-to-br from-green-100 to-green-50 overflow-hidden group cursor-pointer flex-shrink-0" onClick={() => navigate(`/lab/${lab._id}`)}>
        {lab.images && lab.images.length > 0 ? (
          <>
            <img src={lab.images[currentImageIndex]} alt={lab.name} className="w-full h-full object-cover" />
            {lab.images.length > 1 && (
              <>
                <button onClick={handlePrevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"><FaChevronLeft className="text-gray-700" /></button>
                <button onClick={handleNextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"><FaChevronRight className="text-gray-700" /></button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                  {lab.images.map((_, idx) => (
                    <div key={idx} className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIndex ? 'bg-white w-6' : 'bg-white/50'}`} />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full"><FaFlask className="text-6xl text-green-300" /></div>
        )}

        {lab.distance !== undefined && lab.distance !== null && (
          <div className="absolute top-3 left-3 bg-green-600 text-white px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1 shadow-lg">
            <FaMapMarkerAlt className="text-xs" /><span>{lab.distance.toFixed(1)} km</span>
          </div>
        )}

        {(!user || user.role === 'user') && (
          <button onClick={(e) => { e.stopPropagation(); onFavoriteToggle?.(lab._id); }} className="absolute top-3 right-3 bg-white p-2.5 rounded-full shadow-lg hover:scale-110 transition-transform z-10">
            <FaHeart className={`text-lg ${isFavorite ? 'text-red-500' : 'text-gray-300'}`} />
          </button>
        )}
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 hover:text-green-600 transition cursor-pointer" onClick={() => navigate(`/lab/${lab._id}`)}>
          {lab.name}
        </h3>

        <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
          <FaMapMarkerAlt className="text-green-500 flex-shrink-0" />
          <span className="line-clamp-1">{displayAddress}</span>
        </div>

        <div className="flex items-center justify-between mb-4 pb-4 border-b">
          <div>
            <div className="flex items-center gap-1 mb-1">
              <FaStar className="text-yellow-400 text-sm" />
              <span className="font-bold text-gray-900">{lab.googleRating?.toFixed(1) || 'N/A'}</span>
              <span className="text-gray-500 text-xs">({lab.googleReviewCount || 0})</span>
            </div>
            <p className="text-xs text-gray-500">Google Reviews</p>
          </div>
          <div>
            <div className="flex items-center gap-1 mb-1">
              <FaStar className="text-blue-400 text-sm" />
              <span className="font-bold text-gray-900">{lab.appRating?.toFixed(1) || '0.0'}</span>
              <span className="text-gray-500 text-xs">({lab.appReviewCount || 0})</span>
            </div>
            <p className="text-xs text-gray-500">App Reviews</p>
          </div>
        </div>

        <div className="mb-4 mt-auto">
          <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">{lab.type || 'Diagnostic Lab'}</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button onClick={() => navigate(`/lab/${lab._id}`)} className="col-span-3 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-colors">
            View Details
          </button>

          {comparison && (
            <button onClick={handleCompareToggle} className={`flex items-center justify-center gap-1 py-2 rounded-lg font-medium transition ${isInComparison(lab._id || lab.id) ? 'bg-orange-600 text-white hover:bg-orange-700' : 'bg-orange-100 text-orange-700 hover:bg-orange-200'}`}>
              <FaExchangeAlt className="text-sm" /><span className="text-xs">Compare</span>
            </button>
          )}

          <button onClick={handleCall} disabled={!lab.phone} className={`flex items-center justify-center gap-1 bg-green-100 text-green-700 py-2 rounded-lg font-medium hover:bg-green-200 transition disabled:opacity-50 disabled:cursor-not-allowed ${comparison ? '' : 'col-span-1'}`}>
            <FaPhone className="text-sm" /><span className="text-xs">Call</span>
          </button>

          <button onClick={handleMapOpen} className={`flex items-center justify-center gap-1 bg-purple-100 text-purple-700 py-2 rounded-lg font-medium hover:bg-purple-200 transition ${comparison ? '' : 'col-span-2'}`}>
            <FaMapMarkerAlt className="text-sm" /><span className="text-xs">Map</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LabCard;