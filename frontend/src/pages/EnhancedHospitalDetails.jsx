import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  FaStar, FaGoogle, FaPhone, FaEnvelope, FaMapMarkerAlt,
  FaClock, FaAmbulance, FaHeart, FaArrowLeft, FaGlobe,
  FaCheckCircle, FaBalanceScale, FaCalendarAlt, FaClipboardList,
  FaFlask, FaPills, FaCut, FaSpa, FaUserMd, FaShieldAlt,
  FaFacebook, FaInstagram, FaTwitter, FaYoutube, FaAward,
  FaUserTie, FaStethoscope, FaShare, FaPrint, FaFlag,
  FaSearch, FaChevronDown, FaChevronUp, FaInfoCircle
} from 'react-icons/fa';
import MapButton from '../components/MapButton';
import PriceList from '../components/PriceList';
import ReviewForm from '../components/ReviewForm';
import PhotoGallery from '../components/PhotoGallery';
import { useComparison } from '../context/ComparisonContext';
import { useLocation as useUserLocation } from '../context/LocationContext';
import { calculateDistance } from '../utils/distance';
import API_URL from '../config/api';

// ─── Helpers ────────────────────────────────────────────────────────────────

const calculateYearsSince = (date) => {
  if (!date) return null;
  const est = new Date(date);
  const now = new Date();
  const years = now.getFullYear() - est.getFullYear();
  const months = now.getMonth() - est.getMonth();
  if (years === 0) return months === 0 ? 'Established this month' : `Established ${months} ${months === 1 ? 'month' : 'months'} ago`;
  return `Established ${years} ${years === 1 ? 'year' : 'years'} ago`;
};

const getCategoryIcon = (category) => {
  const cat = category?.toLowerCase() || '';
  if (cat.includes('gov')) return '🏛️';
  if (cat.includes('public')) return '🏥';
  if (cat.includes('charity') || cat.includes('ngo')) return '❤️';
  return '💼';
};

const formatURL = (url) => {
  if (!url) return '#';
  return url.startsWith('http') ? url : `https://${url}`;
};

// ─── Feature 2: "Open Now" badge helper ─────────────────────────────────────
const getOpenStatus = (operatingHours) => {
  if (!operatingHours) return null;
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const now = new Date();
  const dayName = days[now.getDay()];
  const hoursStr = operatingHours[dayName];
  if (!hoursStr) return null;
  if (hoursStr.toLowerCase() === 'closed') return { open: false, text: 'Closed today' };
  if (hoursStr.toLowerCase().includes('emergency')) return { open: true, text: 'Emergency only', color: 'orange' };

  const match = hoursStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*-\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return null;

  const toMinutes = (h, m, period) => {
    let hour = parseInt(h);
    if (period.toUpperCase() === 'PM' && hour !== 12) hour += 12;
    if (period.toUpperCase() === 'AM' && hour === 12) hour = 0;
    return hour * 60 + parseInt(m);
  };

  const openMin = toMinutes(match[1], match[2], match[3]);
  const closeMin = toMinutes(match[4], match[5], match[6]);
  const nowMin = now.getHours() * 60 + now.getMinutes();

  if (nowMin >= openMin && nowMin < closeMin) {
    const minsLeft = closeMin - nowMin;
    if (minsLeft <= 60) return { open: true, text: `Closes in ${minsLeft} min`, color: 'orange' };
    return { open: true, text: 'Open Now', color: 'green' };
  }
  if (nowMin < openMin) {
    const minsToOpen = openMin - nowMin;
    if (minsToOpen <= 60) return { open: false, text: `Opens in ${minsToOpen} min` };
    return { open: false, text: `Opens at ${match[1]}:${match[2]} ${match[3]}` };
  }
  return { open: false, text: 'Closed now' };
};

// ─── Main Component ──────────────────────────────────────────────────────────
const EnhancedHospitalDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const locationRouter = useLocation();

  const comparisonContext = useComparison() || {};
  const addToComparison = comparisonContext.addToComparison || comparisonContext.addToCompare || (() => {});
  const removeFromComparison = comparisonContext.removeFromComparison || comparisonContext.removeFromCompare || (() => {});
  const comparisonList = comparisonContext.comparisonList || comparisonContext.compareList || [];

  const { userLocation } = useUserLocation();

  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [distance, setDistance] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAboutExpanded, setIsAboutExpanded] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Feature 4: Insurance search
  const [insuranceSearch, setInsuranceSearch] = useState('');

  // Feature 5: Doctor filter
  const [doctorFilter, setDoctorFilter] = useState('All');

  // Feature 10: Report modal
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportText, setReportText] = useState('');
  const [reportSent, setReportSent] = useState(false);

  // Feature 11: Before-visit checklist expanded
  const [checklistOpen, setChecklistOpen] = useState(false);

  // Feature 12: Cost calculator states
  const [calcRoom, setCalcRoom] = useState('');
  const [calcNights, setCalcNights] = useState(1);
  const [calcPackage, setCalcPackage] = useState('');

  // Feature 13: Similar Hospitals state
  const [similarHospitals, setSimilarHospitals] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchHospital();
    checkIfFavorite();
    fetchReviews();
  }, [id]);

  const fetchHospital = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/hospitals/${id}`);
      const data = res.data.data;
      setHospital(data);

      // Feature 13: similar hospitals fetch karo
      if (data.address?.city) {
        fetchSimilarHospitals(data.address.city, id);
      }

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

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      const res = await axios.get(`${API_URL}/api/reviews/hospital/${id}`);
      setReviews(res.data.data || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setReviewsLoading(false);
    }
  };

  // Feature 13: Fetch function
  const fetchSimilarHospitals = async (city, currentId) => {
    try {
      const res = await axios.get(`${API_URL}/api/hospitals?city=${city}&limit=4`);
      const all = res.data.data || [];
      // current hospital ko exclude karo
      setSimilarHospitals(all.filter(h => (h._id || h.id) !== currentId).slice(0, 3));
    } catch (err) {
      console.error('Similar hospitals fetch failed:', err);
    }
  };

  const checkIfFavorite = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await axios.get(`${API_URL}/api/favorites`, { headers: { Authorization: `Bearer ${token}` } });
      setIsFavorite(response.data.data.hospitals?.includes(id));
    } catch (error) {}
  };

  const checkUserRole = () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return true;
    const user = JSON.parse(userStr);
    if (user.role === 'admin' || user.role === 'owner') {
      alert('You are logged in as Admin/Owner. Please login with a user account to continue.');
      return false;
    }
    return true;
  };

  const handleToggleFavorite = async () => {
    if (!checkUserRole()) return;
    const token = localStorage.getItem('token');
    if (!token) { alert('Please login to manage favorites'); navigate('/login'); return; }
    try {
      const endpoint = isFavorite ? '/api/favorites/remove' : '/api/favorites/add';
      await axios.post(`${API_URL}${endpoint}`, { facilityId: id, facilityType: 'hospital' }, { headers: { Authorization: `Bearer ${token}` } });
      setIsFavorite(!isFavorite);
      alert(isFavorite ? '✅ Removed from favorites' : '✅ Added to favorites');
    } catch (error) { alert('Failed to update favorites'); }
  };

  const handleCompareToggle = () => {
    if (!checkUserRole()) return;
    if (isCompared) removeFromComparison(hospital._id || hospital.id);
    else addToComparison(hospital, 'hospital');
  };

  const handleBookAppointment = (doctorId = null) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in to book an appointment!');
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      navigate('/login');
      return;
    }
    if (!checkUserRole()) return;
    navigate(`/appointments/book?hospital=${hospital._id || hospital.id}${doctorId ? `&doctor=${doctorId}` : ''}`);
  };

  const scrollToServices = () => document.getElementById('services-section')?.scrollIntoView({ behavior: 'smooth' });

  // ── Feature 3: Share ──────────────────────────────────────────────────────
  const handleShare = async () => {
    const shareData = {
      title: hospital.name,
      text: `Check out ${hospital.name} on MedNexus — ${hospital.address?.city}, ${hospital.address?.state}`,
      url: window.location.href,
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch (e) {}
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert('🔗 Link copied to clipboard!');
    }
  };

  // ── Feature 7: Print ──────────────────────────────────────────────────────
  const handlePrint = () => window.print();

  // ── Feature 10: Report submit ─────────────────────────────────────────────
  const handleReportSubmit = async () => {
    if (!reportText.trim()) return;
    try {
      await axios.post(`${API_URL}/api/contact`, {
        name: 'Anonymous User',
        email: 'report@mednexus.app',
        subject: `Incorrect info report: ${hospital.name}`,
        message: reportText,
      });
    } catch (e) {}
    setReportSent(true);
    setTimeout(() => { setShowReportModal(false); setReportSent(false); setReportText(''); }, 2000);
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

  const isCompared = comparisonList.some(h => (h._id || h.id) === (hospital._id || hospital.id));
  const theme = hospital.themeColor || '#1E40AF';
  const tabs = ['overview', 'packages & rooms', 'services', 'reviews'];

  // ── Feature 2: Open status ────────────────────────────────────────────────
  const openStatus = getOpenStatus(hospital.operatingHours);

  // ── Feature 5: Doctor filter data ────────────────────────────────────────
  const allSpecializations = ['All', ...Array.from(new Set((hospital.doctors || []).map(d => d.specialization).filter(Boolean)))];
  const filteredDoctors = doctorFilter === 'All'
    ? (hospital.doctors || [])
    : (hospital.doctors || []).filter(d => d.specialization === doctorFilter);

  // ── Feature 6: Rating breakdown ───────────────────────────────────────────
  const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => Math.round(r.rating) === star).length,
  }));
  const maxRatingCount = Math.max(...ratingCounts.map(r => r.count), 1);

  // ── Services data ─────────────────────────────────────────────────────────
  const unpricedServices = hospital.services?.filter(s => !s.price || s.price <= 0) || [];
  const combinedTests = Array.from(new Set([...(hospital.tests || []), ...unpricedServices.filter(s => ['Pathology', 'Radiology', 'Diagnosis'].includes(s.category)).map(s => s.name)]));
  const combinedTreatments = Array.from(new Set([...(hospital.treatments || []), ...unpricedServices.filter(s => ['Consultation', 'OPD', 'General', 'Other'].includes(s.category)).map(s => s.name)]));
  const combinedSurgeries = Array.from(new Set([...(hospital.surgeries || []), ...unpricedServices.filter(s => s.category === 'Surgery').map(s => s.name)]));
  const combinedTherapies = Array.from(new Set([...(hospital.therapies || []), ...unpricedServices.filter(s => s.category === 'Therapy').map(s => s.name)]));
  const combinedProcedures = Array.from(new Set([...(hospital.procedures || []), ...unpricedServices.filter(s => ['Dental', 'Eye', 'Orthopedic', 'Maternity', 'Cardiology', 'Neurology'].includes(s.category)).map(s => s.name)]));
  const totalServicesListed = combinedTests.length + combinedTreatments.length + combinedSurgeries.length + combinedTherapies.length + combinedProcedures.length + (hospital.managementServices?.length || 0) + (hospital.insuranceAccepted?.length || 0);

  // ── Feature 4: Filtered insurance ────────────────────────────────────────
  const filteredInsurance = (hospital.insuranceAccepted || []).filter(i =>
    i.toLowerCase().includes(insuranceSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-32 overflow-x-hidden">
      <div className="h-2 w-full print:hidden" style={{ backgroundColor: theme }} />

      {/* ── Back button ── */}
      <div className="max-w-6xl mx-auto px-4 pt-4 print:hidden">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium mb-4">
          <FaArrowLeft /> Back
        </button>
      </div>

      {/* ── Photo Gallery ── */}
      <div className="max-w-6xl mx-auto px-4 mb-6 print:hidden">
        <PhotoGallery images={hospital.images || []} name={hospital.name} />
      </div>

      <div className="max-w-6xl mx-auto px-4">

        {/* ── Announcements ── */}
        {hospital.announcements?.length > 0 && (
          <div className="mb-6 space-y-3 print:hidden">
            {hospital.announcements.map((ann, idx) => (
              <div key={idx} className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-xl shadow-sm flex items-start gap-3">
                <span className="text-2xl mt-1">📢</span>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-yellow-800 font-bold">{ann.title}</h4>
                    {ann.date && (
                      <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-full shrink-0">
                        {new Date(ann.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-yellow-700">{ann.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">

            {/* ── Main Info Card ── */}
            <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6">

              {/* Badges row */}
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
                {hospital.documents?.nabhAccreditation && (
                  <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
                    <FaAward /> NABH Accredited
                  </span>
                )}

                {/* ── Feature 2: Open Now badge ── */}
                {openStatus && (
                  <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                    openStatus.color === 'green' ? 'bg-green-100 text-green-700' :
                    openStatus.color === 'orange' ? 'bg-orange-100 text-orange-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      openStatus.open ? (openStatus.color === 'orange' ? 'bg-orange-500' : 'bg-green-500') : 'bg-red-500'
                    }`}></span>
                    {openStatus.text}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 leading-tight">{hospital.name}</h1>

              {hospital.address && (
                <p className="flex items-start sm:items-center gap-2 text-gray-600 mb-4 text-sm leading-snug">
                  <FaMapMarkerAlt className="mt-1 sm:mt-0 shrink-0" style={{ color: theme }} />
                  <span>
                    {[hospital.address.street, hospital.address.area, hospital.address.city, hospital.address.state, hospital.address.pincode].filter(Boolean).join(', ')}
                    {hospital.address.landmark && ` (Landmark: ${hospital.address.landmark})`}
                  </span>
                </p>
              )}

              {hospital.establishedDate && (
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg mb-5 w-full sm:w-fit border border-gray-100">
                  <FaCalendarAlt className="text-xl mt-1 shrink-0" style={{ color: theme }} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-700">Established</p>
                    <p className="text-sm text-gray-900 font-medium">
                      {new Date(hospital.establishedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 font-medium">{calculateYearsSince(hospital.establishedDate)}</p>
                  </div>
                </div>
              )}

              {/* Ratings row */}
              <div className="flex flex-wrap gap-3 mb-5">
                {hospital.googleRating > 0 && (
                  <div className="flex items-center gap-2 bg-blue-50 px-3 sm:px-4 py-2 rounded-xl flex-1 sm:flex-none">
                    <FaGoogle className="text-blue-600 shrink-0" />
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-gray-800 text-base sm:text-lg">{hospital.googleRating.toFixed(1)}</span>
                        <FaStar className="text-yellow-400 text-xs sm:text-sm" />
                      </div>
                      <p className="text-[10px] sm:text-xs text-gray-500">{hospital.googleReviewCount?.toLocaleString()} Google reviews</p>
                    </div>
                  </div>
                )}
                {hospital.websiteRating > 0 && (
                  <div className="flex items-center gap-2 bg-yellow-50 px-3 sm:px-4 py-2 rounded-xl flex-1 sm:flex-none">
                    <FaStar className="text-yellow-400 shrink-0" />
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-gray-800 text-base sm:text-lg">{hospital.websiteRating.toFixed(1)}</span>
                      </div>
                      <p className="text-[10px] sm:text-xs text-gray-500">{hospital.totalReviews} user reviews</p>
                    </div>
                  </div>
                )}
                {distance && (
                  <div className="flex items-center gap-2 bg-green-50 px-3 sm:px-4 py-2 rounded-xl flex-1 sm:flex-none">
                    <FaMapMarkerAlt className="text-green-600 shrink-0" />
                    <div>
                      <span className="font-bold text-gray-800 text-base sm:text-lg">{distance.toFixed(1)} km</span>
                      <p className="text-[10px] sm:text-xs text-gray-500">from you</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-2 sm:gap-3 print:hidden">
                {hospital.owner && hospital.appointmentsEnabled ? (
                  <button
                    onClick={() => handleBookAppointment(null)}
                    className="w-full sm:w-auto flex justify-center items-center gap-2 px-5 py-3 rounded-xl font-bold text-white transition hover:opacity-90 shadow-sm"
                    style={{ backgroundColor: theme }}
                  >
                    📅 Book General Appointment
                  </button>
                ) : (
                  <div className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gray-100 text-gray-600 text-sm font-medium flex justify-center items-center gap-2">
                    📅 Appointments Unavailable
                  </div>
                )}

                <button onClick={scrollToServices} className="w-full sm:w-auto flex justify-center items-center px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition gap-2 shadow-sm">
                  <FaClipboardList /> View All Services
                </button>

                <div className="flex gap-2 w-full sm:w-auto">
                  <div className="flex-1 sm:flex-none"><MapButton hospital={hospital} fullWidth={true} /></div>
                  <button
                    onClick={handleToggleFavorite}
                    className={`flex-1 sm:flex-none flex justify-center items-center gap-2 px-4 py-3 rounded-xl font-semibold border transition shadow-sm ${isFavorite ? 'bg-red-50 text-red-600 border-red-200' : 'bg-white text-gray-700'}`}
                  >
                    <FaHeart className={isFavorite ? 'text-red-500' : 'text-gray-400'} />
                    <span className="sm:inline">{isFavorite ? 'Saved' : 'Save'}</span>
                  </button>
                  <button
                    onClick={handleCompareToggle}
                    className={`flex-1 sm:flex-none flex justify-center items-center gap-2 px-4 py-3 rounded-xl font-semibold border transition shadow-sm ${isCompared ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-700'}`}
                  >
                    <FaBalanceScale />
                    <span className="sm:inline">{isCompared ? 'Added' : 'Compare'}</span>
                  </button>

                  {/* ── Feature 3: Share button ── */}
                  <button
                    onClick={handleShare}
                    className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-4 py-3 rounded-xl font-semibold border bg-white text-gray-700 hover:bg-gray-50 transition shadow-sm"
                    title="Share this hospital"
                  >
                    <FaShare className="text-blue-500" />
                    <span className="sm:inline">Share</span>
                  </button>

                  {/* ── Feature 7: Print button ── */}
                  <button
                    onClick={handlePrint}
                    className="hidden sm:flex justify-center items-center gap-2 px-4 py-3 rounded-xl font-semibold border bg-white text-gray-700 hover:bg-gray-50 transition shadow-sm"
                    title="Print / Save as PDF"
                  >
                    <FaPrint className="text-gray-500" />
                  </button>
                </div>
              </div>
            </div>

            {/* ── Tabs ── */}
            <div className="bg-white rounded-2xl shadow-md overflow-hidden min-h-[400px]">
              <div className="flex flex-nowrap border-b border-gray-100 overflow-x-auto scrollbar-hide snap-x">
                {tabs.map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`snap-start shrink-0 min-w-max px-6 py-4 text-sm font-semibold capitalize transition-colors duration-200 whitespace-nowrap ${activeTab === tab ? 'text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                    style={activeTab === tab ? { backgroundColor: theme } : {}}
                  >
                    {tab === 'overview' && '📋 Overview'}
                    {tab === 'packages & rooms' && '🛏️ Packages & Rooms'}
                    {tab === 'services' && '💰 Price List'}
                    {tab === 'reviews' && '⭐ Reviews'}
                  </button>
                ))}
              </div>

              <div className="p-4 sm:p-6">

                {/* ── OVERVIEW TAB ── */}
                {activeTab === 'overview' && (
                  <div className="space-y-8">

                    {hospital.emergencyAvailable && (
                      <div className="bg-red-50 border border-red-100 rounded-xl p-4 sm:p-5">
                        <h3 className="text-red-600 font-bold text-base sm:text-lg mb-3 flex items-center gap-2">
                          <FaAmbulance /> 24/7 Emergency Services
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          {hospital.emergencyDetails?.contactNumber && (
                            <div>
                              <p className="text-gray-500 font-medium text-xs sm:text-sm">Helpline</p>
                              <p className="font-bold text-red-700 text-sm sm:text-base">{hospital.emergencyDetails.contactNumber}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-gray-500 font-medium text-xs sm:text-sm">Ambulances</p>
                            <p className="font-bold text-gray-800">{hospital.emergencyDetails?.ambulanceCount || 'Available'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 font-medium text-xs sm:text-sm">Trauma Center</p>
                            <p className="font-bold text-gray-800">{hospital.emergencyDetails?.traumaCenter ? '✅ Yes' : '❌ No'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 font-medium text-xs sm:text-sm">24/7 Doctors</p>
                            <p className="font-bold text-gray-800">{hospital.emergencyDetails?.doctors24x7 ? '✅ Yes' : '❌ No'}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {hospital.description && (
                      <div>
                        <h3 className="font-bold text-gray-800 mb-3 text-lg">About</h3>
                        <p className="text-gray-600 leading-relaxed text-sm md:text-base whitespace-pre-wrap">
                          {isAboutExpanded || hospital.description.length <= 250
                            ? hospital.description
                            : `${hospital.description.substring(0, 250)}...`}
                        </p>
                        {hospital.description.length > 250 && (
                          <button onClick={() => setIsAboutExpanded(!isAboutExpanded)} className="text-blue-600 font-bold text-sm mt-2 hover:underline focus:outline-none">
                            {isAboutExpanded ? 'Read Less' : 'Read More'}
                          </button>
                        )}
                      </div>
                    )}

                    {/* ── Feature 11: Before-visit checklist ── */}
                    <div className="border border-blue-100 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setChecklistOpen(!checklistOpen)}
                        className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 transition text-left"
                      >
                        <span className="font-bold text-blue-800 flex items-center gap-2">
                          <FaInfoCircle /> What to bring for your visit
                        </span>
                        {checklistOpen ? <FaChevronUp className="text-blue-600 shrink-0" /> : <FaChevronDown className="text-blue-600 shrink-0" />}
                      </button>
                      {checklistOpen && (
                        <div className="p-4 bg-white grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {[
                            '🪪 Aadhar Card / Govt. ID proof',
                            '🏥 Health Insurance Card',
                            '📋 Previous medical reports / prescriptions',
                            '💊 Current medicines list',
                            '💳 Payment method (cash or card)',
                            '📞 Emergency contact number',
                            '🩺 Doctor referral letter (if any)',
                            '📁 Old X-rays / Scan reports (if applicable)',
                          ].map((item, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-gray-700 py-1">
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {hospital.departments?.length > 0 && (
                      <div>
                        <h3 className="font-bold text-gray-800 mb-3 text-lg flex items-center justify-between">
                          Key Departments
                          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{hospital.departments.length} Total</span>
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                          {hospital.departments.map((dept, i) => (
                            <div key={i} className="p-3 border border-gray-100 bg-gray-50 rounded-lg">
                              <p className="font-bold text-gray-800 text-sm">{dept.name}</p>
                              {dept.headDoctor && <p className="text-xs text-gray-500 mt-1">Head: <span className="font-semibold text-gray-700">{dept.headDoctor}</span></p>}
                              {dept.description && <p className="text-xs text-gray-600 mt-1 line-clamp-2">{dept.description}</p>}
                            </div>
                          ))}
                        </div>
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

                    {hospital.diagnosticCenterDetails?.labAvailable && (
                      <div className="bg-purple-50 p-4 sm:p-5 rounded-xl border border-purple-100">
                        <h3 className="font-bold text-purple-800 mb-3 flex items-center gap-2"><FaFlask /> In-House Diagnostic Center</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-sm">
                          {hospital.diagnosticCenterDetails.nablCertified && <div className="font-bold text-purple-700 flex items-center gap-2"><span>✅</span> NABL Certified</div>}
                          {hospital.diagnosticCenterDetails.homeSampleCollection && <div className="font-bold text-purple-700 flex items-center gap-2"><span>🏠</span> Home Sample</div>}
                          {hospital.diagnosticCenterDetails.reportTime && <div><span className="text-gray-500">Report Time:</span> <span className="font-bold">{hospital.diagnosticCenterDetails.reportTime}</span></div>}
                        </div>
                      </div>
                    )}

                    {/* ── Feature 2: OPD Hours with Open badge ── */}
                    {hospital.operatingHours && (
                      <div>
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-lg">
                          <FaClock style={{ color: theme }} /> OPD Hours
                          <span className="text-xs font-normal text-red-500 bg-red-50 px-2 py-0.5 rounded-full ml-1">Emergency: 24/7</span>
                          {openStatus && (
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ml-1 ${
                              openStatus.open ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {openStatus.text}
                            </span>
                          )}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                          {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                            <div key={day} className="flex justify-between items-center py-2 border-b border-gray-100">
                              <span className="text-sm text-gray-500 capitalize font-medium">{day}</span>
                              <span className={`text-sm font-semibold ${hospital.operatingHours[day] === 'Closed' ? 'text-red-500' : 'text-gray-800'}`}>
                                {hospital.operatingHours[day] || 'N/A'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── PACKAGES & ROOMS TAB ── */}
                {activeTab === 'packages & rooms' && (
                  <div className="space-y-8 animate-fadeIn">
                    {hospital.packages?.length > 0 ? (
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Health Checkup Packages</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {hospital.packages.map((pkg, i) => (
                            <div key={i} className="border border-green-200 bg-green-50 p-4 rounded-xl relative overflow-hidden">
                              <div className="absolute -right-4 -top-4 w-16 h-16 bg-green-200 rounded-full opacity-50"></div>
                              <h4 className="font-bold text-green-800 text-lg pr-8">{pkg.name}</h4>
                              <p className="text-2xl font-black text-green-600 mt-2 mb-3">₹{pkg.price}</p>
                              {pkg.duration && <p className="text-xs text-gray-600 mb-2">⏱️ {pkg.duration}</p>}
                              {pkg.includedTests?.length > 0 && (
                                <div>
                                  <p className="text-xs font-bold text-gray-700 mb-1">Included Tests:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {pkg.includedTests.map((test, j) => (
                                      <span key={j} className="text-[10px] bg-white border border-green-100 px-2 py-0.5 rounded">{test}</span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : <p className="text-gray-500">No health packages listed.</p>}

                    {hospital.roomTypes?.length > 0 ? (
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2 mt-8">Room Types & Charges (Per Day)</h3>
                        <div className="space-y-3">
                          {hospital.roomTypes.map((room, i) => (
                            <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-100 rounded-xl bg-white shadow-sm">
                              <div className="mb-2 sm:mb-0">
                                <h4 className="font-bold text-gray-800 text-lg">{room.type}</h4>
                                {room.facilities?.length > 0 && <p className="text-xs text-gray-500 mt-1">{room.facilities.join(' • ')}</p>}
                              </div>
                              <div className="text-left sm:text-right">
                                <span className="text-xl font-black text-blue-600">₹{room.pricePerDay}</span>
                                <span className="text-gray-400 text-sm">/day</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : <p className="text-gray-500 mt-6">No room types listed.</p>}

                    {/* ── Feature 12: Estimated Cost Calculator ── */}
                    {(hospital.roomTypes?.length > 0 || hospital.packages?.length > 0) && (
                      <div className="mt-8 border-t pt-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                          🧮 Estimate Your Bill
                        </h3>
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 space-y-4">
                          {/* Room selector */}
                          {hospital.roomTypes?.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                  Room Type
                                </label>
                                <select
                                  value={calcRoom}
                                  onChange={e => setCalcRoom(e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                                >
                                  <option value="">-- Select room --</option>
                                  {hospital.roomTypes.map((r, i) => (
                                    <option key={i} value={r.pricePerDay}>
                                      {r.type} — ₹{r.pricePerDay}/day
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                  Number of Nights
                                </label>
                                <input
                                  type="number"
                                  min={1}
                                  max={60}
                                  value={calcNights}
                                  onChange={e => setCalcNights(Math.max(1, parseInt(e.target.value) || 1))}
                                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                                />
                              </div>
                            </div>
                          )}
                          {/* Package selector */}
                          {hospital.packages?.length > 0 && (
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Health Package (optional)
                              </label>
                              <select
                                value={calcPackage}
                                onChange={e => setCalcPackage(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                              >
                                <option value="">-- No package --</option>
                                {hospital.packages.map((p, i) => (
                                  <option key={i} value={p.price}>
                                    {p.name} — ₹{p.price}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                          {/* Total display */}
                          {(calcRoom || calcPackage) && (
                            <div className="bg-white rounded-xl p-4 border border-blue-200">
                              <p className="text-sm font-semibold text-gray-700 mb-3">Cost Breakdown</p>
                              <div className="space-y-2 text-sm">
                                {calcRoom && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">
                                      Room charges ({calcNights} night{calcNights > 1 ? 's' : ''})
                                    </span>
                                    <span className="font-semibold text-gray-800">
                                      ₹{(parseInt(calcRoom) * calcNights).toLocaleString('en-IN')}
                                    </span>
                                  </div>
                                )}
                                {calcPackage && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Health package</span>
                                    <span className="font-semibold text-gray-800">
                                      ₹{parseInt(calcPackage).toLocaleString('en-IN')}
                                    </span>
                                  </div>
                                )}
                                <div className="flex justify-between pt-2 border-t border-gray-100">
                                  <span className="font-bold text-gray-900">Estimated Total</span>
                                  <span className="font-black text-blue-600 text-lg">
                                    ₹{(
                                      (calcRoom ? parseInt(calcRoom) * calcNights : 0) +
                                      (calcPackage ? parseInt(calcPackage) : 0)
                                    ).toLocaleString('en-IN')}
                                  </span>
                                </div>
                              </div>
                              <p className="text-[10px] text-gray-400 mt-3">
                                * Estimate only. Actual charges may vary. Doctor fees, medicines & tests not included.
                              </p>
                            </div>
                          )}
                          {!calcRoom && !calcPackage && (
                            <p className="text-sm text-gray-500 text-center py-2">
                              Select a room type or package to see estimated cost
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── SERVICES TAB ── */}
                {activeTab === 'services' && (
                  <div className="animate-fadeIn">
                    <PriceList services={hospital.services || []} themeColor={theme} />
                  </div>
                )}

                {/* ── REVIEWS TAB ── */}
                {activeTab === 'reviews' && (
                  <div className="animate-fadeIn space-y-6">

                    {/* ── Feature 6: Rating breakdown ── */}
                    {reviews.length > 0 && (
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <h3 className="font-bold text-gray-800 text-base mb-3">Rating breakdown</h3>
                        <div className="space-y-2">
                          {ratingCounts.map(({ star, count }) => (
                            <div key={star} className="flex items-center gap-3 text-sm">
                              <span className="text-gray-600 w-4 text-right font-medium">{star}</span>
                              <FaStar className="text-yellow-400 text-xs shrink-0" />
                              <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-yellow-400 transition-all duration-500"
                                  style={{ width: `${(count / maxRatingCount) * 100}%` }}
                                />
                              </div>
                              <span className="text-gray-500 w-4 text-left">{count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {reviewsLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      </div>
                    ) : reviews.length > 0 ? (
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg mb-4">
                          Patient Reviews
                          <span className="ml-2 text-sm font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{reviews.length} total</span>
                        </h3>
                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                          {reviews.map((review, idx) => (
                            <div key={idx} className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                                    {review.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-gray-800 text-sm">{review.user?.name || 'Anonymous'}</p>
                                    <p className="text-xs text-gray-400">
                                      {new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  {[1, 2, 3, 4, 5].map(star => (
                                    <FaStar key={star} className={`text-xs ${star <= review.rating ? 'text-yellow-400' : 'text-gray-200'}`} />
                                  ))}
                                  <span className="text-xs font-bold text-gray-600 ml-1">{review.rating}/5</span>
                                </div>
                              </div>
                              {review.comment && (
                                <p className="text-sm text-gray-600 leading-relaxed mt-2 pl-10">{review.comment}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-gray-50 rounded-xl">
                        <p className="text-gray-400 text-2xl mb-2">💬</p>
                        <p className="text-gray-500 font-medium">No reviews yet</p>
                        <p className="text-gray-400 text-sm">Be the first to share your experience!</p>
                      </div>
                    )}

                    <div className="border-t border-gray-100 pt-4">
                      <h3 className="font-bold text-gray-800 text-base mb-4">Write a Review</h3>
                      <ReviewForm
                        facilityId={hospital._id || hospital.id}
                        facilityType="hospital"
                        onReviewSubmitted={() => { fetchHospital(); fetchReviews(); }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <div className="space-y-4">

            {/* Contact & Social */}
            <div className="bg-white rounded-2xl shadow-md p-5 border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><FaPhone style={{ color: theme }} /> Contact & Social</h3>
              <div className="space-y-3">
                {hospital.phone && (
                  <a href={`tel:${hospital.phone}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition">
                    <div className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: theme }}><FaPhone className="text-sm" /></div>
                    <div className="overflow-hidden"><p className="text-xs text-gray-500 font-semibold">Phone</p><p className="font-semibold text-gray-800 truncate">{hospital.phone}</p></div>
                  </a>
                )}
                {hospital.email && (
                  <a href={`mailto:${hospital.email}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition">
                    <div className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: theme }}><FaEnvelope className="text-sm" /></div>
                    <div className="overflow-hidden"><p className="text-xs text-gray-500 font-semibold">Email</p><p className="font-semibold text-gray-800 text-sm truncate w-full">{hospital.email}</p></div>
                  </a>
                )}
                {hospital.website && (
                  <a href={formatURL(hospital.website)} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition group">
                    <div className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-white transition-transform group-hover:scale-105" style={{ backgroundColor: theme }}><FaGlobe className="text-sm" /></div>
                    <div className="overflow-hidden"><p className="text-xs text-gray-500 font-semibold">Website</p><p className="font-semibold text-blue-600 text-sm truncate w-full group-hover:underline">{hospital.website}</p></div>
                  </a>
                )}
                {hospital.socialMedia && (
                  <div className="pt-4 mt-2 border-t border-gray-100 flex justify-around">
                    {hospital.socialMedia.facebook && <a href={formatURL(hospital.socialMedia.facebook)} target="_blank" rel="noreferrer" className="p-2 text-blue-600 hover:bg-blue-50 rounded-full text-xl transition-transform hover:scale-110"><FaFacebook /></a>}
                    {hospital.socialMedia.instagram && <a href={formatURL(hospital.socialMedia.instagram)} target="_blank" rel="noreferrer" className="p-2 text-pink-600 hover:bg-pink-50 rounded-full text-xl transition-transform hover:scale-110"><FaInstagram /></a>}
                    {hospital.socialMedia.twitter && <a href={formatURL(hospital.socialMedia.twitter)} target="_blank" rel="noreferrer" className="p-2 text-blue-400 hover:bg-blue-50 rounded-full text-xl transition-transform hover:scale-110"><FaTwitter /></a>}
                    {hospital.socialMedia.youtube && <a href={formatURL(hospital.socialMedia.youtube)} target="_blank" rel="noreferrer" className="p-2 text-red-600 hover:bg-red-50 rounded-full text-xl transition-transform hover:scale-110"><FaYoutube /></a>}
                  </div>
                )}
              </div>
            </div>

            {/* Management & Certs */}
            <div className="bg-white rounded-2xl shadow-md p-5 border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><FaUserTie style={{ color: theme }} /> Management & Certs</h3>
              <div className="space-y-3 text-sm">
                {hospital.staffAndManagement?.medicalDirector && <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Medical Director</span><span className="font-semibold text-right pl-2">{hospital.staffAndManagement.medicalDirector}</span></div>}
                {hospital.staffAndManagement?.chiefSurgeon && <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Chief Surgeon</span><span className="font-semibold text-right pl-2">{hospital.staffAndManagement.chiefSurgeon}</span></div>}
                {hospital.staffAndManagement?.nursingHead && <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Nursing Head</span><span className="font-semibold text-right pl-2">{hospital.staffAndManagement.nursingHead}</span></div>}
                {hospital.staffAndManagement?.adminManager && <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Admin Manager</span><span className="font-semibold text-right pl-2">{hospital.staffAndManagement.adminManager}</span></div>}
                {hospital.documents?.governmentApproval && <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Govt. Approved</span><span className="font-bold text-green-600">✅ Yes</span></div>}
                {hospital.documents?.nabhAccreditation && <div className="flex justify-between border-b pb-2"><span className="text-gray-500">NABH Accredited</span><span className="font-bold text-purple-600">✅ Yes</span></div>}
                {hospital.documents?.isoCertification && <div className="flex justify-between border-b pb-2"><span className="text-gray-500">ISO Certified</span><span className="font-bold text-blue-600">✅ Yes</span></div>}
                {hospital.documents?.awards?.length > 0 && (
                  <div className="pt-1">
                    <span className="text-gray-500 block mb-2 font-medium">Awards & Recognitions</span>
                    <div className="flex flex-wrap gap-1.5">
                      {hospital.documents.awards.map((aw, i) => (
                        <span key={i} className="bg-yellow-50 text-yellow-700 text-[10px] px-2.5 py-1 rounded border border-yellow-200 font-bold tracking-wide">{aw}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-2xl shadow-md p-5 border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-3">📍 Location</h3>
              <div className="h-auto py-6 rounded-xl flex items-center justify-center mb-3 border border-dashed border-gray-300" style={{ backgroundColor: theme + '05' }}>
                <div className="text-center px-3">
                  <FaMapMarkerAlt className="text-4xl mx-auto mb-2" style={{ color: theme }} />
                  <p className="text-sm text-gray-700 font-medium leading-tight">{hospital.address?.city}, {hospital.address?.state}</p>
                  {hospital.address?.landmark && <p className="text-xs text-gray-500 mt-1.5 italic">Landmark: {hospital.address.landmark}</p>}
                  {distance && <p className="text-xs text-green-600 font-bold mt-2 bg-green-50 inline-block px-2 py-0.5 rounded">{distance.toFixed(1)} km away</p>}
                </div>
              </div>
              <MapButton hospital={hospital} fullWidth={true} />
            </div>

            {/* Quick Info */}
            <div className="bg-white rounded-2xl shadow-md p-5 border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4">ℹ️ Quick Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center pb-2 border-b border-gray-50"><span className="text-gray-500">Category</span><span className="font-semibold capitalize text-gray-800 text-right pl-2">{getCategoryIcon(hospital.category)} {hospital.category || 'Private'}</span></div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-50"><span className="text-gray-500">Type</span><span className="font-semibold capitalize text-gray-800 text-right pl-2">{hospital.type || 'N/A'}</span></div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-50"><span className="text-gray-500">Total Beds</span><span className="font-semibold text-gray-800">{hospital.numberOfBeds || 'N/A'}</span></div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-50"><span className="text-gray-500">Total Services</span><span className="font-semibold text-gray-800">{totalServicesListed} listed</span></div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-50"><span className="text-gray-500">Pin Code</span><span className="font-semibold text-gray-800">{hospital.address?.pincode || 'N/A'}</span></div>
                {/* ── Feature 1: Last updated ── */}
                {hospital.updatedAt && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Last updated</span>
                    <span className="text-gray-500 text-xs">
                      {new Date(hospital.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Specialists Section ── */}
      {hospital.doctors && hospital.doctors.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 mt-8 sm:mt-12 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FaStethoscope style={{ color: theme }} /> Our Specialists
              <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{filteredDoctors.length} shown</span>
            </h2>

            {/* ── Feature 5: Doctor specialization filter ── */}
            {allSpecializations.length > 2 && (
              <div className="flex flex-wrap gap-2">
                {allSpecializations.map(spec => (
                  <button
                    key={spec}
                    onClick={() => setDoctorFilter(spec)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition border ${
                      doctorFilter === spec
                        ? 'text-white border-transparent'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                    }`}
                    style={doctorFilter === spec ? { backgroundColor: theme, borderColor: theme } : {}}
                  >
                    {spec}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doctor, idx) => (
              <div key={idx} className="bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-xl transition-all overflow-hidden flex flex-col h-full">
                <div className="h-28 sm:h-32 flex items-end justify-center relative" style={{ backgroundColor: `${theme}20` }}>
                  {doctor.photo
                    ? <img src={doctor.photo} alt={doctor.name} className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-white absolute -bottom-10 sm:-bottom-12 shadow-sm" />
                    : <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white border-4 border-gray-100 flex items-center justify-center absolute -bottom-10 sm:-bottom-12 shadow-sm"><FaUserMd className="text-3xl sm:text-4xl text-gray-300" /></div>
                  }
                </div>
                <div className="pt-14 sm:pt-16 p-4 sm:p-5 flex-1 flex flex-col text-center">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">{doctor.name}</h3>
                  <p className="text-sm font-semibold mb-2" style={{ color: theme }}>{doctor.specialization}</p>
                  <div className="text-xs sm:text-sm text-gray-600 space-y-1 mb-4">
                    {doctor.qualification && <p>🎓 {doctor.qualification}</p>}
                    {doctor.experience && <p>⭐ {doctor.experience} Experience</p>}
                    {doctor.languages?.length > 0 && <p>🗣️ {doctor.languages.join(', ')}</p>}
                  </div>
                  <div className="mt-auto border-t pt-3 sm:pt-4 flex justify-between items-center bg-gray-50 -mx-4 sm:-mx-5 px-4 sm:px-5 py-3 mb-4">
                    <div className="text-left">
                      <p className="text-[9px] sm:text-[10px] text-gray-500 uppercase font-bold">OPD Timing</p>
                      <p className="text-xs sm:text-sm font-semibold text-gray-800">{doctor.availability || doctor.opdTiming || 'Contact Hospital'}</p>
                    </div>
                    <div className="text-right pl-2">
                      <p className="text-[9px] sm:text-[10px] text-gray-500 uppercase font-bold">Consultation</p>
                      <p className="text-base sm:text-lg font-black text-green-600">
                        {doctor.consultationFee || doctor.fees ? `₹${doctor.consultationFee || doctor.fees}` : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleBookAppointment(doctor._id)}
                    disabled={!hospital.appointmentsEnabled}
                    className="w-full py-2.5 sm:py-3 bg-blue-600 text-white rounded-xl text-sm sm:text-base font-bold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed -mx-4 sm:-mx-5 -mb-4 sm:-mb-5 px-4 sm:px-5"
                    style={{ width: 'calc(100% + 2rem)' }}
                  >
                    {hospital.appointmentsEnabled ? 'Book Appointment' : 'Booking Unavailable'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── General Services ── */}
      <div id="services-section" className="max-w-6xl mx-auto px-4 py-8 scroll-mt-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">General Services & Facilities</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {combinedTests.length > 0 && (
            <div className="bg-white rounded-2xl shadow-md p-5 sm:p-6 border border-gray-100 hover:shadow-lg transition">
              <div className="flex items-center gap-3 mb-4"><div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center shrink-0"><FaFlask className="text-lg sm:text-xl text-blue-600" /></div><div><h3 className="font-bold text-gray-900 text-sm sm:text-base">Tests / Diagnosis</h3><p className="text-xs sm:text-sm text-gray-600">{combinedTests.length} available</p></div></div>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">{combinedTests.map((item, idx) => <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm"><span className="text-blue-500 mt-0.5">✓</span><span className="text-gray-700">{item}</span></div>)}</div>
            </div>
          )}
          {combinedTreatments.length > 0 && (
            <div className="bg-white rounded-2xl shadow-md p-5 sm:p-6 border border-gray-100 hover:shadow-lg transition">
              <div className="flex items-center gap-3 mb-4"><div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center shrink-0"><FaPills className="text-lg sm:text-xl text-green-600" /></div><div><h3 className="font-bold text-gray-900 text-sm sm:text-base">Treatments</h3><p className="text-xs sm:text-sm text-gray-600">{combinedTreatments.length} available</p></div></div>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">{combinedTreatments.map((item, idx) => <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm"><span className="text-green-500 mt-0.5">✓</span><span className="text-gray-700">{item}</span></div>)}</div>
            </div>
          )}
          {combinedSurgeries.length > 0 && (
            <div className="bg-white rounded-2xl shadow-md p-5 sm:p-6 border border-gray-100 hover:shadow-lg transition">
              <div className="flex items-center gap-3 mb-4"><div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-full flex items-center justify-center shrink-0"><FaCut className="text-lg sm:text-xl text-red-600" /></div><div><h3 className="font-bold text-gray-900 text-sm sm:text-base">Surgeries</h3><p className="text-xs sm:text-sm text-gray-600">{combinedSurgeries.length} available</p></div></div>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">{combinedSurgeries.map((item, idx) => <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm"><span className="text-red-500 mt-0.5">✓</span><span className="text-gray-700">{item}</span></div>)}</div>
            </div>
          )}
          {combinedProcedures.length > 0 && (
            <div className="bg-white rounded-2xl shadow-md p-5 sm:p-6 border border-gray-100 hover:shadow-lg transition">
              <div className="flex items-center gap-3 mb-4"><div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center shrink-0"><FaClipboardList className="text-lg sm:text-xl text-purple-600" /></div><div><h3 className="font-bold text-gray-900 text-sm sm:text-base">Procedures</h3><p className="text-xs sm:text-sm text-gray-600">{combinedProcedures.length} available</p></div></div>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">{combinedProcedures.map((item, idx) => <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm"><span className="text-purple-500 mt-0.5">✓</span><span className="text-gray-700">{item}</span></div>)}</div>
            </div>
          )}
          {combinedTherapies.length > 0 && (
            <div className="bg-white rounded-2xl shadow-md p-5 sm:p-6 border border-gray-100 hover:shadow-lg transition">
              <div className="flex items-center gap-3 mb-4"><div className="w-10 h-10 sm:w-12 sm:h-12 bg-teal-100 rounded-full flex items-center justify-center shrink-0"><FaSpa className="text-lg sm:text-xl text-teal-600" /></div><div><h3 className="font-bold text-gray-900 text-sm sm:text-base">Therapies</h3><p className="text-xs sm:text-sm text-gray-600">{combinedTherapies.length} available</p></div></div>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">{combinedTherapies.map((item, idx) => <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm"><span className="text-teal-500 mt-0.5">✓</span><span className="text-gray-700">{item}</span></div>)}</div>
            </div>
          )}

          {/* ── Feature 4: Insurance with search ── */}
          {hospital.insuranceAccepted?.length > 0 && (
            <div className="bg-white rounded-2xl shadow-md p-5 sm:p-6 border border-gray-100 hover:shadow-lg transition">
              <div className="flex items-center gap-3 mb-3"><div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center shrink-0"><FaShieldAlt className="text-lg sm:text-xl text-green-600" /></div><div><h3 className="font-bold text-gray-900 text-sm sm:text-base">Insurance Providers</h3><p className="text-xs sm:text-sm text-gray-600">{hospital.insuranceAccepted.length} accepted</p></div></div>
              <div className="relative mb-2">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                <input
                  type="text"
                  placeholder="Search insurer..."
                  value={insuranceSearch}
                  onChange={e => setInsuranceSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {filteredInsurance.length > 0
                  ? filteredInsurance.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm">
                      <FaShieldAlt className="text-green-500 text-xs mt-1 shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))
                  : <p className="text-xs text-gray-400 text-center py-2">No match found</p>
                }
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Feature 13: Similar Hospitals ── */}
      {similarHospitals.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 pb-8 print:hidden">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            🏥 You might also consider
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {similarHospitals.map((h, idx) => (
              <div
                key={idx}
                onClick={() => navigate(`/hospital/${h._id || h.id}`)}
                className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 cursor-pointer hover:shadow-lg transition-all"
              >
                {h.images?.[0] && (
                  <img
                    src={h.images[0]}
                    alt={h.name}
                    className="w-full h-32 object-cover rounded-xl mb-3"
                  />
                )}
                <h3 className="font-bold text-gray-900 text-sm line-clamp-2 mb-1">{h.name}</h3>
                <p className="text-xs text-gray-500 mb-2">
                  {[h.address?.area, h.address?.city].filter(Boolean).join(', ')}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 capitalize bg-gray-100 px-2 py-0.5 rounded-full">
                    {h.type}
                  </span>
                  {h.googleRating > 0 && (
                    <span className="flex items-center gap-1 text-xs font-bold text-gray-700">
                      <FaStar className="text-yellow-400" />
                      {h.googleRating.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Feature 1: Last updated + Feature 10: Report link ── */}
      <div className="max-w-6xl mx-auto px-4 pb-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400 print:hidden">
        {hospital.updatedAt && (
          <span>Profile last updated: {new Date(hospital.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        )}
        <button
          onClick={() => setShowReportModal(true)}
          className="flex items-center gap-1.5 text-gray-400 hover:text-red-500 transition"
        >
          <FaFlag className="text-[10px]" /> Report incorrect info
        </button>
      </div>

      {/* ── Feature 9: Sticky CTA bar (mobile only) ── */}
      <div className="fixed bottom-16 left-0 right-0 z-40 lg:hidden print:hidden">
        <div className="bg-white border-t border-gray-200 shadow-xl px-4 py-3 flex gap-3">
          {hospital.owner && hospital.appointmentsEnabled ? (
            <button
              onClick={() => handleBookAppointment(null)}
              className="flex-1 flex justify-center items-center gap-2 py-3 rounded-xl font-bold text-white text-sm transition hover:opacity-90"
              style={{ backgroundColor: theme }}
            >
              📅 Book Appointment
            </button>
          ) : (
            <div className="flex-1 flex justify-center items-center py-3 rounded-xl bg-gray-100 text-gray-500 text-sm font-medium">
              Booking Unavailable
            </div>
          )}
          {hospital.phone && (
            <a
              href={`tel:${hospital.phone}`}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 transition text-sm"
            >
              <FaPhone /> Call
            </a>
          )}
          <button
            onClick={handleShare}
            className="flex items-center justify-center px-4 py-3 rounded-xl font-bold border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition"
          >
            <FaShare />
          </button>
        </div>
      </div>

      {/* ── Feature 10: Report modal ── */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            {reportSent ? (
              <div className="text-center py-4">
                <p className="text-2xl mb-2">✅</p>
                <p className="font-bold text-gray-800">Thank you for the report!</p>
                <p className="text-sm text-gray-500 mt-1">We'll review and update the info soon.</p>
              </div>
            ) : (
              <>
                <h3 className="font-bold text-gray-900 text-lg mb-1">Report incorrect info</h3>
                <p className="text-sm text-gray-500 mb-4">Tell us what's wrong with this hospital's profile.</p>
                <textarea
                  value={reportText}
                  onChange={e => setReportText(e.target.value)}
                  rows={4}
                  placeholder="E.g. Phone number is wrong, timings are outdated..."
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                />
                <div className="flex gap-3 mt-4">
                  <button onClick={() => setShowReportModal(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition">Cancel</button>
                  <button onClick={handleReportSubmit} disabled={!reportText.trim()} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-semibold text-sm hover:bg-red-600 transition disabled:opacity-50">Submit Report</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedHospitalDetails;