import React, { useState } from 'react';
import { FaFilter, FaTimes, FaStar, FaAmbulance, FaMapMarkerAlt, FaSearch, FaTag } from 'react-icons/fa';
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
    minRating: initialFilters.minRating || '',
    emergency: initialFilters.emergency || false,
  });

  const handleApply = () => {
    onApplyFilters(filters);
    setShowPanel(false);
  };

  const handleReset = () => {
    const resetFilters = {
      state: '', city: '', keyword: '', pincode: '',
      type: 'all', minRating: '', emergency: false
    };
    setFilters(resetFilters);
    onApplyFilters(resetFilters);
  };

  // Count only meaningful active filters
  const activeFilterCount = [
    filters.state,
    filters.city,
    filters.keyword,
    filters.pincode,
    filters.type !== 'all' ? filters.type : '',
    filters.minRating,
    filters.emergency ? 'emergency' : '',
  ].filter(Boolean).length;

  const ratingLabels = { 1: 'Any', 2: 'Good', 3: 'Very Good', 4: 'Excellent', 5: 'Top Rated' };

  return (
    <div className="relative mb-6 z-40">

      {/* ── Trigger Button ── */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all shadow-sm ${
          showPanel
            ? 'bg-blue-700 text-white'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        <FaFilter className="text-sm" />
        <span>Filters</span>
        {activeFilterCount > 0 && (
          <span className="bg-white text-blue-600 px-2 py-0.5 rounded-full text-xs font-bold min-w-[20px] text-center">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* ── Active filter pills (shown below button) ── */}
      {activeFilterCount > 0 && !showPanel && (
        <div className="flex flex-wrap gap-2 mt-3">
          {filters.city && (
            <span className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-100">
              <FaMapMarkerAlt className="text-[10px]" /> {filters.city}
              <button onClick={() => { const f = {...filters, city: '', state: ''}; setFilters(f); onApplyFilters(f); }} className="ml-1 hover:text-red-500">×</button>
            </span>
          )}
          {filters.keyword && (
            <span className="flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded-full border border-purple-100">
              <FaSearch className="text-[10px]" /> {filters.keyword}
              <button onClick={() => { const f = {...filters, keyword: ''}; setFilters(f); onApplyFilters(f); }} className="ml-1 hover:text-red-500">×</button>
            </span>
          )}
          {filters.type && filters.type !== 'all' && (
            <span className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-100">
              <FaTag className="text-[10px]" /> {filters.type}
              <button onClick={() => { const f = {...filters, type: 'all'}; setFilters(f); onApplyFilters(f); }} className="ml-1 hover:text-red-500">×</button>
            </span>
          )}
          {filters.minRating && (
            <span className="flex items-center gap-1 px-3 py-1 bg-yellow-50 text-yellow-700 text-xs font-semibold rounded-full border border-yellow-100">
              <FaStar className="text-[10px]" /> {filters.minRating}+ stars
              <button onClick={() => { const f = {...filters, minRating: ''}; setFilters(f); onApplyFilters(f); }} className="ml-1 hover:text-red-500">×</button>
            </span>
          )}
          {filters.emergency && (
            <span className="flex items-center gap-1 px-3 py-1 bg-red-50 text-red-700 text-xs font-semibold rounded-full border border-red-100">
              <FaAmbulance className="text-[10px]" /> Emergency
              <button onClick={() => { const f = {...filters, emergency: false}; setFilters(f); onApplyFilters(f); }} className="ml-1 hover:text-red-500">×</button>
            </span>
          )}
          <button
            onClick={handleReset}
            className="px-3 py-1 text-xs text-gray-500 hover:text-red-500 font-semibold underline underline-offset-2 transition"
          >
            Clear all
          </button>
        </div>
      )}

      {/* ── Filter Panel ── */}
      {showPanel && (
        <>
          {/* Backdrop — click to close */}
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]"
            onClick={() => setShowPanel(false)}
          />

          <div className="absolute top-full left-0 w-full sm:w-[480px] mt-3 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col z-50 overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-gray-800">Advanced Filters</h3>
                {activeFilterCount > 0 && (
                  <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {activeFilterCount} active
                  </span>
                )}
              </div>
              <button
                onClick={() => setShowPanel(false)}
                className="text-gray-400 hover:text-red-500 p-1.5 rounded-full hover:bg-gray-100 transition"
              >
                <FaTimes />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto max-h-[65vh] scroll-smooth">

              {/* ── Section: Location ── */}
              <div className="px-5 py-4 border-b border-gray-50">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  📍 Location
                </h4>
                <CityStateSelector
                  selectedState={filters.state}
                  selectedCity={filters.city}
                  onStateChange={(val) => setFilters({ ...filters, state: val })}
                  onCityChange={(val) => setFilters({ ...filters, city: val })}
                />
                <div className="mt-3">
                  <PinCodeSearch
                    value={filters.pincode}
                    onChange={(val) => setFilters({ ...filters, pincode: val })}
                  />
                </div>
              </div>

              {/* ── Section: Search ── */}
              <div className="px-5 py-4 border-b border-gray-50">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  🔎 Keyword Search
                </h4>
                <KeywordSearch
                  value={filters.keyword}
                  onChange={(val) => setFilters({ ...filters, keyword: val })}
                />
              </div>

              {/* ── Section: Facility Type ── */}
              <div className="px-5 py-4 border-b border-gray-50">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  {facilityType === 'laboratory' ? '🔬 Lab Type' : '🏥 Hospital Type'}
                </h4>
                <HospitalTypeFilter
                  selected={filters.type}
                  onChange={(val) => setFilters({ ...filters, type: val })}
                  facilityType={facilityType}
                />
              </div>

              {/* ── Section: Rating ── */}
              <div className="px-5 py-4 border-b border-gray-50">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  ⭐ Minimum Rating
                </h4>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map(rating => (
                    <button
                      key={rating}
                      onClick={() => setFilters({
                        ...filters,
                        minRating: filters.minRating === rating.toString() ? '' : rating.toString()
                      })}
                      className={`flex flex-col items-center py-2.5 px-1 rounded-xl font-medium transition-all text-xs ${
                        filters.minRating === rating.toString()
                          ? 'bg-yellow-400 text-white shadow-md scale-105'
                          : 'bg-gray-100 text-gray-600 hover:bg-yellow-50 hover:text-yellow-700'
                      }`}
                    >
                      <span className="text-base font-bold">{rating}+</span>
                      <span className="text-[10px] mt-0.5 leading-tight text-center">
                        {ratingLabels[rating]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Section: Emergency ── */}
              <div className="px-5 py-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  🚨 Availability
                </h4>
                <label className={`flex items-center gap-3 cursor-pointer p-3.5 rounded-xl border-2 transition-all ${
                  filters.emergency
                    ? 'border-red-400 bg-red-50'
                    : 'border-gray-200 bg-gray-50 hover:border-red-200'
                }`}>
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                    filters.emergency ? 'bg-red-500 border-red-500' : 'border-gray-300'
                  }`}>
                    {filters.emergency && <span className="text-white text-xs font-bold">✓</span>}
                  </div>
                  <input
                    type="checkbox"
                    checked={filters.emergency}
                    onChange={(e) => setFilters({ ...filters, emergency: e.target.checked })}
                    className="hidden"
                  />
                  <div>
                    <p className="font-bold text-gray-800 text-sm flex items-center gap-2">
                      <FaAmbulance className={filters.emergency ? 'text-red-500' : 'text-gray-400'} />
                      24/7 Emergency Available
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">Show only facilities with round-the-clock emergency</p>
                  </div>
                </label>
              </div>
            </div>

            {/* ── Footer Actions ── */}
            <div className="flex gap-3 px-5 py-4 border-t border-gray-100 bg-gray-50">
              <button
                onClick={handleReset}
                className="flex-1 py-2.5 border-2 border-gray-200 rounded-xl text-gray-600 font-bold hover:bg-white hover:border-gray-300 transition text-sm"
              >
                Reset All
              </button>
              <button
                onClick={handleApply}
                className="flex-2 px-8 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-sm transition text-sm"
              >
                Apply {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdvancedFilterPanel;