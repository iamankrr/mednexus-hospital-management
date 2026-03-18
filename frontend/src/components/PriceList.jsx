import React, { useState } from 'react';
import { FaRupeeSign, FaClock, FaSearch, FaTag, FaInfoCircle } from 'react-icons/fa';

const PriceList = ({ services = [], themeColor = '#1E40AF' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // ✅ THE MASTER FIX: Filter out only logically unavailable ones. 0 price is allowed!
  const activeServices = services.filter(s => s.isAvailable !== false);

  if (!activeServices || activeServices.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-8 text-center border border-gray-100">
        <FaRupeeSign className="text-5xl text-gray-300 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-500">Services & Price List Not Available</h3>
        <p className="text-gray-400 text-sm mt-1">Please contact the facility directly for pricing and details.</p>
      </div>
    );
  }

  const filtered = activeServices.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.description && s.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchCat = activeCategory === 'All' || s.category === activeCategory;
    return matchSearch && matchCat;
  });

  const availableCategories = ['All', ...new Set(activeServices.map(s => s.category || 'General'))];

  const grouped = {};
  filtered.forEach(s => {
    const cat = s.category || 'General';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(s);
  });

  const validPrices = activeServices.filter(s => s.price > 0).map(s => s.price);
  const minPrice = validPrices.length > 0 ? Math.min(...validPrices) : null;
  const maxPrice = validPrices.length > 0 ? Math.max(...validPrices) : null;

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
      <div className="p-6 text-white" style={{ backgroundColor: themeColor }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">💰 Services & Prices</h2>
            <p className="text-white text-opacity-80 text-sm mt-1">
              {activeServices.length} total services listed
            </p>
          </div>
          {minPrice && (
            <div className="text-left sm:text-right bg-white bg-opacity-20 px-4 py-2 rounded-xl">
              <p className="text-xs text-white text-opacity-90 font-semibold uppercase tracking-wide">Starting from</p>
              <p className="text-2xl font-black">₹{minPrice}</p>
            </div>
          )}
        </div>

        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search any test, scan or service..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-xl text-gray-900 bg-white shadow-inner focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-30 font-medium"
          />
        </div>
      </div>

      <div className="px-4 py-3 border-b border-gray-100 overflow-x-auto custom-scrollbar bg-gray-50">
        <div className="flex gap-2 min-w-max">
          {availableCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition whitespace-nowrap shadow-sm border ${
                activeCategory === cat ? 'text-white border-transparent' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
              }`}
              style={activeCategory === cat ? { backgroundColor: themeColor } : {}}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 md:p-6 bg-gray-50 min-h-[400px]">
        {Object.keys(grouped).length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <FaSearch className="text-4xl mx-auto mb-3 text-gray-300 opacity-50" />
            <p className="font-semibold">No services found for "{searchTerm}"</p>
          </div>
        ) : (
          Object.entries(grouped).map(([category, items]) => (
            <div key={category} className="mb-8">
              <div className="flex items-center gap-2 mb-4 pl-2">
                <FaTag className="text-sm" style={{ color: themeColor }} />
                <h3 className="font-black text-gray-800 text-sm md:text-base uppercase tracking-wider">{category}</h3>
                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-bold">{items.length}</span>
              </div>
              <div className="space-y-3">
                {items.map((service) => (
                  <div key={service._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-gray-200 bg-white hover:border-blue-300 hover:shadow-md transition group gap-4">
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 text-lg group-hover:text-blue-700 transition leading-tight">{service.name}</p>
                      {service.description && <p className="text-sm text-gray-500 mt-1.5 leading-snug">{service.description}</p>}
                      {service.duration && <p className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 mt-2 bg-gray-50 w-fit px-2 py-1 rounded-md"><FaClock />{service.duration}</p>}
                    </div>
                    
                    <div className="text-left sm:text-right border-t sm:border-t-0 sm:border-l border-gray-100 pt-3 sm:pt-0 sm:pl-5 shrink-0">
                      {service.price > 0 ? (
                        <>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-0.5">Price</p>
                          <p className="text-2xl font-black tracking-tight" style={{ color: themeColor }}>₹{service.price.toLocaleString()}</p>
                        </>
                      ) : (
                        <div className="bg-gray-100 px-4 py-2 rounded-xl border border-gray-200 flex items-center gap-2">
                           <FaInfoCircle className="text-gray-400" />
                           <span className="text-sm font-bold text-gray-600 uppercase">On Request</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PriceList;