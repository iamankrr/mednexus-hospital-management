import React, { useState } from 'react';
import { FaMapMarkerAlt, FaChevronDown, FaSpinner } from 'react-icons/fa';
import { useLocation } from '../context/LocationContext';

const LocationDisplay = () => {
  const { userAddress, getUserLocation, loading, userLocation } = useLocation();
  const [showMenu, setShowMenu] = useState(false);

  const handleDetectLocation = () => {
    console.log('🔄 Detect location clicked!');
    getUserLocation();
    // Don't close menu - show loading state
  };

  const handleCloseMenu = () => {
    setShowMenu(false);
  };

  return (
    <div className="relative">

      {/* Location Button */}
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg transition border border-red-200 bg-red-50 hover:bg-red-100"
      >
        {loading ? (
          <FaSpinner className="text-red-500 text-lg animate-spin" />
        ) : (
          <FaMapMarkerAlt className="text-red-500 text-lg" />
        )}

        <div className="text-left hidden md:block max-w-[160px]">
          <p className="text-xs text-red-600 font-medium leading-none mb-1">
            Your Location
          </p>
          <p
            className="text-sm font-bold text-gray-800 truncate"
            style={{ maxWidth: '160px' }}
          >
            {loading ? 'Detecting...' : (userAddress || 'Set location')}
          </p>
        </div>

        <FaChevronDown className="text-red-400 text-xs" />
      </button>

      {/* Dropdown */}
      {showMenu && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40"
            onClick={handleCloseMenu}
          />

          {/* Menu */}
          <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-orange-500 p-4">
              <div className="flex items-center gap-3">
                <FaMapMarkerAlt className="text-white text-2xl" />
                <div>
                  <p className="text-white font-bold text-lg">Your Location</p>
                  <p className="text-red-100 text-sm">
                    {loading ? 'Detecting...' : (userAddress || 'Not detected')}
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">

              {/* Current Location */}
              {userLocation && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                  <p className="text-xs text-green-600 font-medium mb-1">
                    ✅ Location Detected
                  </p>
                  <p className="text-sm text-green-800 font-semibold">
                    {userAddress}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Lat: {userLocation.latitude?.toFixed(4)}, 
                    Lng: {userLocation.longitude?.toFixed(4)}
                  </p>
                </div>
              )}

              {/* Detect Button */}
              <button
                onClick={handleDetectLocation}
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg font-bold text-white transition flex items-center justify-center gap-3 ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                }`}
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Detecting Location...
                  </>
                ) : (
                  <>
                    <FaMapMarkerAlt />
                    {userLocation ? 'Update Location' : 'Detect My Location'}
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 mt-3 text-center">
                We'll show hospitals & labs nearest to you
              </p>

              {/* Permission Help */}
              {!userLocation && !loading && (
                <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-xs text-yellow-800 font-medium mb-1">
                    📌 Location Not Set?
                  </p>
                  <p className="text-xs text-yellow-700">
                    Click "Detect My Location" and allow location permission when browser asks.
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LocationDisplay;
