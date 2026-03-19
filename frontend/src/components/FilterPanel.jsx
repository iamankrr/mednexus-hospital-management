import React, { useState, useEffect } from 'react';
import { FaStar, FaMapMarkerAlt, FaTimes, FaFilter, FaAmbulance } from 'react-icons/fa';

const FilterPanel = ({ onFilterChange, availableFacilities = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    minRating: 0,
    maxDistance: 50,
    emergencyOnly: false,
    selectedFacilities: [],
    selectedSpecializations: []
  });

  // Lock body scroll when drawer open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleFilterChange = (filterName, value) => {
    const updated = { ...filters, [filterName]: value };
    setFilters(updated);
    onFilterChange(updated);
  };

  const handleReset = () => {
    const def = {
      minRating: 0,
      maxDistance: 50,
      emergencyOnly: false,
      selectedFacilities: [],
      selectedSpecializations: []
    };
    setFilters(def);
    onFilterChange(def);
  };

  const activeCount =
    (filters.minRating > 0 ? 1 : 0) +
    (filters.maxDistance < 50 ? 1 : 0) +
    (filters.emergencyOnly ? 1 : 0) +
    (filters.selectedFacilities.length > 0 ? 1 : 0) +
    (filters.selectedSpecializations.length > 0 ? 1 : 0);

  const specializations = ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'General', 'Gynecology', 'Dermatology', 'ENT'];

  const ratingLabels = { 1: 'Any', 2: 'Good', 3: 'Very Good', 4: 'Excellent', 5: 'Top' };

  // ── Panel content (shared between desktop sidebar and mobile drawer)
  const PanelContent = () => (
    <>
      {/* Rating */}
      <div className="mb-6">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <FaStar className="text-yellow-400" /> Minimum Rating
        </h3>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleFilterChange('minRating', 0)}
            className={`py-2 rounded-xl text-xs font-semibold transition-all ${
              filters.minRating === 0
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {[2, 3, 4, 5].map(r => (
            <button
              key={r}
              onClick={() => handleFilterChange('minRating', filters.minRating === r ? 0 : r)}
              className={`py-2 rounded-xl text-xs font-semibold transition-all flex flex-col items-center gap-0.5 ${
                filters.minRating === r
                  ? 'bg-yellow-400 text-white shadow-sm scale-105'
                  : 'bg-gray-100 text-gray-600 hover:bg-yellow-50 hover:text-yellow-700'
              }`}
            >
              <span className="font-bold">{r}+⭐</span>
              <span className="text-[10px] opacity-80">{ratingLabels[r]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Distance */}
      <div className="mb-6">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <FaMapMarkerAlt className="text-blue-500" /> Max Distance
        </h3>
        <input
          type="range"
          min="1"
          max="50"
          step="1"
          value={filters.maxDistance}
          onChange={(e) => handleFilterChange('maxDistance', parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex justify-between mt-2 text-xs text-gray-400">
          <span>1 km</span>
          <span className="text-blue-600 font-bold text-sm">{filters.maxDistance} km</span>
          <span>50 km</span>
        </div>
      </div>

      {/* Emergency */}
      <div className="mb-6">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <FaAmbulance className="text-red-400" /> Availability
        </h3>
        <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
          filters.emergencyOnly ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-red-200'
        }`}>
          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
            filters.emergencyOnly ? 'bg-red-500 border-red-500' : 'border-gray-300'
          }`}>
            {filters.emergencyOnly && <span className="text-white text-xs font-bold">✓</span>}
          </div>
          <input
            type="checkbox"
            className="hidden"
            checked={filters.emergencyOnly}
            onChange={(e) => handleFilterChange('emergencyOnly', e.target.checked)}
          />
          <div>
            <p className="text-sm font-bold text-gray-800">24/7 Emergency Only</p>
            <p className="text-xs text-gray-500">Round-the-clock emergency care</p>
          </div>
        </label>
      </div>

      {/* Specialization */}
      <div className="mb-6">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
          🏥 Specialization
        </h3>
        <div className="flex flex-wrap gap-2">
          {specializations.map(spec => {
            const active = filters.selectedSpecializations.includes(spec);
            return (
              <button
                key={spec}
                onClick={() => {
                  const updated = active
                    ? filters.selectedSpecializations.filter(s => s !== spec)
                    : [...filters.selectedSpecializations, spec];
                  handleFilterChange('selectedSpecializations', updated);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  active
                    ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300 hover:text-purple-600'
                }`}
              >
                {spec}
              </button>
            );
          })}
        </div>
      </div>

      {/* Facilities */}
      {availableFacilities.length > 0 && (
        <div className="mb-2">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            🏨 Facilities
          </h3>
          <div className="flex flex-wrap gap-2">
            {availableFacilities.slice(0, 12).map(facility => {
              const active = filters.selectedFacilities.includes(facility);
              return (
                <button
                  key={facility}
                  onClick={() => {
                    const updated = active
                      ? filters.selectedFacilities.filter(f => f !== facility)
                      : [...filters.selectedFacilities, facility];
                    handleFilterChange('selectedFacilities', updated);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    active
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                  }`}
                >
                  {facility}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* ── Mobile: Filter trigger button ── */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm font-semibold text-gray-700 hover:border-blue-400 hover:text-blue-600 transition-all"
        >
          <FaFilter className="text-sm" />
          <span>Filters</span>
          {activeCount > 0 && (
            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {/* ── Mobile: Drawer overlay ── */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer — slides from bottom */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl flex flex-col"
            style={{ maxHeight: '85vh' }}>

            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-800 text-base">Filters</span>
                {activeCount > 0 && (
                  <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {activeCount} active
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {activeCount > 0 && (
                  <button onClick={handleReset} className="text-sm text-red-500 font-semibold hover:underline">
                    Reset
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            {/* Scrollable filter content */}
            <div className="overflow-y-auto flex-1 px-5 py-4">
              <PanelContent />
            </div>

            {/* Drawer footer */}
            <div className="px-5 py-4 border-t border-gray-100 shrink-0"
              style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
              <button
                onClick={() => setIsOpen(false)}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition shadow-sm"
              >
                Show Results {activeCount > 0 ? `(${activeCount} filters applied)` : ''}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Desktop: Sticky sidebar ── */}
      <div className="hidden lg:block bg-white rounded-2xl shadow-md p-5 sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-gray-800 text-lg flex items-center gap-2">
            <FaFilter className="text-blue-500 text-sm" /> Filters
            {activeCount > 0 && (
              <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {activeCount}
              </span>
            )}
          </h2>
          {activeCount > 0 && (
            <button onClick={handleReset} className="text-sm text-red-500 font-semibold hover:underline">
              Reset All
            </button>
          )}
        </div>
        <PanelContent />
      </div>
    </>
  );
};

export default FilterPanel;