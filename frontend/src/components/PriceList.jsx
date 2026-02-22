import React, { useState } from 'react';
import { FaRupeeSign, FaClock, FaSearch, FaTag } from 'react-icons/fa';

const CATEGORIES = [
  'All', 'Pathology', 'Radiology', 'OPD', 'Surgery',
  'Cardiology', 'Neurology', 'Dental', 'Eye',
  'Orthopedic', 'Maternity', 'General', 'Other'
];

const PriceList = ({ services = [], themeColor = '#1E40AF' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  if (!services || services.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-8 text-center">
        <FaRupeeSign className="text-5xl text-gray-300 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-500">Price List Not Available</h3>
        <p className="text-gray-400 text-sm mt-1">Contact hospital for pricing details</p>
      </div>
    );
  }

  // Filter by search + category
  const filtered = services.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.description && s.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchCat = activeCategory === 'All' || s.category === activeCategory;
    return matchSearch && matchCat && s.isAvailable !== false;
  });

  // Get available categories from services
  const availableCategories = ['All', ...new Set(services.map(s => s.category || 'General'))];

  // Group filtered services
  const grouped = {};
  filtered.forEach(s => {
    const cat = s.category || 'General';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(s);
  });

  const totalServices = services.length;
  const minPrice = Math.min(...services.map(s => s.price));
  const maxPrice = Math.max(...services.map(s => s.price));

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">

      {/* Header */}
      <div className="p-6 text-white" style={{ backgroundColor: themeColor }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              💰 Price List
            </h2>
            <p className="text-white text-opacity-80 text-sm mt-1">
              {totalServices} services • ₹{minPrice} – ₹{maxPrice}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-white text-opacity-70">Starting from</p>
            <p className="text-3xl font-bold">₹{minPrice}</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search service..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-800 bg-white focus:outline-none text-sm"
            style={{ color: '#1f2937', backgroundColor: '#ffffff' }}
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="px-4 py-3 border-b border-gray-100 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {availableCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition whitespace-nowrap ${
                activeCategory === cat
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={activeCategory === cat ? { backgroundColor: themeColor } : {}}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Services List */}
      <div className="p-4">
        {Object.keys(grouped).length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>No services found for "{searchTerm}"</p>
          </div>
        ) : (
          Object.entries(grouped).map(([category, items]) => (
            <div key={category} className="mb-6">
              {/* Category Header */}
              <div className="flex items-center gap-2 mb-3">
                <FaTag className="text-sm" style={{ color: themeColor }} />
                <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide">
                  {category}
                </h3>
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                  {items.length}
                </span>
              </div>

              {/* Services */}
              <div className="space-y-2">
                {items.map((service) => (
                  <div
                    key={service._id}
                    className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition group"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 group-hover:text-blue-700 transition">
                        {service.name}
                      </p>
                      {service.description && (
                        <p className="text-xs text-gray-500 mt-0.5">{service.description}</p>
                      )}
                      {service.duration && (
                        <p className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                          <FaClock className="text-xs" />
                          {service.duration}
                        </p>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <p
                        className="text-xl font-bold"
                        style={{ color: themeColor }}
                      >
                        ₹{service.price.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400">onwards</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Note */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
        <p className="text-xs text-gray-500 text-center">
          💡 Prices are indicative. Final charges may vary. Contact hospital for exact pricing.
        </p>
      </div>
    </div>
  );
};

export default PriceList;
