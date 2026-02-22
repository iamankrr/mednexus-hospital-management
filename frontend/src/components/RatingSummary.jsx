import React from 'react';
import { FaStar, FaGoogle } from 'react-icons/fa';

const RatingSummary = ({ rating, totalReviews, googleRating, googleReviewCount }) => {
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<FaStar key={i} className="text-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<FaStar key={i} className="text-yellow-400 opacity-50" />);
      } else {
        stars.push(<FaStar key={i} className="text-gray-300" />);
      }
    }
    return stars;
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 sticky top-20">
      
      {/* Google Rating */}
      {googleRating > 0 && (
        <div className="mb-6 pb-6 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <FaGoogle className="text-red-500 text-xl" />
            <h3 className="font-semibold text-gray-800">Google Rating</h3>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl font-bold text-green-600">
              {googleRating.toFixed(1)}
            </span>
            <div className="flex">
              {renderStars(googleRating)}
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Based on <span className="font-semibold">{googleReviewCount?.toLocaleString() || 0}</span> Google Reviews
          </p>
        </div>
      )}

      {/* Website Rating */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <FaStar className="text-blue-500 text-xl" />
          <h3 className="font-semibold text-gray-800">Our Website Rating</h3>
        </div>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl font-bold text-blue-600">
            {rating > 0 ? rating.toFixed(1) : '0.0'}
          </span>
          <div className="flex">
            {renderStars(rating || 0)}
          </div>
        </div>
        <p className="text-sm text-gray-600">
          Based on <span className="font-semibold">{totalReviews || 0}</span> {totalReviews === 1 ? 'Review' : 'Reviews'}
        </p>
        
        {totalReviews === 0 && (
          <p className="text-xs text-gray-500 mt-2 italic">
            Be the first to review!
          </p>
        )}
      </div>

      {/* Rating Breakdown (Optional - for future) */}
      {totalReviews > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Rating Distribution</h4>
          {[5, 4, 3, 2, 1].map((star) => (
            <div key={star} className="flex items-center gap-2 mb-2">
              <span className="text-xs text-gray-600 w-8">{star} ★</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: '0%' }}
                ></div>
              </div>
              <span className="text-xs text-gray-500 w-8">0</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RatingSummary;