import React, { useState, useEffect } from 'react';
import { FaChevronDown } from 'react-icons/fa';
// ✅ Import the comprehensive data we just created
import { indianStatesAndCities } from '../data/indianCities';

const CityStateSelector = ({ 
  selectedState, 
  selectedCity, 
  onStateChange, 
  onCityChange,
  showLabel = true 
}) => {
  const [cities, setCities] = useState([]);

  useEffect(() => {
    if (selectedState && indianStatesAndCities[selectedState]) {
      // Sort cities alphabetically for easy finding
      setCities([...indianStatesAndCities[selectedState]].sort());
      
      // Reset city if state changes and the city doesn't belong to the new state
      if (selectedCity && !indianStatesAndCities[selectedState].includes(selectedCity)) {
        onCityChange('');
      }
    } else {
      setCities([]);
    }
  }, [selectedState]);

  return (
    <div className="flex flex-col md:flex-row gap-3">
      {/* State Selector */}
      <div className="flex-1">
        {showLabel && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            State
          </label>
        )}
        <div className="relative">
          <select
            value={selectedState}
            onChange={(e) => onStateChange(e.target.value)}
            className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-gray-800 cursor-pointer"
          >
            <option value="">Select State</option>
            {Object.keys(indianStatesAndCities).sort().map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
          <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* City Selector */}
      <div className="flex-1">
        {showLabel && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City / District
          </label>
        )}
        <div className="relative">
          <select
            value={selectedCity}
            onChange={(e) => onCityChange(e.target.value)}
            disabled={!selectedState}
            className={`w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-gray-800 ${
              !selectedState ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            }`}
          >
            <option value="">Select City/District</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};

export default CityStateSelector;