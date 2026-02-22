import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FaCheckCircle, FaTimesCircle, FaArrowLeft, FaStar,
  FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock,
  FaRupeeSign, FaAmbulance, FaGoogle, FaSync
} from 'react-icons/fa';
import { useComparison } from '../context/ComparisonContext';
import { useLocation as useUserLocation } from '../context/LocationContext';
import axios from 'axios';

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat/2)*Math.sin(dLat/2) +
    Math.cos((lat1*Math.PI)/180)*Math.cos((lat2*Math.PI)/180)*
    Math.sin(dLon/2)*Math.sin(dLon/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
};

const SectionHeader = ({ title }) => (
  <div className="bg-gray-800 px-6 py-3">
    <h3 className="text-white font-bold text-lg">{title}</h3>
  </div>
);

const CompareRow = ({ label, icon, items, render, highlightBest }) => {
  const getBestIndex = () => {
    if (!highlightBest) return -1;
    const values = items.map(item => highlightBest(item));
    const filtered = values.filter(v => v !== null && v !== undefined && !isNaN(v));
    if (filtered.length === 0) return -1;
    const maxValue = Math.max(...filtered);
    return values.indexOf(maxValue);
  };
  const bestIndex = getBestIndex();

  return (
    <div className="grid border-b border-gray-100 hover:bg-gray-50 transition"
      style={{ gridTemplateColumns: `200px repeat(${items.length}, 1fr)` }}>
      <div className="p-4 flex items-center gap-2 bg-gray-50 border-r border-gray-200">
        {icon}
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </div>
      {items.map((item, index) => (
        <div key={item._id || index}
          className={`p-4 flex flex-col items-center justify-center border-r border-gray-100 last:border-r-0 ${bestIndex === index ? 'bg-green-50' : ''}`}>
          {render(item)}
          {bestIndex === index && (
            <span className="mt-1 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">Best ✓</span>
          )}
        </div>
      ))}
    </div>
  );
};

