import React, { useState } from 'react';
import { FaStar, FaRegStar, FaStarHalfAlt } from 'react-icons/fa';

const StarRating = ({ rating = 0, totalStars = 5, size = 'md', interactive = false, onRatingChange }) => {
  const [hoverRating, setHoverRating] = useState(0);
  
  const sizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };
  
  const handleClick = (value) => {
    if (interactive && onRatingChange) {
      onRatingChange(value);
    }
  };
  
  const handleMouseEnter = (value) => {
    if (interactive) {
      setHoverRating(value);
    }
  };
  
  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0);
    }
  };
  
  const renderStar = (index) => {
    const value = index + 1;
    const currentRating = hoverRating || rating;
    const isFilled = currentRating >= value;
    const isHalf = !isFilled && currentRating >= value - 0.5;
    
    return (
      <span
        key={index}
        className={`${interactive ? 'cursor-pointer' : ''} ${sizes[size]} transition-colors duration-200`}
        onClick={() => handleClick(value)}
        onMouseEnter={() => handleMouseEnter(value)}
        onMouseLeave={handleMouseLeave}
      >
        {isFilled ? (
          <FaStar className="text-yellow-400 inline" />
        ) : isHalf ? (
          <FaStarHalfAlt className="text-yellow-400 inline" />
        ) : (
          <FaRegStar className={`${interactive ? 'text-gray-400 hover:text-yellow-400' : 'text-gray-300'} inline`} />
        )}
      </span>
    );
  };
  
  return (
    <div className="inline-flex items-center gap-1">
      {[...Array(totalStars)].map((_, index) => renderStar(index))}
    </div>
  );
};

export default StarRating;