import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FaCheckCircle, FaTimesCircle, FaArrowLeft, FaStar,
  FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock,
  FaRupeeSign, FaAmbulance, FaGoogle, FaSync,
  FaBed, FaStethoscope, FaAward, FaHospital, FaFlask
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

const SectionHeader = ({ title, icon }) => (
  <div className="bg-gray-800 px-6 py-3 flex items-center gap-3 mt-4">
    <span className="text-white text-xl">{icon}</span>
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
    <div className="grid border-b border-gray-200 hover:bg-gray-50 transition min-w-max"
      style={{ gridTemplateColumns: `minmax(200px, 1fr) repeat(${items.length}, minmax(280px, 1fr))` }}>
      <div className="p-4 flex items-center gap-3 bg-gray-100 border-r border-gray-300">
        {icon}
        <span className="text-sm font-bold text-gray-700">{label}</span>
      </div>
      {items.map((item, index) => (
        <div key={item._id || index}
          className={`p-4 flex flex-col items-center justify-center border-r border-gray-200 last:border-r-0 ${bestIndex === index ? 'bg-green-50' : 'bg-white'}`}>
          {render(item)}
          {bestIndex === index && (
            <span className="mt-2 text-[10px] uppercase tracking-wider font-bold bg-green-500 text-white px-3 py-1 rounded-full shadow-sm">Top Pick</span>
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
    window.scrollTo(0, 0);
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

  const formatAddress = (item) => {
    if (!item.address) return 'Not Available';
    const parts = [item.address.street, item.address.area, item.address.city, item.address.state, item.address.pincode].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Not Available';
  };

  const getLowestConsultationFee = (doctors) => {
    if (!doctors || doctors.length === 0) return null;
    const fees = doctors.map(d => d.consultationFee).filter(f => f > 0);
    return fees.length > 0 ? Math.min(...fees) : null;
  };

  const getLowestRoomPrice = (rooms) => {
    if (!rooms || rooms.length === 0) return null;
    const prices = rooms.map(r => r.pricePerDay).filter(p => p > 0);
    return prices.length > 0 ? Math.min(...prices) : null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-bold">Analyzing Facilities...</p>
          <p className="text-gray-400 text-sm mt-1">Fetching deep comparison data</p>
        </div>
      </div>
    );
  }

  const themes = [
    { bg: 'bg-blue-600', light: 'bg-blue-50', text: 'text-blue-600' },
    { bg: 'bg-green-600', light: 'bg-green-50', text: 'text-green-600' },
    { bg: 'bg-purple-600', light: 'bg-purple-50', text: 'text-purple-600' },
    { bg: 'bg-orange-600', light: 'bg-orange-50', text: 'text-orange-600' }
  ];

  return (
    <div className="min-h-screen bg-gray-100 py-6 md:py-8 pb-20">
      <div className="max-w-screen-2xl mx-auto px-4">

        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-bold self-start md:self-auto">
            <FaArrowLeft /> Back
          </button>
          
          <div className="text-center">
            <h1 className="text-2xl md:text-4xl font-black text-gray-800 tracking-tight">
              ⚖️ Compare {type === 'hospital' ? 'Hospitals' : 'Laboratories'}
            </h1>
            {lastUpdated && (
              <p className="text-xs text-gray-500 mt-1 font-medium">Auto-Synced: {lastUpdated.toLocaleTimeString()}</p>
            )}
          </div>
          
          <div className="flex gap-3 self-end md:self-auto">
            <button onClick={handleRefresh}
              className="flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-xl hover:bg-blue-200 font-bold text-sm transition">
              <FaSync /> Refresh
            </button>
            <button onClick={() => { clearCompare(); navigate('/'); }}
              className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 font-bold text-sm shadow-md transition">
              Clear All
            </button>
          </div>
        </div>

        {/* Mobile Swipe Hint */}
        <div className="md:hidden bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4 flex items-center justify-center gap-2">
          <span className="text-xl">↔️</span>
          <p className="text-sm font-bold text-blue-800">Swipe left to see all facilities</p>
        </div>

        {/* Main Table Container */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden overflow-x-auto custom-scrollbar">
          <div style={{ minWidth: `${200 + items.length * 280}px` }}>

            {/* Entity Headers */}
            <div className="grid" style={{ gridTemplateColumns: `minmax(200px, 1fr) repeat(${items.length}, minmax(280px, 1fr))` }}>
              <div className="bg-gray-800 p-6 flex flex-col justify-center items-center border-r border-gray-700">
                <FaBalanceScale className="text-4xl text-gray-400 mb-2" />
                <p className="text-white font-black text-xl uppercase tracking-widest">Compare</p>
              </div>
              {items.map((item, index) => (
                <div key={item._id || index} className={`${themes[index].bg} p-6 text-white relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                  {item.images?.[0] ? (
                    <img src={item.images[0]} alt={item.name} className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-full mx-auto border-4 border-white shadow-lg mb-4" />
                  ) : (
                    <div className="w-24 h-24 md:w-32 md:h-32 bg-white bg-opacity-20 rounded-full mx-auto border-4 border-white shadow-lg mb-4 flex items-center justify-center">
                      <span className="text-4xl md:text-5xl">{type === 'hospital' ? '🏥' : '🔬'}</span>
                    </div>
                  )}
                  <h3 className="text-xl md:text-2xl font-black text-center leading-tight mb-1">{item.name}</h3>
                  <p className="text-sm font-medium text-white text-opacity-90 text-center flex justify-center items-center gap-1">
                    <FaMapMarkerAlt /> {item.address?.city || ''}
                  </p>
                </div>
              ))}
            </div>

            {/* ================= RATINGS ================= */}
            <SectionHeader title="Ratings & Reviews" icon={<FaStar className="text-yellow-400" />} />
            
            <CompareRow label="Google Rating" icon={<FaGoogle className="text-blue-500 text-lg" />} items={items}
              render={(item) => (
                <div className="text-center">
                  <div className="flex items-center gap-1 justify-center">
                    <span className="text-2xl font-black text-gray-800">{item.googleRating ? item.googleRating.toFixed(1) : 'N/A'}</span>
                    <FaStar className="text-yellow-400 text-xl" />
                  </div>
                  <p className="text-xs font-bold text-gray-500 mt-1">{item.googleReviewCount?.toLocaleString() || 0} reviews</p>
                </div>
              )}
              highlightBest={(item) => item.googleRating || 0}
            />

            <CompareRow label="MedNexus Rating" icon={<FaHeart className="text-red-500 text-lg" />} items={items}
              render={(item) => (
                <div className="text-center">
                  <div className="flex items-center gap-1 justify-center">
                    <span className="text-2xl font-black text-gray-800">{item.websiteRating ? item.websiteRating.toFixed(1) : 'N/A'}</span>
                    <FaStar className="text-yellow-400 text-xl" />
                  </div>
                  <p className="text-xs font-bold text-gray-500 mt-1">{item.totalReviews || 0} user reviews</p>
                </div>
              )}
              highlightBest={(item) => item.websiteRating || 0}
            />

            {/* ================= CAPACITY & DOCTORS ================= */}
            <SectionHeader title="Capacity & Specialists" icon={<FaUserMd className="text-blue-400" />} />
            
            <CompareRow label="Total Doctors" icon={<FaStethoscope className="text-teal-500 text-lg" />} items={items}
              render={(item) => (
                <p className="text-2xl font-black text-teal-600">{item.doctors?.length || 0}</p>
              )}
              highlightBest={(item) => item.doctors?.length || 0}
            />

            <CompareRow label="Total Beds" icon={<FaBed className="text-indigo-500 text-lg" />} items={items}
              render={(item) => (
                <p className="text-2xl font-black text-indigo-600">{item.numberOfBeds || 'N/A'}</p>
              )}
              highlightBest={(item) => item.numberOfBeds || 0}
            />

            <CompareRow label="Departments" icon={<FaHospital className="text-blue-500 text-lg" />} items={items}
              render={(item) => (
                <p className="text-xl font-bold text-gray-800">{item.departments?.length || 0} Depts</p>
              )}
            />

            {/* ================= PRICING ================= */}
            <SectionHeader title="Pricing & Affordability" icon={<FaRupeeSign className="text-green-400" />} />

            <CompareRow label="Doctor Fees" icon={<FaStethoscope className="text-gray-500 text-lg" />} items={items}
              render={(item) => {
                const fee = getLowestConsultationFee(item.doctors);
                return fee ? (
                  <div className="text-center">
                    <p className="text-xs font-bold text-gray-500 uppercase">Starting From</p>
                    <p className="text-2xl font-black text-green-600">₹{fee}</p>
                  </div>
                ) : <span className="text-gray-400 font-bold">N/A</span>;
              }}
              highlightBest={(item) => {
                const fee = getLowestConsultationFee(item.doctors);
                return fee ? -fee : null; // Lower is better
              }}
            />

            <CompareRow label="Room Charges" icon={<FaBed className="text-gray-500 text-lg" />} items={items}
              render={(item) => {
                const price = getLowestRoomPrice(item.roomTypes);
                return price ? (
                  <div className="text-center">
                    <p className="text-xs font-bold text-gray-500 uppercase">Starting From</p>
                    <p className="text-2xl font-black text-blue-600">₹{price} <span className="text-sm text-gray-500">/day</span></p>
                  </div>
                ) : <span className="text-gray-400 font-bold">N/A</span>;
              }}
              highlightBest={(item) => {
                const price = getLowestRoomPrice(item.roomTypes);
                return price ? -price : null; // Lower is better
              }}
            />

            <CompareRow label="Health Packages" icon={<FaClipboardList className="text-purple-500 text-lg" />} items={items}
              render={(item) => (
                item.packages?.length > 0 ? (
                  <p className="font-bold text-purple-700">{item.packages.length} Packages available</p>
                ) : <span className="text-gray-400 font-bold">None Listed</span>
              )}
            />

            {/* ================= EMERGENCY & FACILITIES ================= */}
            <SectionHeader title="Emergency & Diagnostics" icon={<FaAmbulance className="text-red-400" />} />
            
            <CompareRow label="24/7 Emergency" icon={<FaAmbulance className="text-red-500 text-lg" />} items={items}
              render={(item) => (
                item.emergencyAvailable ? (
                  <div className="flex flex-col items-center">
                    <FaCheckCircle className="text-3xl text-green-500 mb-1" />
                    <span className="text-xs font-bold text-green-700 uppercase">Available</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center opacity-50">
                    <FaTimesCircle className="text-3xl text-red-400 mb-1" />
                    <span className="text-xs font-bold text-red-600 uppercase">No</span>
                  </div>
                )
              )}
            />

            <CompareRow label="Ambulances" icon={<FaAmbulance className="text-gray-500 text-lg" />} items={items}
              render={(item) => (
                <p className="text-xl font-black text-gray-800">{item.emergencyDetails?.ambulanceCount || 'N/A'}</p>
              )}
              highlightBest={(item) => item.emergencyDetails?.ambulanceCount || 0}
            />

            <CompareRow label="In-House Lab" icon={<FaFlask className="text-purple-500 text-lg" />} items={items}
              render={(item) => (
                item.diagnosticCenterDetails?.labAvailable ? (
                  <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-lg font-bold text-sm">Available</span>
                ) : <span className="text-gray-400 font-bold">N/A</span>
              )}
            />

            {/* ================= TOTAL SERVICES SUMMARY ================= */}
            <SectionHeader title="Available Services Summary" icon={<FaPills className="text-green-400" />} />
            
            <CompareRow label="Total Surgeries" icon={<FaCut className="text-red-500 text-lg" />} items={items}
              render={(item) => <p className="text-lg font-bold text-gray-800">{item.surgeries?.length || 0} listed</p>}
              highlightBest={(item) => item.surgeries?.length || 0}
            />
            
            <CompareRow label="Total Treatments" icon={<FaPills className="text-green-500 text-lg" />} items={items}
              render={(item) => <p className="text-lg font-bold text-gray-800">{item.treatments?.length || 0} listed</p>}
              highlightBest={(item) => item.treatments?.length || 0}
            />
            
            <CompareRow label="Insurance Tied-up" icon={<FaShieldAlt className="text-blue-500 text-lg" />} items={items}
              render={(item) => <p className="text-lg font-bold text-gray-800">{item.insuranceAccepted?.length || 0} Providers</p>}
              highlightBest={(item) => item.insuranceAccepted?.length || 0}
            />

            {/* ================= CERTIFICATIONS ================= */}
            <SectionHeader title="Certifications & Quality" icon={<FaAward className="text-yellow-400" />} />
            
            <CompareRow label="NABH Accredited" icon={<FaAward className="text-yellow-600 text-lg" />} items={items}
              render={(item) => (
                item.documents?.nabhAccreditation ? <FaCheckCircle className="text-2xl text-green-500" /> : <span className="text-gray-300">-</span>
              )}
            />
            <CompareRow label="ISO Certified" icon={<FaCheckCircle className="text-blue-500 text-lg" />} items={items}
              render={(item) => (
                item.documents?.isoCertification ? <FaCheckCircle className="text-2xl text-blue-500" /> : <span className="text-gray-300">-</span>
              )}
            />

            {/* ================= ACTION BUTTONS ================= */}
            <div className="grid border-t-4 border-gray-200" style={{ gridTemplateColumns: `minmax(200px, 1fr) repeat(${items.length}, minmax(280px, 1fr))` }}>
              <div className="bg-gray-100 p-6 flex flex-col justify-center items-center border-r border-gray-300">
                <p className="text-gray-800 font-black text-lg uppercase">Final Decision</p>
                <p className="text-gray-500 text-xs text-center mt-1">Choose the best fit</p>
              </div>
              
              {items.map((item, index) => (
                <div key={item._id || index} className="bg-white p-6 space-y-3 border-r border-gray-200 flex flex-col justify-center">
                  <button onClick={() => navigate(`/${type}/${item._id}`)}
                    className={`w-full py-3 rounded-xl font-black text-white text-sm sm:text-base ${themes[index].bg} hover:opacity-90 transition shadow-md`}>
                    View Full Profile
                  </button>
                  
                  {item.owner && item.appointmentsEnabled ? (
                    <button onClick={() => navigate(`/appointments/book?${type}=${item._id}`)}
                      className="w-full py-3 rounded-xl font-bold text-gray-800 text-sm sm:text-base bg-gray-100 border-2 border-gray-200 hover:bg-gray-200 hover:border-gray-300 transition shadow-sm">
                      📅 Book Appointment
                    </button>
                  ) : (
                    <button disabled className="w-full py-3 rounded-xl font-bold text-gray-400 text-sm sm:text-base bg-gray-50 border-2 border-gray-100 cursor-not-allowed">
                      Booking Unavailable
                    </button>
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