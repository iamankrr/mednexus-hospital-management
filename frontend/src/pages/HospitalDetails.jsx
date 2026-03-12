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
import API_URL from '../config/api'; 

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

const getCategoryIcon = (category) => {
  const cat = category?.toLowerCase() || '';
  if (cat.includes('gov')) return '🏛️';
  if (cat.includes('public')) return '🏥';
  if (cat.includes('charity') || cat.includes('ngo')) return '❤️';
  return '💼'; 
};

const HospitalDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const locationRouter = useLocation(); 
  
  // ✅ FIX: Safe Context Destructuring
  const comparisonContext = useComparison() || {};
  const addToComparison = comparisonContext.addToComparison || comparisonContext.addToCompare || (() => {});
  const removeFromComparison = comparisonContext.removeFromComparison || comparisonContext.removeFromCompare || (() => {});
  const comparisonList = comparisonContext.comparisonList || comparisonContext.compareList || [];
  
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

      const response = await axios.get(`${API_URL}/api/favorites`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const favorites = response.data.data;
      setIsFavorite(favorites.hospitals?.includes(id));
    } catch (error) {
      console.error('Check favorite error:', error);
    }
  };

  const checkUserRole = () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return true; 
    const user = JSON.parse(userStr);
    if (user.role === 'admin' || user.role === 'owner') {
      alert("You are logged in as Admin/Owner. Please login with a user account to continue.");
      return false;
    }
    return true;
  };

  const handleToggleFavorite = async () => {
    if (!checkUserRole()) return;

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to manage favorites');
      navigate('/login');
      return;
    }

    try {
      const endpoint = isFavorite ? '/api/favorites/remove' : '/api/favorites/add';
      await axios.post(
        `${API_URL}${endpoint}`,
        { facilityId: id, facilityType: 'hospital' },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      setIsFavorite(!isFavorite);
      alert(isFavorite ? '✅ Removed from favorites' : '✅ Added to favorites');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update favorites');
    }
  };

  // ✅ FIX: Compare Toggle logic exactly matching context rules
  const isCompared = hospital ? comparisonList.some(h => (h._id || h.id) === (hospital._id || hospital.id)) : false;
  const handleCompareToggle = () => {
    if (!checkUserRole()) return;
    const hId = hospital._id || hospital.id;
    if (isCompared) {
      removeFromComparison(hId);
    } else {
      addToComparison(hospital, 'hospital');
    }
  };

  const handleBookAppointment = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in to book an appointment!');
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      navigate('/login');
      return;
    }
    
    if (!checkUserRole()) return;
    navigate('/appointments/book', { state: { facility: hospital, type: 'hospital' } });
  };

  const scrollToServices = () => {
    const servicesSection = document.getElementById('services-section');
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: 'smooth' });
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

  const totalServicesListed = 
    (hospital.services?.length || 0) + 
    combinedTests.length + 
    combinedTreatments.length + 
    combinedSurgeries.length +
    combinedTherapies.length + 
    combinedProcedures.length +
    (hospital.managementServices?.length || 0) +
    (hospital.insuranceAccepted?.length || 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="h-2 w-full" style={{ backgroundColor: theme }} />

      <div className="max-w-6xl mx-auto px-4 pt-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium mb-4">
          <FaArrowLeft /> Back
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-4 mb-6">
        <PhotoGallery images={hospital.images || []} name={hospital.name} />
      </div>

      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 shadow-sm border border-gray-200 uppercase tracking-wide">
                  {getCategoryIcon(hospital.category)} {hospital.category || 'Private'}
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white capitalize shadow-sm" style={{ backgroundColor: theme }}>
                  🏥 {hospital.type || 'Hospital'}
                </span>
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
                        day: 'numeric', month: 'long', year: 'numeric'
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

              <div className="flex flex-wrap gap-3">
                {hospital.owner && hospital.appointmentsEnabled && (
                  <button onClick={handleBookAppointment} className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-white transition hover:opacity-90 shadow-sm" style={{ backgroundColor: theme }}>
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

                <button onClick={scrollToServices} className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition flex items-center gap-2 shadow-sm">
                  <FaClipboardList /> View All Services
                </button>
                
                <MapButton hospital={hospital} />

                <button onClick={handleToggleFavorite} className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold border transition shadow-sm ${isFavorite ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                  <FaHeart className={isFavorite ? 'text-red-500' : 'text-gray-400'} />
                  {isFavorite ? 'Saved' : 'Save'}
                </button>
                
                {/* ✅ FIX: Dynamic Comparison Toggle Button */}
                <button onClick={handleCompareToggle} className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold border transition shadow-sm ${isCompared ? 'bg-orange-500 text-white border-orange-500' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                  <FaBalanceScale />
                  {isCompared ? 'Added' : 'Compare'}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md overflow-hidden min-h-[400px]">
              <div className="flex border-b border-gray-100">
                {tabs.map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-4 text-sm font-semibold capitalize transition-colors duration-200 ${activeTab === tab ? 'text-white' : 'text-gray-500 hover:bg-gray-50'}`} style={activeTab === tab ? { backgroundColor: theme } : {}}>
                    {tab === 'overview'  && '📋 Overview'}
                    {tab === 'services'  && '💰 Price List'}
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
                            <span key={i} className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ backgroundColor: `${theme}15`, color: theme }}>
                              <FaCheckCircle className="text-xs" /> {f}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                      <button onClick={scrollToServices} className="w-full flex items-center justify-between p-4 bg-white rounded-lg hover:shadow-md transition">
                        <div className="flex items-center gap-4">
                          <FaClipboardList className="text-3xl text-blue-600" />
                          <div className="text-left">
                            <h3 className="font-bold text-gray-900 text-lg">View All Services & Doctors</h3>
                            <p className="text-sm text-gray-600">
                              {combinedTests.length} Tests • {combinedTreatments.length} Treatments • {hospital.doctors?.length || 0} Doctors • {hospital.numberOfBeds || 0} Beds
                            </p>
                          </div>
                        </div>
                        <span className="text-blue-600 font-bold text-2xl">→</span>
                      </button>
                    </div>

                    {hospital.operatingHours && (
                      <div>
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-lg">
                          <FaClock style={{ color: theme }} /> Working Hours
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                          {['monday','tuesday','wednesday','thursday', 'friday','saturday','sunday'].map(day => (
                            <div key={day} className="flex justify-between items-center py-2 border-b border-gray-100">
                              <span className="text-sm text-gray-500 capitalize font-medium">{day}</span>
                              <span className={`text-sm font-semibold ${hospital.operatingHours && hospital.operatingHours[day] === 'Closed' ? 'text-red-500' : 'text-gray-800'}`}>
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
                  <div className="animate-fadeIn">
                    <PriceList services={hospital.services || []} themeColor={theme} />
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="animate-fadeIn">
                    <ReviewForm
                      facilityId={hospital._id || hospital.id}
                      facilityType="hospital"
                      onReviewSubmitted={() => { fetchHospital(); }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

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
                  <span className="font-semibold text-gray-800">{totalServicesListed} listed</span>
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

      <div id="services-section" className="max-w-6xl mx-auto px-4 py-12 scroll-mt-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Services & Facilities</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {combinedTests.length > 0 && (
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center"><FaFlask className="text-xl text-blue-600" /></div>
                <div><h3 className="font-bold text-gray-900">Tests / Diagnosis</h3><p className="text-sm text-gray-600">{combinedTests.length} available</p></div>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {combinedTests.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm"><span className="text-green-600">✓</span><span className="text-gray-700">{item}</span></div>
                ))}
              </div>
            </div>
          )}

          {combinedTreatments.length > 0 && (
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center"><FaPills className="text-xl text-green-600" /></div>
                <div><h3 className="font-bold text-gray-900">Treatments</h3><p className="text-sm text-gray-600">{combinedTreatments.length} available</p></div>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {combinedTreatments.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm"><span className="text-green-600">✓</span><span className="text-gray-700">{item}</span></div>
                ))}
              </div>
            </div>
          )}

          {combinedSurgeries.length > 0 && (
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center"><FaCut className="text-xl text-red-600" /></div>
                <div><h3 className="font-bold text-gray-900">Surgeries</h3><p className="text-sm text-gray-600">{combinedSurgeries.length} available</p></div>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {combinedSurgeries.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm"><span className="text-green-600">✓</span><span className="text-gray-700">{item}</span></div>
                ))}
              </div>
            </div>
          )}

          {combinedProcedures.length > 0 && (
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center"><FaClipboardList className="text-xl text-purple-600" /></div>
                <div><h3 className="font-bold text-gray-900">Procedures</h3><p className="text-sm text-gray-600">{combinedProcedures.length} available</p></div>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {combinedProcedures.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm"><span className="text-green-600">✓</span><span className="text-gray-700">{item}</span></div>
                ))}
              </div>
            </div>
          )}

          {combinedTherapies.length > 0 && (
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center"><FaSpa className="text-xl text-teal-600" /></div>
                <div><h3 className="font-bold text-gray-900">Therapies</h3><p className="text-sm text-gray-600">{combinedTherapies.length} available</p></div>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {combinedTherapies.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm"><span className="text-green-600">✓</span><span className="text-gray-700">{item}</span></div>
                ))}
              </div>
            </div>
          )}

          {hospital.managementServices?.length > 0 && (
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center"><FaClipboardList className="text-xl text-orange-600" /></div>
                <div><h3 className="font-bold text-gray-900">Management</h3><p className="text-sm text-gray-600">{hospital.managementServices.length} services</p></div>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {hospital.managementServices.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm"><span className="text-green-600">✓</span><span className="text-gray-700">{item}</span></div>
                ))}
              </div>
            </div>
          )}

          {hospital.insuranceAccepted?.length > 0 && (
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center"><FaShieldAlt className="text-xl text-green-600" /></div>
                <div><h3 className="font-bold text-gray-900">Insurance Accepted</h3><p className="text-sm text-gray-600">{hospital.insuranceAccepted.length} providers</p></div>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {hospital.insuranceAccepted.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm"><FaShieldAlt className="text-green-600 text-xs" /><span className="text-gray-700">{item}</span></div>
                ))}
              </div>
            </div>
          )}

          {hospital.numberOfBeds > 0 && (
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center"><FaBed className="text-xl text-blue-600" /></div>
                <div><h3 className="font-bold text-gray-900">Number of Beds</h3><p className="text-sm text-gray-600">Total capacity</p></div>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-blue-600">{hospital.numberOfBeds}</p>
                <p className="text-sm text-gray-600 mt-1">Beds Available</p>
              </div>
            </div>
          )}
        </div>

        {hospital.doctors && hospital.doctors.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Doctors</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {hospital.doctors.map((doctor, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition">
                  <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-200">
                    {doctor.photo ? <img src={doctor.photo} alt={doctor.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><FaUserMd className="text-6xl text-blue-400" /></div>}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-1">{doctor.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{doctor.specialization}</p>
                    {doctor.experience && <p className="text-xs text-gray-500 mb-2">Exp: {doctor.experience}</p>}
                    {doctor.availability && <p className="text-xs text-gray-600 mb-2">📅 {doctor.availability}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default HospitalDetails;