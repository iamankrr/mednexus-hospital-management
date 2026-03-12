import React, { useState } from 'react';
import { FaFilter, FaTimes, FaRupeeSign, FaStar } from 'react-icons/fa';
import CityStateSelector from './CityStateSelector';
import KeywordSearch from './KeywordSearch';
import PinCodeSearch from './PinCodeSearch';
import HospitalTypeFilter from './HospitalTypeFilter';

const AdvancedFilterPanel = ({ onApplyFilters, initialFilters = {}, facilityType = 'hospital' }) => {
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
    // ✅ FIX: Added relative and z-40 so the absolute dropdown positions relative to this button
    <div className="relative mb-6 z-40">
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

      {/* Filter Panel Overlay */}
      {/* ✅ FIX: Made absolute with top-full so it hovers OVER the cards, preventing weird page scrolling */}
      {showPanel && (
        <div className="absolute top-full left-0 w-full mt-4 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50">
          
          {/* Header - Sticky */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50 rounded-t-2xl">
            <h3 className="text-lg font-bold text-gray-800">🔍 Search Filters</h3>
            <button
              onClick={() => setShowPanel(false)}
              className="text-gray-400 hover:text-red-500 bg-white p-2 rounded-full shadow-sm transition"
            >
              <FaTimes className="text-lg" />
            </button>
          </div>

          {/* Scrollable Content Body - Smooth internal scroll */}
          <div className="p-6 space-y-8 max-h-[60vh] overflow-y-auto scroll-smooth">
            
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

            {/* Facility Type */}
            <div>
              <h4 className="font-semibold text-gray-700 mb-3">
                {facilityType === 'laboratory' ? '🔬 Laboratory Type' : '🏥 Hospital Type'}
              </h4>
              <div className="w-full">
                <HospitalTypeFilter
                  selected={filters.type}
                  onChange={(val) => setFilters({ ...filters, type: val })}
                  facilityType={facilityType}
                />
              </div>
            </div>

            {/* Rating Filter */}
            <div>
              <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <FaStar className="text-yellow-400" /> Minimum Rating
              </h4>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map(rating => (
                  <button
                    key={rating}
                    onClick={() => setFilters({ ...filters, minRating: rating.toString() })}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      filters.minRating === rating.toString()
                        ? 'bg-yellow-400 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {rating}+ ⭐
                  </button>
                ))}
              </div>
            </div>

            {/* Emergency Filter */}
            <div className="pt-2">
              <label className="flex items-center gap-3 cursor-pointer p-3 border border-red-100 bg-red-50 rounded-xl">
                <input
                  type="checkbox"
                  checked={filters.emergency}
                  onChange={(e) => setFilters({ ...filters, emergency: e.target.checked })}
                  className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <span className="font-bold text-red-700">🚨 24/7 Emergency Available Only</span>
              </label>
            </div>
          </div>

          {/* Action Buttons - Sticky at Bottom */}
          <div className="flex gap-3 p-6 border-t border-gray-100 bg-white rounded-b-2xl">
            <button
              onClick={handleReset}
              className="flex-1 px-6 py-3 border-2 border-gray-200 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition"
            >
              Reset All
            </button>
            <button
              onClick={handleApply}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-md transition"
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