import React, { useState } from 'react';
import { FaFilter, FaTimes, FaRupeeSign, FaStar } from 'react-icons/fa';
import CityStateSelector from './CityStateSelector';
import KeywordSearch from './KeywordSearch';
import PinCodeSearch from './PinCodeSearch';
import HospitalTypeFilter from './HospitalTypeFilter';

const AdvancedFilterPanel = ({ onApplyFilters, initialFilters = {} }) => {
  const [showPanel, setShowPanel] = useState(false);
  const [filters, setFilters] = useState({
    state: initialFilters.state || '',
    city: initialFilters.city || '',
    keyword: initialFilters.keyword || '',
    pincode: initialFilters.pincode || '',
    type: initialFilters.type || 'all',
    minPrice: initialFilters.minPrice || '',
    maxPrice: initialFilters.maxPrice || '',
    minRating: initialFilters.minRating || '',
    emergency: initialFilters.emergency || false,
  });

  const handleApply = () => {
    onApplyFilters(filters);
    setShowPanel(false);
  };

  const handleReset = () => {
    const resetFilters = {
      state: '', city: '', keyword: '', pincode: '', type: 'all',
      minPrice: '', maxPrice: '', minRating: '', emergency: false
    };
    setFilters(resetFilters);
    onApplyFilters(resetFilters);
  };

  const activeFilterCount = Object.values(filters).filter(v => 
    v && v !== 'all' && v !== false
  ).length;

  return (
    <div className="mb-6">
      {/* Filter Button */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium"
      >
        <FaFilter />
        Advanced Filters
        {activeFilterCount > 0 && (
          <span className="bg-white text-blue-600 px-2 py-0.5 rounded-full text-xs font-bold">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Filter Panel */}
      {showPanel && (
        <div className="mt-4 bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-800">🔍 Search Filters</h3>
            <button
              onClick={() => setShowPanel(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Location Filters */}
            <div>
              <h4 className="font-semibold text-gray-700 mb-3">📍 Location</h4>
              <CityStateSelector
                selectedState={filters.state}
                selectedCity={filters.city}
                onStateChange={(val) => setFilters({ ...filters, state: val })}
                onCityChange={(val) => setFilters({ ...filters, city: val })}
              />
            </div>

            {/* PIN Code */}
            <div>
              <h4 className="font-semibold text-gray-700 mb-3">📮 PIN Code</h4>
              <PinCodeSearch
                value={filters.pincode}
                onChange={(val) => setFilters({ ...filters, pincode: val })}
              />
            </div>

            {/* Keyword Search */}
            <div>
              <h4 className="font-semibold text-gray-700 mb-3">🔎 Keyword</h4>
              <KeywordSearch
                value={filters.keyword}
                onChange={(val) => setFilters({ ...filters, keyword: val })}
              />
            </div>

            {/* Hospital Type */}
            <div>
              <h4 className="font-semibold text-gray-700 mb-3">🏥 Hospital Type</h4>
              <HospitalTypeFilter
                selected={filters.type}
                onChange={(val) => setFilters({ ...filters, type: val })}
              />
            </div>

            {/* Price Range */}
            <div>
              <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <FaRupeeSign /> Price Range
              </h4>
              <div className="flex gap-3">
                <input
                  type="number"
                  placeholder="Min ₹"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-800"
                />
                <span className="flex items-center text-gray-400">to</span>
                <input
                  type="number"
                  placeholder="Max ₹"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-800"
                />
              </div>
            </div>

            {/* Rating Filter */}
            <div>
              <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <FaStar className="text-yellow-400" /> Minimum Rating
              </h4>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(rating => (
                  <button
                    key={rating}
                    onClick={() => setFilters({ ...filters, minRating: rating.toString() })}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      filters.minRating === rating.toString()
                        ? 'bg-yellow-400 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {rating}+ ⭐
                  </button>
                ))}
              </div>
            </div>

            {/* Emergency Filter */}
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.emergency}
                  onChange={(e) => setFilters({ ...filters, emergency: e.target.checked })}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="font-medium text-gray-700">🚨 24/7 Emergency Available Only</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleReset}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition"
            >
              Reset All
            </button>
            <button
              onClick={handleApply}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedFilterPanel;