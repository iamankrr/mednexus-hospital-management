import React from 'react';
import { FaMapPin } from 'react-icons/fa';

const PinCodeSearch = ({ value, onChange, onSearch }) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch();
    }
  };

  const handleChange = (e) => {
    const val = e.target.value.replace(/\D/g, ''); // Only numbers
    if (val.length <= 6) {
      onChange(val);
    }
  };

  return (
    <div className="relative w-full">
      <FaMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Enter PIN code (e.g., 110001)"
        maxLength={6}
        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
      />
      {value.length === 6 && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500 text-sm font-medium">
          ✓ Valid
        </span>
      )}
    </div>
  );
};

export default PinCodeSearch;