const Compare = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCompare } = useComparison();
  const { userLocation } = useUserLocation();
  const [items, setItems] = useState([]);
  const [type, setType] = useState('hospital');
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    if (location.state?.items?.length >= 2) {
      setType(location.state.type || 'hospital');
      fetchFullData(location.state.items, location.state.type || 'hospital');
    } else {
      navigate('/');
    }
  }, []);

  const fetchFullData = async (compareItems, facilityType) => {
    try {
      setLoading(true);
      const fullItems = await Promise.all(
        compareItems.map(async (item) => {
          try {
            const id = item._id || item.id;
            const endpoint = facilityType === 'hospital'
              ? `http://localhost:3000/api/hospitals/${id}`
              : `http://localhost:3000/api/labs/${id}`;
            const response = await axios.get(endpoint);
            const fullData = response.data.data || response.data;
            if (userLocation && fullData.location?.coordinates) {
              fullData.distance = calculateDistance(
                userLocation.latitude, userLocation.longitude,
                fullData.location.coordinates[1], fullData.location.coordinates[0]
              );
            }
            return fullData;
          } catch (err) {
            console.error('Error fetching:', item.name, err);
            return item;
          }
        })
      );
      setItems(fullItems);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (location.state?.items) {
      fetchFullData(location.state.items, type);
    }
  };

  const hasFeature = (item, feature) => item.facilities?.includes(feature) || false;

  const getAllFacilities = () => {
    const all = new Set();
    items.forEach(item => item.facilities?.forEach(f => all.add(f)));
    return Array.from(all).sort();
  };

  const formatAddress = (item) => {
    if (!item.address) return 'Not Available';
    const parts = [item.address.street, item.address.area, item.address.city, item.address.state, item.address.pincode].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Not Available';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading latest data...</p>
          <p className="text-gray-400 text-sm mt-1">Fetching from server for accurate comparison</p>
        </div>
      </div>
    );
  }

  const allFacilities = getAllFacilities();
  const themes = [
    { bg: 'bg-blue-500', light: 'bg-blue-50' },
    { bg: 'bg-green-500', light: 'bg-green-50' },
    { bg: 'bg-purple-500', light: 'bg-purple-50' }
  ];

  return (
    <div className="min-h-screen bg-gray-100 py-8 pb-20">
      <div className="max-w-7xl mx-auto px-4">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium">
            <FaArrowLeft /> Back
          </button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800">
              {type === 'hospital' ? '🏥' : '🔬'} Compare {type === 'hospital' ? 'Hospitals' : 'Labs'}
            </h1>
            {lastUpdated && (
              <p className="text-xs text-gray-500">Updated: {lastUpdated.toLocaleTimeString()}</p>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={handleRefresh}
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 font-semibold text-sm">
              <FaSync /> Refresh
            </button>
            <button onClick={() => { clearCompare(); navigate('/'); }}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 font-semibold text-sm">
              Exit
            </button>
          </div>
        </div>

        {/* Auto-sync info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex items-center gap-2">
          <FaSync className="text-blue-500 flex-shrink-0" />
          <p className="text-sm text-blue-700">
            <strong>Auto-Sync:</strong> Jab bhi owner/admin facilities update kare, "Refresh" dabao to latest data dekhne ke liye.
          </p>
        </div>

        {/* Main Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden overflow-x-auto">
          <div style={{ minWidth: `${200 + items.length * 280}px` }}>

            {/* Hospital Name Headers */}
            <div className="grid" style={{ gridTemplateColumns: `200px repeat(${items.length}, 1fr)` }}>
              <div className="bg-gray-800 p-6 flex items-center justify-center">
                <p className="text-white font-bold text-lg">Comparison</p>
              </div>
              {items.map((item, index) => (
                <div key={item._id || index} className={`${themes[index].bg} p-6 text-white`}>
                  {item.images?.[0] ? (
                    <img src={item.images[0]} alt={item.name} className="w-full h-32 object-cover rounded-lg mb-3" />
                  ) : (
                    <div className="w-full h-32 bg-white bg-opacity-20 rounded-lg mb-3 flex items-center justify-center">
                      <span className="text-5xl">{type === 'hospital' ? '🏥' : '🔬'}</span>
                    </div>
                  )}
                  <h3 className="text-lg font-bold text-center leading-tight">{item.name}</h3>
                  <p className="text-sm text-white text-opacity-80 text-center mt-1">
                    {item.address?.city || ''}{item.address?.state ? `, ${item.address.state}` : ''}
                  </p>
                  <button onClick={() => navigate(`/${type}/${item._id}`)}
                    className="w-full mt-3 bg-white bg-opacity-20 hover:bg-opacity-30 py-2 rounded-lg text-sm font-semibold transition">
                    View Details →
                  </button>
                </div>
              ))}
            </div>

            {/* RATINGS */}
            <SectionHeader title="⭐ Ratings & Reviews" />
            <CompareRow label="Google Rating" icon={<FaGoogle className="text-blue-500" />} items={items}
              render={(item) => (
                <div className="text-center">
                  <div className="flex items-center gap-1 justify-center">
                    <FaStar className="text-yellow-400" />
                    <span className="text-2xl font-bold">{item.googleRating ? item.googleRating.toFixed(1) : 'N/A'}</span>
                  </div>
                  <p className="text-xs text-gray-500">{item.googleReviewCount?.toLocaleString() || 0} reviews</p>
                </div>
              )}
              highlightBest={(item) => item.googleRating || 0}
            />
            <CompareRow label="User Rating" icon={<FaStar className="text-yellow-500" />} items={items}
              render={(item) => (
                <div className="text-center">
                  <div className="flex items-center gap-1 justify-center">
                    <FaStar className="text-yellow-400" />
                    <span className="text-2xl font-bold">{item.websiteRating ? item.websiteRating.toFixed(1) : 'N/A'}</span>
                  </div>
                  <p className="text-xs text-gray-500">{item.totalReviews || 0} reviews</p>
                </div>
              )}
              highlightBest={(item) => item.websiteRating || 0}
            />

            {/* LOCATION */}
            <SectionHeader title="📍 Location & Distance" />
            <CompareRow label="Distance" icon={<FaMapMarkerAlt className="text-red-500" />} items={items}
              render={(item) => (
                item.distance !== undefined && item.distance !== null ? (
                  <div className="text-center">
                    <p className="text-2xl font-bold">{item.distance.toFixed(1)}</p>
                    <p className="text-xs text-gray-500">km away</p>
                  </div>
                ) : <span className="text-gray-400 text-sm">Enable GPS</span>
              )}
              highlightBest={(item) => item.distance != null ? -item.distance : null}
            />
            <CompareRow label="Address" icon={<FaMapMarkerAlt className="text-gray-500" />} items={items}
              render={(item) => <p className="text-sm text-gray-700 text-center px-2">{formatAddress(item)}</p>}
            />
            <CompareRow label="Landmark" icon={<FaMapMarkerAlt className="text-orange-500" />} items={items}
              render={(item) => (
                <p className="text-sm text-center">
                  {item.address?.landmark || <span className="text-gray-400">Not mentioned</span>}
                </p>
              )}
            />

            {/* COST */}
            <SectionHeader title="💰 Cost & Pricing" />
            <CompareRow label="Starting Cost" icon={<FaRupeeSign className="text-green-500" />} items={items}
              render={(item) => (
                item.tests?.length > 0 ? (
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">₹{item.tests[0].price}</p>
                    <p className="text-xs text-gray-500">starting price</p>
                  </div>
                ) : <span className="text-gray-400 text-sm">N/A</span>
              )}
              highlightBest={(item) => item.tests?.[0] ? -item.tests[0].price : null}
            />
            <CompareRow label="Test Prices" icon={<FaRupeeSign className="text-blue-500" />} items={items}
              render={(item) => (
                <div className="w-full space-y-1">
                  {item.tests?.length > 0 ? (
                    item.tests.slice(0, 4).map((test, i) => (
                      <div key={i} className="flex justify-between px-2 text-sm border-b border-gray-100 pb-1">
                        <span className="text-gray-600 truncate max-w-[130px]">{test.name}</span>
                        <span className="font-bold text-green-600 ml-1">₹{test.price}</span>
                      </div>
                    ))
                  ) : <p className="text-gray-400 text-sm text-center">No tests listed</p>}
                </div>
              )}
            />

            {/* CONTACT */}
            <SectionHeader title="📞 Contact Details" />
            <CompareRow label="Phone" icon={<FaPhone className="text-green-500" />} items={items}
              render={(item) => (
                item.phone ? (
                  <a href={`tel:${item.phone}`} className="text-blue-600 hover:underline font-medium text-sm">
                    📞 {item.phone}
                  </a>
                ) : <span className="text-gray-400 text-sm">N/A</span>
              )}
            />
            <CompareRow label="Email" icon={<FaEnvelope className="text-blue-500" />} items={items}
              render={(item) => (
                item.email ? (
                  <a href={`mailto:${item.email}`} className="text-blue-600 hover:underline text-sm truncate block max-w-[180px]">
                    {item.email}
                  </a>
                ) : <span className="text-gray-400 text-sm">N/A</span>
              )}
            />

            {/* WORKING HOURS */}
            <SectionHeader title="⏰ Working Hours" />
            {['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].map(day => (
              <CompareRow key={day}
                label={day.charAt(0).toUpperCase() + day.slice(1)}
                icon={<FaClock className="text-purple-500" />}
                items={items}
                render={(item) => {
                  const hours = item.operatingHours?.[day];
                  if (!hours) return <span className="text-gray-400 text-sm">N/A</span>;
                  return (
                    <span className={`text-sm font-medium ${hours === 'Closed' ? 'text-red-500' : 'text-green-600'}`}>
                      {hours}
                    </span>
                  );
                }}
              />
            ))}

            {/* EMERGENCY */}
            {type === 'hospital' && <>
              <SectionHeader title="🚨 Emergency Services" />
              <CompareRow label="24/7 Emergency" icon={<FaAmbulance className="text-red-500" />} items={items}
                render={(item) => (
                  item.emergencyAvailable ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <FaCheckCircle className="text-2xl" /><span className="font-semibold text-sm">Available</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-500">
                      <FaTimesCircle className="text-2xl" /><span className="font-semibold text-sm">Not Available</span>
                    </div>
                  )
                )}
              />
            </>}

            {/* FACILITIES - AUTO SYNCED */}
            <SectionHeader title={`🏥 Facilities & Services — ${allFacilities.length} total (Auto-synced)`} />
            {allFacilities.length === 0 ? (
              <div className="grid border-b border-gray-100" style={{ gridTemplateColumns: `200px repeat(${items.length}, 1fr)` }}>
                <div className="p-4 bg-gray-50 border-r border-gray-200">
                  <span className="text-sm text-gray-500">No facilities</span>
                </div>
                {items.map((_, i) => (
                  <div key={i} className="p-4 text-center">
                    <span className="text-gray-400 text-sm">Owner ne facilities add nahi ki</span>
                  </div>
                ))}
              </div>
            ) : (
              allFacilities.map(facility => (
                <CompareRow key={facility} label={facility} items={items}
                  render={(item) => (
                    hasFeature(item, facility) ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <FaCheckCircle className="text-2xl" />
                        <span className="text-sm font-medium hidden md:block">Yes</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-red-400">
                        <FaTimesCircle className="text-2xl" />
                        <span className="text-sm font-medium hidden md:block">No</span>
                      </div>
                    )
                  )}
                />
              ))
            )}

            {/* LAB SPECIFIC */}
            {type === 'laboratory' && <>
              <SectionHeader title="🔬 Lab Specific" />
              <CompareRow label="Home Collection" items={items}
                render={(item) => (
                  item.homeCollection ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <FaCheckCircle className="text-2xl" /><span className="text-sm font-semibold">Available</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-500">
                      <FaTimesCircle className="text-2xl" /><span className="text-sm font-semibold">Not Available</span>
                    </div>
                  )
                )}
              />
              <CompareRow label="Report Time" icon={<FaClock className="text-purple-500" />} items={items}
                render={(item) => <p className="text-sm font-medium text-gray-700">{item.reportTime || 'N/A'}</p>}
              />
            </>}

            {/* ACTION BUTTONS */}
            <div className="grid border-t-2 border-gray-200"
              style={{ gridTemplateColumns: `200px repeat(${items.length}, 1fr)` }}>
              <div className="bg-gray-50 p-4 flex items-center justify-center">
                <p className="text-gray-600 font-semibold text-sm">Actions</p>
              </div>
              {items.map((item, index) => (
                <div key={item._id || index} className={`${themes[index].light} p-4 space-y-2`}>
                  <button onClick={() => navigate(`/${type}/${item._id}`)}
                    className={`w-full py-2 rounded-lg font-bold text-white text-sm ${themes[index].bg} hover:opacity-90 transition`}>
                    View Full Details
                  </button>
                  {item.phone && (
                    <a href={`tel:${item.phone}`}
                      className="block w-full py-2 rounded-lg font-bold text-center text-sm bg-green-500 text-white hover:bg-green-600 transition">
                      📞 Call Now
                    </a>
                  )}
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Compare;
