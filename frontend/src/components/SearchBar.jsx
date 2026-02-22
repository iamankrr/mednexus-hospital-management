import React, { useState } from 'react';
import { FaSearch, FaMapMarkerAlt } from 'react-icons/fa';
import { searchHistoryAPI } from '../services/api';
import SearchHistory from './SearchHistory';
import LocationSelector from './LocationSelector';

const SearchBar = ({ onSearch }) => {
  const [searchType, setSearchType] = useState('text');
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [pinCode, setPinCode] = useState('');
  
  // New States for Location Selector
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const [manualLocation, setManualLocation] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let searchPayload;

    if (searchType === 'pincode' && pinCode) {
      searchPayload = { 
        query: '', 
        location: '', 
        pinCode: pinCode.trim(),
        manualLocation: null
      };
    } else if (searchType === 'location' && manualLocation) {
      searchPayload = {
        query: '',
        location: '',
        pinCode: '',
        manualLocation: manualLocation
      };
    } else {
      searchPayload = { 
        query: query.trim(), 
        location: location.trim(), 
        pinCode: '',
        manualLocation: null
      };
    }

    // Save to search history (if logged in)
    const token = localStorage.getItem('token');
    if (token && (searchPayload.query || searchPayload.location || searchPayload.pinCode || searchPayload.manualLocation)) {
      try {
        await searchHistoryAPI.save({
          ...searchPayload,
          searchType,
          resultsCount: 0 // Will be updated after results
        });
      } catch (error) {
        console.error('Failed to save search history:', error);
        // Don't block search if history save fails
      }
    }

    // Proceed with search
    onSearch(searchPayload);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-4xl mx-auto">
      
      {/* Search Type Toggle */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <button
          type="button"
          onClick={() => {
            setSearchType('text');
            setPinCode('');
            setManualLocation(null);
          }}
          className={`py-2 px-3 rounded-lg font-semibold transition text-sm ${
            searchType === 'text'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          🔍 Search
        </button>
        <button
          type="button"
          onClick={() => {
            setSearchType('pincode');
            setQuery('');
            setLocation('');
            setManualLocation(null);
          }}
          className={`py-2 px-3 rounded-lg font-semibold transition text-sm ${
            searchType === 'pincode'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          📍 Pin Code
        </button>
        <button
          type="button"
          onClick={() => {
            setSearchType('location');
            setQuery('');
            setLocation('');
            setPinCode('');
            setShowLocationSelector(true);
          }}
          className={`py-2 px-3 rounded-lg font-semibold transition text-sm ${
            searchType === 'location'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          🗺️ Location
        </button>
      </div>

      {/* Location Selector Component */}
      {searchType === 'location' && (
        <div className="mb-4">
          <LocationSelector
            onLocationSelect={(loc) => {
              setManualLocation(loc);
              setShowLocationSelector(false);
            }}
            onClose={() => {
              setSearchType('text');
              setManualLocation(null);
            }}
          />
        </div>
      )}

      {/* Show selected location if exists */}
      {searchType === 'location' && manualLocation && !showLocationSelector && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-800">Selected Location:</p>
              <p className="text-sm text-green-700">
                {manualLocation.city && `${manualLocation.city}, `}
                {manualLocation.district && `${manualLocation.district}, `}
                {manualLocation.state}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowLocationSelector(true)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Change
            </button>
          </div>
        </div>
      )}

      {/* Search History */}
      <div className="mb-4">
        <SearchHistory 
          onSelectSearch={(searchData) => {
            setQuery(searchData.query || '');
            setLocation(searchData.location || '');
            setPinCode(searchData.pinCode || '');
            setSearchType(searchData.pinCode ? 'pincode' : 'text');
          }}
        />
      </div>

      <form onSubmit={handleSubmit}>
        {searchType === 'text' && (
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            {/* Query Input */}
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10 pointer-events-none" />
              <input
                type="text"
                placeholder="Search hospitals, labs, tests..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ 
                  color: '#000000', 
                  backgroundColor: '#ffffff', 
                  fontSize: '16px' 
                }}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
            
            {/* Location Input */}
            <div className="relative">
              <FaMapMarkerAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10 pointer-events-none" />
              <input
                type="text"
                placeholder="City, Area (e.g., Delhi, Saket)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                style={{ 
                  color: '#000000', 
                  backgroundColor: '#ffffff', 
                  fontSize: '16px' 
                }}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
          </div>
        )}

        {searchType === 'pincode' && (
          <div className="mb-4">
            {/* Pin Code Input */}
            <div className="relative">
              <FaMapMarkerAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10 pointer-events-none" />
              <input
                type="text"
                placeholder="Enter Pin Code (e.g., 110076)"
                value={pinCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, ''); // Only numbers
                  if (value.length <= 6) {
                    setPinCode(value);
                  }
                }}
                maxLength={6}
                style={{ 
                  color: '#000000', 
                  backgroundColor: '#ffffff', 
                  fontSize: '16px' 
                }}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">Enter 6-digit Indian pin code</p>
          </div>
        )}
        
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-200 font-semibold text-lg"
        >
          Search
        </button>
      </form>
    </div>
  );
};

export default SearchBar;