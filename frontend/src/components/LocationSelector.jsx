import React, { useState, useEffect } from 'react';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { locationAPI } from '../services/api';

const LocationSelector = ({ onLocationSelect, onClose }) => {
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);
  
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  
  const [loading, setLoading] = useState(false);

  // Fetch states on mount
  useEffect(() => {
    fetchStates();
  }, []);

  const fetchStates = async () => {
    try {
      setLoading(true);
      const response = await locationAPI.getStates();
      if (response.data.success) {
        setStates(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching states:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStateChange = async (state) => {
    setSelectedState(state);
    setSelectedDistrict('');
    setSelectedCity('');
    setDistricts([]);
    setCities([]);

    if (!state) return;

    try {
      setLoading(true);
      const response = await locationAPI.getDistricts(state);
      if (response.data.success) {
        setDistricts(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching districts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDistrictChange = async (district) => {
    setSelectedDistrict(district);
    setSelectedCity('');
    setCities([]);

    if (!district) return;

    try {
      setLoading(true);
      const response = await locationAPI.getCities(selectedState, district);
      if (response.data.success) {
        setCities(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCityChange = (city) => {
    setSelectedCity(city);
  };

  const handleApply = () => {
    if (!selectedState) {
      alert('Please select a state');
      return;
    }

    onLocationSelect({
      state: selectedState,
      district: selectedDistrict,
      city: selectedCity
    });
  };

  const handleReset = () => {
    setSelectedState('');
    setSelectedDistrict('');
    setSelectedCity('');
    setDistricts([]);
    setCities([]);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <FaMapMarkerAlt className="text-blue-500" />
          Select Location
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        )}
      </div>

      <div className="space-y-4">
        
        {/* State Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            State *
          </label>
          <select
            value={selectedState}
            onChange={(e) => handleStateChange(e.target.value)}
            disabled={loading}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            style={{ color: '#1f2937', fontSize: '16px' }}
          >
            <option value="">-- Select State --</option>
            {states.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>

        {/* District Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            District {selectedState && '*'}
          </label>
          <select
            value={selectedDistrict}
            onChange={(e) => handleDistrictChange(e.target.value)}
            disabled={!selectedState || districts.length === 0 || loading}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
            style={{ color: '#1f2937', fontSize: '16px' }}
          >
            <option value="">-- Select District --</option>
            {districts.map(district => (
              <option key={district} value={district}>{district}</option>
            ))}
          </select>
          {selectedState && districts.length === 0 && !loading && (
            <p className="text-xs text-gray-500 mt-1">Loading districts...</p>
          )}
        </div>

        {/* City Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            City/Area (Optional)
          </label>
          <select
            value={selectedCity}
            onChange={(e) => handleCityChange(e.target.value)}
            disabled={!selectedDistrict || cities.length === 0 || loading}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
            style={{ color: '#1f2937', fontSize: '16px' }}
          >
            <option value="">-- All Areas --</option>
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
          {selectedDistrict && cities.length === 0 && !loading && (
            <p className="text-xs text-gray-500 mt-1">Loading areas...</p>
          )}
        </div>

        {/* Selected Location Preview */}
        {selectedState && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm font-medium text-blue-800">
              Selected Location:
            </p>
            <p className="text-sm text-blue-700">
              {selectedCity && `${selectedCity}, `}
              {selectedDistrict && `${selectedDistrict}, `}
              {selectedState}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={handleApply}
            disabled={!selectedState}
            className={`flex-1 py-3 rounded-lg font-semibold transition ${
              selectedState
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Apply Location
          </button>
          <button
            onClick={handleReset}
            className="px-6 py-3 rounded-lg font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationSelector;