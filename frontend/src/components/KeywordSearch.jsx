import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaTimes, FaHospital, FaFlask, FaMapMarkerAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const COMMON_KEYWORDS = [
  'Dental clinic', 'Eye hospital', 'Cardiology', 'Neurology',
  'Orthopedic', 'Maternity hospital', 'Blood test', 'X-Ray',
  'MRI scan', 'CT scan', 'ECG', 'Ultrasound', 'Emergency',
  '24 hours', 'ICU', 'Surgery',
];

const KeywordSearch = ({ value, onChange, onSearch, placeholder = "Search hospitals, tests, specialists...", data = [] }) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredKeywords, setFilteredKeywords] = useState([]);
  const [filteredFacilities, setFilteredFacilities] = useState([]); // ✅ NAYA: Dynamic Hospitals/Labs
  
  const inputRef = useRef(null);
  const wrapperRef = useRef(null);
  const navigate = useNavigate();

  // 🧠 SMART FILTER LOGIC (Combines Static Keywords + Dynamic Data)
  useEffect(() => {
    if (value.trim().length > 0) {
      const lowerValue = value.toLowerCase();
      
      // 1. Filter Static Keywords
      const kws = COMMON_KEYWORDS.filter(keyword => keyword.toLowerCase().includes(lowerValue));
      setFilteredKeywords(kws);

      // 2. Filter Dynamic Facilities (Hospitals/Labs)
      if (data.length > 0) {
        const facs = data.filter(item => 
          item.name?.toLowerCase().includes(lowerValue) ||
          item.facilities?.some(f => f.toLowerCase().includes(lowerValue)) ||
          item.tests?.some(t => t.toLowerCase().includes(lowerValue)) ||
          item.type?.toLowerCase().includes(lowerValue)
        ).slice(0, 4); // Sirf top 4 facilities dikhayenge list lambi na ho isliye
        setFilteredFacilities(facs);
      }
    } else {
      setFilteredKeywords(COMMON_KEYWORDS);
      setFilteredFacilities([]); // Khali input par facilities mat dikhao
    }
  }, [value, data]);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 🖱️ Click Handler for Static Keywords
  const handleKeywordClick = (suggestion) => {
    onChange(suggestion);
    setShowSuggestions(false);
    if (onSearch) onSearch(); // Apply filter on home page
  };

  // 🚀 Click Handler for Direct Facility Navigation (Zero Delay)
  const handleFacilityClick = (item) => {
    setShowSuggestions(false);
    onChange(item.name); 
    
    const isHospital = item.type === 'hospital' || item.type === 'Hospitals' || item.emergencyAvailable !== undefined;
    const typePath = isHospital ? 'hospital' : 'lab';
    const itemId = item._id || item.id;
    
    // Seedha Naye page par jump karega data ke saath!
    navigate(`/${typePath}/${itemId}`, { state: { facilityData: item } });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setShowSuggestions(false);
      if (onSearch) onSearch();
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative shadow-md rounded-xl">
        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-12 pr-12 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 font-medium"
        />
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange('');
              inputRef.current?.focus();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-gray-100 p-1.5 rounded-full"
          >
            <FaTimes className="text-sm" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (filteredKeywords.length > 0 || filteredFacilities.length > 0) && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[400px]">
          <div className="overflow-y-auto custom-scrollbar">
            
            {/* SECTION 1: DIRECT FACILITIES (Hospitals & Labs) */}
            {filteredFacilities.length > 0 && (
              <div className="border-b border-gray-100 pb-1">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-4 pt-3 pb-1">Places</p>
                {filteredFacilities.map((item, idx) => {
                  const isHospital = item.type === 'hospital' || item.type === 'Hospitals' || item.emergencyAvailable !== undefined;
                  return (
                    <div 
                      key={`fac-${item._id || item.id || idx}`}
                      onClick={() => handleFacilityClick(item)}
                      className="flex items-center justify-between px-4 py-2.5 hover:bg-blue-50 cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0 ${isHospital ? 'bg-blue-500' : 'bg-purple-500'}`}>
                          {isHospital ? <FaHospital className="text-sm" /> : <FaFlask className="text-sm" />}
                        </div>
                        <div>
                          <p className="text-gray-800 font-semibold text-sm group-hover:text-blue-700 line-clamp-1">{item.name}</p>
                          <p className="text-gray-500 text-xs flex items-center gap-1">
                            <FaMapMarkerAlt className="text-[10px]" /> {item.address?.city || 'India'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* SECTION 2: COMMON KEYWORDS */}
            {filteredKeywords.length > 0 && (
              <div className="pt-1">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-4 pt-2 pb-1">Related Searches</p>
                {filteredKeywords.map((suggestion, index) => (
                  <button
                    key={`kw-${index}`}
                    onClick={() => handleKeywordClick(suggestion)}
                    className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition flex items-center gap-3"
                  >
                    <FaSearch className="text-gray-400 text-sm flex-shrink-0" />
                    <span className="text-gray-700 text-sm font-medium">{suggestion}</span>
                  </button>
                ))}
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

export default KeywordSearch;