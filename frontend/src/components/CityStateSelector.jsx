import React, { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaChevronDown } from 'react-icons/fa';

// Indian States with major cities
const STATES_CITIES = {
  'Delhi': ['New Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi', 'Central Delhi'],
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Aurangabad'],
  'Karnataka': ['Bangalore', 'Mysore', 'Mangalore', 'Hubli', 'Belgaum'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Trichy', 'Salem'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Meerut', 'Noida', 'Ghaziabad'],
  'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Siliguri'],
  'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad'],
  'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Tirupati'],
  'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur'],
  'Madhya Pradesh': ['Bhopal', 'Indore', 'Gwalior', 'Jabalpur'],
  'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur'],
  'Punjab': ['Chandigarh', 'Ludhiana', 'Amritsar', 'Jalandhar'],
  'Haryana': ['Gurugram', 'Faridabad', 'Ghaziabad', 'Panipat'],
  'Odisha': ['Bhubaneswar', 'Cuttack', 'Rourkela'],
  'Assam': ['Guwahati', 'Silchar', 'Dibrugarh'],
  'Jharkhand': ['Ranchi', 'Jamshedpur', 'Dhanbad'],
  'Uttarakhand': ['Dehradun', 'Haridwar', 'Roorkee'],
  'Himachal Pradesh': ['Shimla', 'Dharamshala', 'Manali'],
  'Jammu and Kashmir': ['Srinagar', 'Jammu'],
  'Goa': ['Panaji', 'Margao', 'Vasco da Gama'],
};

const CityStateSelector = ({ 
  selectedState, 
  selectedCity, 
  onStateChange, 
  onCityChange,
  showLabel = true 
}) => {
  const [cities, setCities] = useState([]);

  useEffect(() => {
    if (selectedState && STATES_CITIES[selectedState]) {
      setCities(STATES_CITIES[selectedState]);
      // Reset city if state changes
      if (selectedCity && !STATES_CITIES[selectedState].includes(selectedCity)) {
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
            {Object.keys(STATES_CITIES).sort().map((state) => (
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
            City
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
            <option value="">Select City</option>
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

export { STATES_CITIES };
export default CityStateSelector;