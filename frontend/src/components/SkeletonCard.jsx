import React from 'react';

const SkeletonCard = () => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 flex flex-col h-full animate-pulse">
      {/* 🖼️ Image Placeholder */}
      <div className="h-48 bg-gray-200 w-full"></div>

      {/* 📝 Content Placeholder */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Title */}
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
        
        {/* Type Badge */}
        <div className="h-5 bg-gray-200 rounded-full w-1/3 mb-4"></div>

        {/* Ratings */}
        <div className="flex flex-col gap-2 mb-4">
          <div className="flex items-center gap-2">
            <div className="h-5 bg-gray-200 rounded w-12"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-5 bg-gray-200 rounded w-12"></div>
            <div className="h-4 bg-gray-200 rounded w-28"></div>
          </div>
        </div>

        {/* Address */}
        <div className="flex items-start gap-2 mb-4 h-10">
          <div className="h-4 w-4 bg-gray-200 rounded-full flex-shrink-0 mt-1"></div>
          <div className="flex flex-col gap-2 w-full">
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="mt-auto pt-4 border-t border-gray-100 flex gap-2">
          <div className="h-10 bg-gray-200 rounded-lg flex-1"></div>
          <div className="h-10 bg-gray-200 rounded-lg w-[46px]"></div>
          <div className="h-10 bg-gray-200 rounded-lg w-[46px]"></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;