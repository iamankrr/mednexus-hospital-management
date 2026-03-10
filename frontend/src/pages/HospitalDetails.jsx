import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom'; 
import axios from 'axios'; 
import {
  FaStar, FaGoogle, FaPhone, FaEnvelope, FaMapMarkerAlt,
  FaClock, FaAmbulance, FaHeart, FaShare, FaArrowLeft,
  FaCheckCircle, FaBalanceScale, FaCalendarAlt, FaClipboardList,
  FaFlask, FaPills, FaCut, FaSpa, FaUserMd, FaShieldAlt, FaBed, FaBuilding
} from 'react-icons/fa';
import { hospitalAPI } from '../services/api';
import PriceList from '../components/PriceList';
import MapButton from '../components/MapButton';
import ReviewForm from '../components/ReviewForm';
import PhotoGallery from '../components/PhotoGallery'; 
import { useComparison } from '../context/ComparisonContext';
import { useLocation as useUserLocation } from '../context/LocationContext';
import { calculateDistance } from '../utils/distance';

const calculateYearsSince = (date) => {
  if (!date) return null;
  const establishedDate = new Date(date);
  const now = new Date();
  const years = now.getFullYear() - establishedDate.getFullYear();
  const months = now.getMonth() - establishedDate.getMonth();
  
  if (years === 0) {
    if (months === 0) return 'Established this month';
    return `Established ${months} ${months === 1 ? 'month' : 'months'} ago`;
  }
  return `Established ${years} ${years === 1 ? 'year' : 'years'} ago`;
};

// Helper for category icons
const getCategoryIcon = (category) => {
  const cat = category?.toLowerCase() || '';
  if (cat.includes('gov')) return '🏛️';
  if (cat.includes('public')) return '🏥';
  if (cat.includes('charity') || cat.includes('ngo')) return '❤️';
  return '💼'; // Private default
};

const HospitalDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const locationRouter = useLocation(); 
  const { addToCompare, isInCompare, compareList } = useComparison();
  const { userLocation } = useUserLocation();

  const initialData = locationRouter.state?.facilityData; 

  const [hospital, setHospital]       = useState(initialData || null);
  const [loading, setLoading]         = useState(!initialData); 
  const [activeTab, setActiveTab]     = useState('overview');
  const [distance, setDistance]       = useState(initialData?.distance || null);
  
  const [isFavorite, setIsFavorite]   = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0); 
    fetchHospital();
    checkIfFavorite(); 
  }, [id]);

  const fetchHospital = async () => {
    try {
      if (!hospital) {
        setLoading(true);
      }
      const res = await hospitalAPI.getById(id);
      const data = res.data.data; 
      
      setHospital(data); 

      if (userLocation && data.location?.coordinates) {
        const dist = calculateDistance(
          userLocation.latitude, userLocation.longitude,
          data.location.coordinates[1], data.location.coordinates[0]
        );
        setDistance(dist);
      }
    } catch (err) {
      console.error('Error fetching hospital:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkIfFavorite = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get('http://localhost:3000/api/favorites', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const favorites = response.data.data;
      setIsFavorite(favorites.hospitals?.includes(id));
    } catch (error) {
      console.error('Check favorite error:', error);
    }
  };

  const handleToggleFavorite = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to manage favorites');
      navigate('/login');
      return;
    }

    try {
      const endpoint = isFavorite ? '/api/favorites/remove' : '/api/favorites/add';
      await axios.post(
        `http://localhost:3000${endpoint}`,
        { facilityId: id, facilityType: 'hospital' },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      setIsFavorite(!isFavorite);
      alert(isFavorite ? '✅ Removed from favorites' : '✅ Added to favorites');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update favorites');
    }
  };

  const handleAddToCompare = () => {
    const success = addToCompare(hospital, 'hospital');
    if (success) {
      alert(`${hospital.name} added to comparison!`);
    }
  };

  const scrollToServices = () => {
    const servicesSection = document.getElementById('price-list-tab');
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: 'smooth' });
      setActiveTab('services');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500"></div>
    </div>
  );

  if (!hospital) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500 text-xl">Hospital not found</p>
    </div>
  );

  const theme = hospital.themeColor || '#1E40AF';
  const tabs  = ['overview', 'services', 'reviews'];
  const isCompared = compareList.some(h => h.id === hospital._id || h.id === hospital.id);

  // ==========================================
  // ✅ LOGIC: MERGE UNPRICED SERVICES INTO ARRAYS
  // ==========================================
  const unpricedServices = hospital.services?.filter(s => !s.price || s.price <= 0) || [];
  
  const combinedTests = Array.from(new Set([
    ...(hospital.tests || []),
    ...unpricedServices.filter(s => ['Pathology', 'Radiology', 'Diagnosis'].includes(s.category)).map(s => s.name)
  ]));

  const combinedTreatments = Array.from(new Set([
    ...(hospital.treatments || []),
    ...unpricedServices.filter(s => ['Consultation', 'OPD', 'General', 'Other'].includes(s.category)).map(s => s.name)
  ]));

  const combinedSurgeries = Array.from(new Set([
    ...(hospital.surgeries || []),
    ...unpricedServices.filter(s => s.category === 'Surgery').map(s => s.name)
  ]));

  const combinedTherapies = Array.from(new Set([
    ...(hospital.therapies || []),
    ...unpricedServices.filter(s => s.category === 'Therapy').map(s => s.name)
  ]));

  const combinedProcedures = Array.from(new Set([
    ...(hospital.procedures || []),
    ...unpricedServices.filter(s => ['Dental', 'Eye', 'Orthopedic', 'Maternity', 'Cardiology', 'Neurology'].includes(s.category)).map(s => s.name)
  ]));

  return (
    <div className="min-h-screen bg-gray-50 pb-20">

      {/* ── TOP COLOR BAND ── */}
      <div className="h-2 w-full" style={{ backgroundColor: theme }} />

      {/* ── BACK BUTTON ── */}
      <div className="max-w-6xl mx-auto px-4 pt-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium mb-4"
        >
          <FaArrowLeft /> Back
        </button>
      </div>

      {/* ── PHOTO GALLERY ── */}
      <div className="max-w-6xl mx-auto px-4 mb-6">
        <PhotoGallery 
          images={hospital.images || []} 
          name={hospital.name} 
        />
      </div>

      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── LEFT COLUMN (Details) ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* ── HOSPITAL INFO CARD ── */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              
              {/* UPDATED BADGES: Category & Type both shown properly */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {/* Category Badge */}
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 shadow-sm border border-gray-200 uppercase tracking-wide">
                  {getCategoryIcon(hospital.category)} {hospital.category || 'Private'}
                </span>
                
                {/* Type Badge */}
                <span
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white capitalize shadow-sm"
                  style={{ backgroundColor: theme }}
                >
                  🏥 {hospital.type || 'Hospital'}
                </span>

                {/* Verification Badge */}
                {hospital.isVerified && (
                  <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                    <FaCheckCircle /> Verified
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-2">{hospital.name}</h1>

              {hospital.address && (
                <p className="flex items-center gap-2 text-gray-600 mb-4 text-sm">
                  <FaMapMarkerAlt style={{ color: theme }} />
                  {[hospital.address.street, hospital.address.area,
                    hospital.address.city, hospital.address.state,
                    hospital.address.pincode].filter(Boolean).join(', ')}
                </p>
              )}

              {hospital.establishedDate && (
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg mb-5 w-fit border border-gray-100">
                  <FaCalendarAlt className="text-xl mt-1" style={{ color: theme }} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-700">Established</p>
                    <p className="text-sm text-gray-900 font-medium">
                      {new Date(hospital.establishedDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 font-medium">
                      {calculateYearsSince(hospital.establishedDate)}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-4 mb-5">
                {hospital.googleRating > 0 && (
                  <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-xl">
                    <FaGoogle className="text-blue-600" />
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-gray-800 text-lg">
                          {hospital.googleRating.toFixed(1)}
                        </span>
                        <FaStar className="text-yellow-400 text-sm" />
                      </div>
                      <p className="text-xs text-gray-500">
                        {hospital.googleReviewCount?.toLocaleString()} Google reviews
                      </p>
                    </div>
                  </div>
                )}
                {hospital.websiteRating > 0 && (
                  <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-xl">
                    <FaStar className="text-yellow-400" />
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-gray-800 text-lg">
                          {hospital.websiteRating.toFixed(1)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {hospital.totalReviews} user reviews
                      </p>
                    </div>
                  </div>
                )}
                {distance && (
                  <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-xl">
                    <FaMapMarkerAlt className="text-green-600" />
                    <div>
                      <span className="font-bold text-gray-800 text-lg">
                        {distance.toFixed(1)} km
                      </span>
                      <p className="text-xs text-gray-500">from you</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {hospital.owner && hospital.appointmentsEnabled && (
                  <button
                    onClick={() => navigate('/appointments/book', {
                      state: { facility: hospital, type: 'hospital' }
                    })}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-white transition hover:opacity-90 shadow-sm"
                    style={{ backgroundColor: theme }}
                  >
                    📅 Book Appointment
                  </button>
                )}
                
                {hospital.owner && !hospital.appointmentsEnabled && (
                  <div className="px-5 py-3 rounded-xl bg-gray-100 text-gray-600 text-sm font-medium">
                    📅 Appointments currently unavailable
                  </div>
                )}
                
                {!hospital.owner && (
                  <div className="px-5 py-3 rounded-xl bg-gray-100 text-gray-600 text-sm font-medium">
                    📅 Online appointments not available
                  </div>
                )}

                {(hospital.tests?.length > 0 || hospital.doctors?.length > 0 || hospital.surgeries?.length > 0 || unpricedServices.length > 0) ? (
                  <button
                    onClick={scrollToServices}
                    className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition flex items-center gap-2 shadow-sm"
                  >
                    <FaClipboardList /> View All Services
                  </button>
                ) : null}
                
                <MapButton hospital={hospital} />

                <button
                  onClick={handleToggleFavorite}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold border transition shadow-sm ${
                    isFavorite
                      ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <FaHeart className={isFavorite ? 'text-red-500' : 'text-gray-400'} />
                  {isFavorite ? 'Saved' : 'Save'}
                </button>
                
                <button
                  onClick={handleAddToCompare}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold border transition shadow-sm ${
                    isCompared
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <FaBalanceScale />
                  {isCompared ? 'Added' : 'Compare'}
                </button>
              </div>
            </div>

            {/* ── TABS ── */}
            <div id="price-list-tab" className="bg-white rounded-2xl shadow-md overflow-hidden min-h-[400px] scroll-mt-6">
              <div className="flex border-b border-gray-100">
                {tabs.map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-4 text-sm font-semibold capitalize transition-colors duration-200 ${
                      activeTab === tab ? 'text-white' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                    style={activeTab === tab ? { backgroundColor: theme } : {}}
                  >
                    {tab === 'overview'  && '📋 Overview'}
                    {tab === 'services'  && '💰 Services List'}
                    {tab === 'reviews'   && '⭐ Reviews'}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-8">
                    {hospital.description && (
                      <div>
                        <h3 className="font-bold text-gray-800 mb-3 text-lg">About</h3>
                        <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                          {hospital.description}
                        </p>
                      </div>
                    )}

                    {hospital.facilities?.length > 0 && (
                      <div>
                        <h3 className="font-bold text-gray-800 mb-3 text-lg">Facilities</h3>
                        <div className="flex flex-wrap gap-2">
                          {hospital.facilities.map((f, i) => (
                            <span
                              key={i}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold"
                              style={{ backgroundColor: `${theme}15`, color: theme }}
                            >
                              <FaCheckCircle className="text-xs" /> {f}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {(combinedTests.length > 0 || hospital.doctors?.length > 0) && (
                      <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                        <button
                          onClick={scrollToServices}
                          className="w-full flex items-center justify-between p-4 bg-white rounded-lg hover:shadow-md transition"
                        >
                          <div className="flex items-center gap-4">
                            <FaClipboardList className="text-3xl text-blue-600" />
                            <div className="text-left">
                              <h3 className="font-bold text-gray-900 text-lg">View All Services & Doctors</h3>
                              <p className="text-sm text-gray-600">
                                {combinedTests.length} Tests • {hospital.doctors?.length || 0} Doctors • Insurance & More
                              </p>
                            </div>
                          </div>
                          <span className="text-blue-600 font-bold text-2xl">→</span>
                        </button>
                      </div>
                    )}

                    {hospital.operatingHours && (
                      <div>
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-lg">
                          <FaClock style={{ color: theme }} /> Working Hours
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                          {['monday','tuesday','wednesday','thursday',
                            'friday','saturday','sunday'].map(day => (
                            <div key={day} className="flex justify-between items-center py-2 border-b border-gray-100">
                              <span className="text-sm text-gray-500 capitalize font-medium">{day}</span>
                              <span className={`text-sm font-semibold ${
                                hospital.operatingHours && hospital.operatingHours[day] === 'Closed' ? 'text-red-500' : 'text-gray-800'
                              }`}>
                                {(hospital.operatingHours && hospital.operatingHours[day]) || 'N/A'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'services' && (
                  <div className="animate-fadeIn space-y-10">
                    <PriceList services={hospital.services || []} themeColor={theme} />

                    {/* Unpriced Sections (Merged logic) */}
                    <div className="border-t border-gray-200 pt-10">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Services (Prices on Request)</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {combinedTests.length > 0 && ( 
                                <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                                    <div className="flex items-center gap-3 mb-3">
                                        <FaFlask className="text-xl" style={{ color: theme }} />
                                        <h3 className="font-bold text-gray-800">Tests / Diagnosis</h3>
                                    </div>
                                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-2">
                                        {combinedTests.map((item, i) => (
                                            <p key={i} className="text-sm text-gray-700 flex items-center gap-2">
                                                <FaCheckCircle className="text-green-500 text-xs" /> {item}
                                            </p>
                                        ))}
                                    </div>
                                </div> 
                            )}
                            
                            {combinedTreatments.length > 0 && ( 
                                <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                                    <div className="flex items-center gap-3 mb-3">
                                        <FaPills className="text-xl" style={{ color: theme }} />
                                        <h3 className="font-bold text-gray-800">Treatments / Consultation</h3>
                                    </div>
                                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-2">
                                        {combinedTreatments.map((item, i) => (
                                            <p key={i} className="text-sm text-gray-700 flex items-center gap-2">
                                                <FaCheckCircle className="text-green-500 text-xs" /> {item}
                                            </p>
                                        ))}
                                    </div>
                                </div> 
                            )}
                            
                            {combinedSurgeries.length > 0 && ( 
                                <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                                    <div className="flex items-center gap-3 mb-3">
                                        <FaCut className="text-xl" style={{ color: theme }} />
                                        <h3 className="font-bold text-gray-800">Surgeries Available</h3>
                                    </div>
                                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-2">
                                        {combinedSurgeries.map((item, i) => (
                                            <p key={i} className="text-sm text-gray-700 flex items-center gap-2">
                                                <FaCheckCircle className="text-green-500 text-xs" /> {item}
                                            </p>
                                        ))}
                                    </div>
                                </div> 
                            )}

                            {combinedProcedures.length > 0 && ( 
                                <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                                    <div className="flex items-center gap-3 mb-3">
                                        <FaClipboardList className="text-xl" style={{ color: theme }} />
                                        <h3 className="font-bold text-gray-800">Procedures</h3>
                                    </div>
                                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-2">
                                        {combinedProcedures.map((item, i) => (
                                            <p key={i} className="text-sm text-gray-700 flex items-center gap-2">
                                                <FaCheckCircle className="text-green-500 text-xs" /> {item}
                                            </p>
                                        ))}
                                    </div>
                                </div> 
                            )}

                            {combinedTherapies.length > 0 && ( 
                                <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                                    <div className="flex items-center gap-3 mb-3">
                                        <FaSpa className="text-xl" style={{ color: theme }} />
                                        <h3 className="font-bold text-gray-800">Therapies</h3>
                                    </div>
                                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-2">
                                        {combinedTherapies.map((item, i) => (
                                            <p key={i} className="text-sm text-gray-700 flex items-center gap-2">
                                                <FaCheckCircle className="text-green-500 text-xs" /> {item}
                                            </p>
                                        ))}
                                    </div>
                                </div> 
                            )}

                            {hospital.managementServices && hospital.managementServices.length > 0 && ( 
                                <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                                    <div className="flex items-center gap-3 mb-3">
                                        <FaClipboardList className="text-xl text-orange-600" />
                                        <h3 className="font-bold text-gray-800">Management</h3>
                                    </div>
                                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-2">
                                        {hospital.managementServices.map((item, i) => (
                                            <p key={i} className="text-sm text-gray-700 flex items-center gap-2">
                                                <FaCheckCircle className="text-green-500 text-xs" /> {item}
                                            </p>
                                        ))}
                                    </div>
                                </div> 
                            )}

                            {hospital.insuranceAccepted && hospital.insuranceAccepted.length > 0 && ( 
                                <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                                    <div className="flex items-center gap-3 mb-3">
                                        <FaShieldAlt className="text-xl text-green-600" />
                                        <h3 className="font-bold text-gray-800">Insurance Accepted</h3>
                                    </div>
                                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-2">
                                        {hospital.insuranceAccepted.map((item, i) => (
                                            <p key={i} className="text-sm text-gray-700 flex items-center gap-2">
                                                <FaShieldAlt className="text-green-600 text-xs" /> {item}
                                            </p>
                                        ))}
                                    </div>
                                </div> 
                            )}

                        </div>
                    </div>
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="animate-fadeIn">
                    <ReviewForm
                      facilityId={hospital._id || hospital.id}
                      facilityType="hospital"
                      onReviewSubmitted={() => {
                        alert('Review submitted for moderation!');
                        fetchHospital(); 
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN (Sidebar) ── */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-md p-5 border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaPhone style={{ color: theme }} /> Contact Info
              </h3>
              <div className="space-y-3">
                {hospital.phone && (
                  <a href={`tel:${hospital.phone}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition border border-transparent hover:border-gray-200">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0 shadow-sm" style={{ backgroundColor: theme }}>
                      <FaPhone className="text-sm" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">Phone</p>
                      <p className="font-semibold text-gray-800">{hospital.phone}</p>
                    </div>
                  </a>
                )}
                {hospital.email && (
                  <a href={`mailto:${hospital.email}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition border border-transparent hover:border-gray-200">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0 shadow-sm" style={{ backgroundColor: theme }}>
                      <FaEnvelope className="text-sm" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">Email</p>
                      <p className="font-semibold text-gray-800 text-sm truncate">{hospital.email}</p>
                    </div>
                  </a>
                )}
                {hospital.address?.landmark && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0 shadow-sm" style={{ backgroundColor: theme }}>
                      <FaMapMarkerAlt className="text-sm" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">Landmark</p>
                      <p className="font-semibold text-gray-800 text-sm">{hospital.address.landmark}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-5 border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-3">📍 Location</h3>
              <div className="h-32 rounded-xl flex items-center justify-center mb-3 border border-dashed border-gray-300" style={{ backgroundColor: theme + '05' }}>
                <div className="text-center">
                  <FaMapMarkerAlt className="text-4xl mx-auto mb-1" style={{ color: theme }} />
                  <p className="text-sm text-gray-600 font-medium">
                    {hospital.address?.city}, {hospital.address?.state}
                  </p>
                  {distance && (
                    <p className="text-xs text-green-600 font-semibold mt-1">{distance.toFixed(1)} km away</p>
                  )}
                </div>
              </div>
              <div className="w-full">
               <MapButton hospital={hospital} fullWidth={true} />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-5 border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4">ℹ️ Quick Info</h3>
              <div className="space-y-3 text-sm">
                
                <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                  <span className="text-gray-500">Category</span>
                  <span className="font-semibold capitalize text-gray-800 flex items-center gap-1">
                    {getCategoryIcon(hospital.category)} {hospital.category || 'Private'}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                  <span className="text-gray-500">Type</span>
                  <span className="font-semibold capitalize text-gray-800">{hospital.type || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                  <span className="text-gray-500">Emergency</span>
                  <span className={`font-semibold ${hospital.emergencyAvailable ? 'text-green-600' : 'text-red-500'}`}>
                    {hospital.emergencyAvailable ? '✅ Available' : '❌ No'}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                  <span className="text-gray-500">Services</span>
                  <span className="font-semibold text-gray-800">{hospital.services?.length || 0} listed</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Pin Code</span>
                  <span className="font-semibold text-gray-800">{hospital.address?.pincode || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default HospitalDetails;