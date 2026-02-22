import React from 'react';
import StarRating from './StarRating';
import { FaThumbsUp, FaUserCircle } from 'react-icons/fa';

const ReviewCard = ({ review, onHelpful }) => {
  const formatDate = (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-300">
      
      {/* User Info & Rating */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {review.user?.avatar ? (
            <img
              src={review.user.avatar}
              alt={review.user.name}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <FaUserCircle className="w-12 h-12 text-gray-400" />
          )}
          <div>
            <h4 className="font-semibold text-gray-800">
              {review.user?.name || 'Anonymous'}
            </h4>
            <p className="text-sm text-gray-500">
              {formatDate(review.createdAt)}
            </p>
          </div>
        </div>
        
        <StarRating rating={review.rating} size="md" />
      </div>

      {/* Review Title */}
      {review.title && (
        <h5 className="font-semibold text-lg text-gray-800 mb-2">
          {review.title}
        </h5>
      )}

      {/* Review Comment */}
      <p className="text-gray-600 leading-relaxed mb-4">
        {review.comment}
      </p>

      {/* Admin Response */}
      {review.adminResponse && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
          <p className="text-sm font-semibold text-blue-800 mb-1">
            Response from Management:
          </p>
          <p className="text-sm text-blue-700">
            {review.adminResponse}
          </p>
        </div>
      )}

      {/* Helpful Button */}
      <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
        <button
          onClick={() => onHelpful && onHelpful(review._id)}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition duration-200"
        >
          <FaThumbsUp />
          <span className="text-sm">
            Helpful ({review.helpful || 0})
          </span>
        </button>
      </div>
    </div>
  );
};

export default ReviewCard;