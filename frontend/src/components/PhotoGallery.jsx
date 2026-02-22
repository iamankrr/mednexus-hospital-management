import React, { useState } from 'react';
import { FaChevronLeft, FaChevronRight, FaTimes, FaExpand } from 'react-icons/fa';

const PhotoGallery = ({ images = [], name = 'Facility' }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showFullscreen, setShowFullscreen] = useState(false);

  if (!images || images.length === 0) {
    return (
      <div className="h-64 md:h-96 rounded-2xl flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
        <div className="text-center">
          <span className="text-6xl opacity-50">🏥</span>
          <p className="text-gray-500 mt-2 font-medium">No photos available</p>
        </div>
      </div>
    );
  }

  const goToPrevious = () => {
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <>
      {/* Main Gallery */}
      <div className="relative">
        {/* Main Image */}
        <div className="relative rounded-2xl overflow-hidden h-72 md:h-96 shadow-lg group">
          <img
            src={images[activeIndex]}
            alt={`${name} - Photo ${activeIndex + 1}`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition backdrop-blur-sm"
                aria-label="Previous image"
              >
                <FaChevronLeft />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition backdrop-blur-sm"
                aria-label="Next image"
              >
                <FaChevronRight />
              </button>
            </>
          )}

          {/* Image Counter */}
          <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
            {activeIndex + 1} / {images.length}
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={() => setShowFullscreen(true)}
            className="absolute bottom-4 left-4 bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white p-2.5 rounded-full transition"
            aria-label="View fullscreen"
          >
            <FaExpand />
          </button>
        </div>

        {/* Thumbnail Strip */}
        {images.length > 1 && (
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`relative flex-shrink-0 w-20 h-16 md:w-24 md:h-20 rounded-lg overflow-hidden transition-all ${
                  activeIndex === idx
                    ? 'ring-3 ring-blue-500 opacity-100 scale-105'
                    : 'opacity-60 hover:opacity-100'
                }`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                {activeIndex === idx && (
                  <div className="absolute inset-0 border-2 border-blue-500 rounded-lg" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {showFullscreen && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
          {/* Close Button */}
          <button
            onClick={() => setShowFullscreen(false)}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-3 rounded-full transition z-10"
          >
            <FaTimes className="text-xl" />
          </button>

          {/* Navigation in Fullscreen */}
          {images.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-4 rounded-full transition z-10"
              >
                <FaChevronLeft className="text-xl" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-4 rounded-full transition z-10"
              >
                <FaChevronRight className="text-xl" />
              </button>
            </>
          )}

          {/* Fullscreen Image */}
          <div className="max-w-7xl max-h-screen p-4">
            <img
              src={images[activeIndex]}
              alt={`${name} - Photo ${activeIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />
          </div>

          {/* Counter in Fullscreen */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-full text-sm font-medium">
            {activeIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
};

export default PhotoGallery;