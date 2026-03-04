import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaFlask, 
  FaMapMarkerAlt, 
  FaStar, 
  FaHeart,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';

const LabCard = ({ lab, onFavoriteToggle, isFavorite }) => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => 
      prev === 0 ? (lab.images?.length || 1) - 1 : prev - 1
    );
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => 
      prev === (lab.images?.length || 1) - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer">
      {/* Image Section */}
      <div 
        className="relative h-56 bg-gradient-to-br from-blue-100 to-blue-50 overflow-hidden group"
        onClick={() => navigate(`/lab/${lab._id}`)}
      >
        {lab.images && lab.images.length > 0 ? (
          <>
            <img
              src={lab.images[currentImageIndex]}
              alt={lab.name}
              className="w-full h-full object-cover"
            />
            
            {lab.images.length > 1 && (
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
                  {lab.images.map((_, idx) => (
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
            <FaFlask className="text-6xl text-blue-300" />
          </div>
        )}

        {/* Distance Badge - ADDED */}
        {lab.distance !== undefined && lab.distance !== null && (
          <div className="absolute top-3 left-3 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 shadow-lg">
            <FaMapMarkerAlt className="text-xs" />
            {lab.distance.toFixed(1)} km
          </div>
        )}

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFavoriteToggle(lab._id);
          }}
          className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform"
        >
          <FaHeart 
            className={`text-xl ${
              isFavorite ? 'text-red-500' : 'text-gray-300'
            }`} 
          />
        </button>
      </div>

      {/* Content Section */}
      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
          {lab.name}
        </h3>

        <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
          <FaMapMarkerAlt className="text-blue-500 flex-shrink-0" />
          <span className="line-clamp-1">
            {lab.address?.area}, {lab.address?.city}
          </span>
        </div>

        <div className="flex items-center justify-between mb-3">
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
            {lab.type || 'Diagnostic Lab'}
          </span>

          <div className="flex items-center gap-1">
            <FaStar className="text-yellow-400" />
            <span className="font-bold text-gray-900">
              {lab.googleRating?.toFixed(1) || 'N/A'}
            </span>
            <span className="text-gray-500 text-sm">
              ({lab.googleReviewCount || 0})
            </span>
          </div>
        </div>

        <button
          onClick={() => navigate(`/lab/${lab._id}`)}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default LabCard;