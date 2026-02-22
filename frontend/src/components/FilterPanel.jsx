import React, { useState } from 'react';
import { FaStar, FaMapMarkerAlt } from 'react-icons/fa';

const FilterPanel = ({ onFilterChange, availableFacilities = [] }) => {
  const [filters, setFilters] = useState({
    minRating: 0,
    maxDistance: 50,
    emergencyOnly: false,
    selectedFacilities: [],
    minBudget: 0,
    maxBudget: 10000,
    selectedSpecializations: []
  });

  const handleFilterChange = (filterName, value) => {
    const updatedFilters = {
      ...filters,
      [filterName]: value
    };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const handleResetFilters = () => {
    const defaultFilters = {
      minRating: 0,
      maxDistance: 50,
      emergencyOnly: false,
      selectedFacilities: [],
      minBudget: 0,
      maxBudget: 10000,
      selectedSpecializations: []
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  const activeFiltersCount = 
    (filters.minRating > 0 ? 1 : 0) +
    (filters.maxDistance < 50 ? 1 : 0) +
    (filters.emergencyOnly ? 1 : 0) +
    (filters.selectedFacilities.length > 0 ? 1 : 0) +
    (filters.minBudget > 0 || filters.maxBudget < 10000 ? 1 : 0) +
    (filters.selectedSpecializations.length > 0 ? 1 : 0);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Filters</h2>
        <button
          onClick={handleResetFilters}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Reset All
        </button>
      </div>

      {/* Rating Filter */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <FaStar className="text-yellow-500" /> Minimum Rating
        </h3>
        <div className="space-y-2">
          {[0, 1, 2, 3, 4, 5].map(rating => (
            <label key={rating} className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="rating"
                checked={filters.minRating === rating}
                onChange={() => handleFilterChange('minRating', rating)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="ml-2 text-sm text-gray-700">
                {rating === 0 ? 'All' : `${rating}★ & up`}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Distance Filter */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <FaMapMarkerAlt className="text-blue-500" /> Max Distance
        </h3>
        <div className="space-y-2">
          <input
            type="range"
            min="1"
            max="50"
            value={filters.maxDistance}
            onChange={(e) => handleFilterChange('maxDistance', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="text-center text-sm font-semibold text-blue-600">
            {filters.maxDistance} km
          </div>
        </div>
      </div>

      {/* Emergency Services */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <span className="text-red-500">🚨</span> Emergency Services
        </h3>
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={filters.emergencyOnly}
            onChange={(e) => handleFilterChange('emergencyOnly', e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded"
          />
          <span className="ml-2 text-sm text-gray-700">24/7 Emergency Available</span>
        </label>
      </div>

      {/* Budget Range */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <span className="text-green-500">💰</span> Budget Range
        </h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-600 block mb-1">Min Budget: ₹{filters.minBudget}</label>
            <input
              type="range"
              min="0"
              max="10000"
              step="100"
              value={filters.minBudget}
              onChange={(e) => handleFilterChange('minBudget', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600 block mb-1">Max Budget: ₹{filters.maxBudget}</label>
            <input
              type="range"
              min="0"
              max="10000"
              step="100"
              value={filters.maxBudget}
              onChange={(e) => handleFilterChange('maxBudget', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <div className="text-center text-sm font-semibold text-green-600 bg-green-50 py-2 rounded">
            ₹{filters.minBudget} - ₹{filters.maxBudget}
          </div>
        </div>
      </div>

      {/* Specialization Filter */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <span className="text-purple-500">🏥</span> Specialization
        </h3>
        <div className="space-y-2">
          {['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'General'].map(spec => (
            <label key={spec} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.selectedSpecializations?.includes(spec)}
                onChange={(e) => {
                  const current = filters.selectedSpecializations || [];
                  const updated = e.target.checked
                    ? [...current, spec]
                    : current.filter(s => s !== spec);
                  handleFilterChange('selectedSpecializations', updated);
                }}
                className="w-4 h-4 text-purple-600 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">{spec}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Facilities Filter */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-700 mb-3">Facilities</h3>
        <div className="space-y-2">
          {availableFacilities.length > 0 ? (
            availableFacilities.slice(0, 10).map(facility => (
              <label key={facility} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.selectedFacilities.includes(facility)}
                  onChange={(e) => {
                    const updated = e.target.checked
                      ? [...filters.selectedFacilities, facility]
                      : filters.selectedFacilities.filter(f => f !== facility);
                    handleFilterChange('selectedFacilities', updated);
                  }}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">{facility}</span>
              </label>
            ))
          ) : (
            <p className="text-sm text-gray-500">No facilities available</p>
          )}
        </div>
      </div>

      {/* Active Filters Count */}
      {activeFiltersCount > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-center text-gray-600">
            <span className="font-semibold text-blue-600">{activeFiltersCount}</span> active filter{activeFiltersCount !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;