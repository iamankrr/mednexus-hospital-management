import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom'; 
import axios from 'axios'; 
import {
  FaStar, FaGoogle, FaPhone, FaEnvelope, FaMapMarkerAlt,
  FaClock, FaAmbulance, FaHeart, FaArrowLeft,
  FaCheckCircle, FaBalanceScale, FaCalendarAlt, FaClipboardList,
  FaFlask, FaPills, FaCut, FaSpa, FaUserMd, FaShieldAlt, FaBed, 
  FaFacebook, FaInstagram, FaTwitter, FaYoutube, FaAward, FaUserTie, FaStethoscope
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

const HospitalDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const locationRouter = useLocation(); 
  
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
      if (!hospital) setLoading(true);
      const res = await axios.get(`${API_URL}/api/hospitals/${id}`);
      const data = res.data.data; 
      setHospital(data); 
      if (userLocation && data.location?.coordinates) {
        const dist = calculateDistance(userLocation.latitude, userLocation.longitude, data.location.coordinates[1], data.location.coordinates[0]);
        setDistance(dist);
      }
    } catch (err) { console.error('Error fetching hospital:', err); } finally { setLoading(false); }
  };

  const checkIfFavorite = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await axios.get(`${API_URL}/api/favorites`, { headers: { 'Authorization': `Bearer ${token}` } });
      setIsFavorite(response.data.data.hospitals?.includes(id));
    } catch (error) {}
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
    if (!token) { alert('Please login to manage favorites'); navigate('/login'); return; }
    try {
      const endpoint = isFavorite ? '/api/favorites/remove' : '/api/favorites/add';
      await axios.post(`${API_URL}${endpoint}`, { facilityId: id, facilityType: 'hospital' }, { headers: { 'Authorization': `Bearer ${token}` } });
      setIsFavorite(!isFavorite);
      alert(isFavorite ? '✅ Removed from favorites' : '✅ Added to favorites');
    } catch (error) { alert('Failed to update favorites'); }
  };

  const handleCompareToggle = () => {
    if (!checkUserRole()) return;
    if (isCompared) removeFromComparison(hospital._id || hospital.id);
    else addToComparison(hospital, 'hospital');
  };

  // ✅ FIX: Updated routing logic to pass hospital ID and specific doctor ID
  const handleBookAppointment = (doctorId = null) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in to book an appointment!');
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      navigate('/login');
      return;
    }
    if (!checkUserRole()) return;
    
    const url = `/appointments/book?hospital=${hospital._id || hospital.id}${doctorId ? `&doctor=${doctorId}` : ''}`;
    navigate(url);
  };

  const scrollToServices = () => document.getElementById('services-section')?.scrollIntoView({ behavior: 'smooth' });

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500"></div></div>;
  if (!hospital) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500 text-xl">Hospital not found</p></div>;

  const isCompared = comparisonList.some(h => (h._id || h.id) === (hospital._id || hospital.id));
  const theme = hospital.themeColor || '#1E40AF';
  const tabs  = ['overview', 'packages & rooms', 'services', 'reviews'];

  const unpricedServices = hospital.services?.filter(s => !s.price || s.price <= 0) || [];
  const combinedTests = Array.from(new Set([...(hospital.tests || []), ...unpricedServices.filter(s => ['Pathology', 'Radiology', 'Diagnosis'].includes(s.category)).map(s => s.name)]));
  const combinedTreatments = Array.from(new Set([...(hospital.treatments || []), ...unpricedServices.filter(s => ['Consultation', 'OPD', 'General', 'Other'].includes(s.category)).map(s => s.name)]));
  const combinedSurgeries = Array.from(new Set([...(hospital.surgeries || []), ...unpricedServices.filter(s => s.category === 'Surgery').map(s => s.name)]));
  const combinedTherapies = Array.from(new Set([...(hospital.therapies || []), ...unpricedServices.filter(s => s.category === 'Therapy').map(s => s.name)]));
  const combinedProcedures = Array.from(new Set([...(hospital.procedures || []), ...unpricedServices.filter(s => ['Dental', 'Eye', 'Orthopedic', 'Maternity', 'Cardiology', 'Neurology'].includes(s.category)).map(s => s.name)]));

  const totalServicesListed = (hospital.services?.length || 0) + combinedTests.length + combinedTreatments.length + combinedSurgeries.length + combinedTherapies.length + combinedProcedures.length + (hospital.managementServices?.length || 0) + (hospital.insuranceAccepted?.length || 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="h-2 w-full" style={{ backgroundColor: theme }} />

      <div className="max-w-6xl mx-auto px-4 pt-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium mb-4"><FaArrowLeft /> Back</button>
      </div>

      <div className="max-w-6xl mx-auto px-4 mb-6">
        <PhotoGallery images={hospital.images || []} name={hospital.name} />
      </div>

      <div className="max-w-6xl mx-auto px-4">
        
        {/* Announcements Banner */}
        {hospital.announcements?.length > 0 && (
          <div className="mb-6 space-y-3">
            {hospital.announcements.map((ann, idx) => (
              <div key={idx} className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-xl shadow-sm flex items-start gap-3">
                 <span className="text-2xl mt-1">📢</span>
                 <div>
                   <h4 className="text-yellow-800 font-bold">{ann.title}</h4>
                   <p className="text-sm text-yellow-700">{ann.description}</p>
                 </div>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            {/* Top Info Card */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 shadow-sm border border-gray-200 uppercase tracking-wide">
                  {getCategoryIcon(hospital.category)} {hospital.category || 'Private'}
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white capitalize shadow-sm" style={{ backgroundColor: theme }}>
                  🏥 {hospital.type || 'Hospital'}
                </span>
                {hospital.isVerified && <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700"><FaCheckCircle /> Verified</span>}
                {hospital.documents?.nabhAccreditation && <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700"><FaAward /> NABH Accredited</span>}
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-2">{hospital.name}</h1>

              {hospital.address && (
                <p className="flex items-center gap-2 text-gray-600 mb-4 text-sm">
                  <FaMapMarkerAlt style={{ color: theme }} />
                  {[hospital.address.street, hospital.address.area, hospital.address.city, hospital.address.state, hospital.address.pincode].filter(Boolean).join(', ')}
                </p>
              )}

              {hospital.establishedDate && (
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg mb-5 w-fit border border-gray-100">
                  <FaCalendarAlt className="text-xl mt-1" style={{ color: theme }} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-700">Established</p>
                    <p className="text-sm text-gray-900 font-medium">{new Date(hospital.establishedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    <p className="text-xs text-gray-500 mt-1 font-medium">{calculateYearsSince(hospital.establishedDate)}</p>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-4 mb-5">
                {hospital.googleRating > 0 && (
                  <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-xl">
                    <FaGoogle className="text-blue-600" />
                    <div>
                      <div className="flex items-center gap-1"><span className="font-bold text-gray-800 text-lg">{hospital.googleRating.toFixed(1)}</span><FaStar className="text-yellow-400 text-sm" /></div>
                      <p className="text-xs text-gray-500">{hospital.googleReviewCount?.toLocaleString()} Google reviews</p>
                    </div>
                  </div>
                )}
                {hospital.websiteRating > 0 && (
                  <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-xl">
                    <FaStar className="text-yellow-400" />
                    <div>
                      <div className="flex items-center gap-1"><span className="font-bold text-gray-800 text-lg">{hospital.websiteRating.toFixed(1)}</span></div>
                      <p className="text-xs text-gray-500">{hospital.totalReviews} user reviews</p>
                    </div>
                  </div>
                )}
                {distance && (
                  <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-xl">
                    <FaMapMarkerAlt className="text-green-600" />
                    <div><span className="font-bold text-gray-800 text-lg">{distance.toFixed(1)} km</span><p className="text-xs text-gray-500">from you</p></div>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                {hospital.owner && hospital.appointmentsEnabled ? (
                  <button onClick={() => handleBookAppointment(null)} className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-white transition hover:opacity-90 shadow-sm" style={{ backgroundColor: theme }}>📅 Book General Appointment</button>
                ) : (
                  <div className="px-5 py-3 rounded-xl bg-gray-100 text-gray-600 text-sm font-medium flex items-center gap-2">📅 Appointments Unavailable</div>
                )}
                
                <button onClick={scrollToServices} className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition flex items-center gap-2 shadow-sm"><FaClipboardList /> View All Services</button>
                <MapButton hospital={hospital} />
                <button onClick={handleToggleFavorite} className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold border transition shadow-sm ${isFavorite ? 'bg-red-50 text-red-600 border-red-200' : 'bg-white text-gray-700'}`}><FaHeart className={isFavorite ? 'text-red-500' : 'text-gray-400'} /> {isFavorite ? 'Saved' : 'Save'}</button>
                <button onClick={handleCompareToggle} className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold border transition shadow-sm ${isCompared ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-700'}`}><FaBalanceScale /> {isCompared ? 'Added' : 'Compare'}</button>
              </div>
            </div>

            {/* Main Tabs */}
            <div className="bg-white rounded-2xl shadow-md overflow-hidden min-h-[400px]">
              <div className="flex border-b border-gray-100 overflow-x-auto hide-scrollbar">
                {tabs.map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 min-w-[120px] py-4 text-sm font-semibold capitalize transition-colors duration-200 whitespace-nowrap ${activeTab === tab ? 'text-white' : 'text-gray-500 hover:bg-gray-50'}`} style={activeTab === tab ? { backgroundColor: theme } : {}}>
                    {tab === 'overview'  && '📋 Overview'}
                    {tab === 'packages & rooms' && '🛏️ Packages & Rooms'}
                    {tab === 'services'  && '💰 Price List'}
                    {tab === 'reviews'   && '⭐ Reviews'}
                  </button>
                ))}
              </div>

              <div className="p-6">
                
                {/* TAB: OVERVIEW */}
                {activeTab === 'overview' && (
                  <div className="space-y-8">
                    
                    {/* Emergency Highlights */}
                    {hospital.emergencyAvailable && (
                      <div className="bg-red-50 border border-red-100 rounded-xl p-5">
                        <h3 className="text-red-600 font-bold text-lg mb-3 flex items-center gap-2"><FaAmbulance /> 24/7 Emergency Services</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          {hospital.emergencyDetails?.contactNumber && <div><p className="text-gray-500 font-medium">Helpline</p><p className="font-bold text-red-700">{hospital.emergencyDetails.contactNumber}</p></div>}
                          <div><p className="text-gray-500 font-medium">Ambulances</p><p className="font-bold text-gray-800">{hospital.emergencyDetails?.ambulanceCount || 'Available'}</p></div>
                          <div><p className="text-gray-500 font-medium">Trauma Center</p><p className="font-bold text-gray-800">{hospital.emergencyDetails?.traumaCenter ? '✅ Yes' : '❌ No'}</p></div>
                          <div><p className="text-gray-500 font-medium">24/7 Doctors</p><p className="font-bold text-gray-800">{hospital.emergencyDetails?.doctors24x7 ? '✅ Yes' : '❌ No'}</p></div>
                        </div>
                      </div>
                    )}

                    {hospital.description && (
                      <div>
                        <h3 className="font-bold text-gray-800 mb-3 text-lg">About</h3>
                        <p className="text-gray-600 leading-relaxed text-sm md:text-base">{hospital.description}</p>
                      </div>
                    )}

                    {/* Departments */}
                    {hospital.departments?.length > 0 && (
                      <div>
                        <h3 className="font-bold text-gray-800 mb-3 text-lg">Key Departments</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {hospital.departments.map((dept, i) => (
                            <div key={i} className="p-3 border border-gray-100 bg-gray-50 rounded-lg">
                              <p className="font-bold text-gray-800 text-sm">{dept.name}</p>
                              {dept.headDoctor && <p className="text-xs text-gray-500 mt-1">Head: {dept.headDoctor}</p>}
                              {dept.description && <p className="text-xs text-gray-600 mt-1">{dept.description}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {hospital.facilities?.length > 0 && (
                      <div>
                        <h3 className="font-bold text-gray-800 mb-3 text-lg">Facilities</h3>
                        <div className="flex flex-wrap gap-2">
                          {hospital.facilities.map((f, i) => <span key={i} className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ backgroundColor: `${theme}15`, color: theme }}><FaCheckCircle className="text-xs" /> {f}</span>)}
                        </div>
                      </div>
                    )}

                    {/* Diagnostic Center */}
                    {hospital.diagnosticCenterDetails?.labAvailable && (
                       <div className="bg-purple-50 p-5 rounded-xl border border-purple-100">
                          <h3 className="font-bold text-purple-800 mb-3 flex items-center gap-2"><FaFlask /> In-House Diagnostic Center</h3>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                            {hospital.diagnosticCenterDetails.nablCertified && <div className="font-bold text-purple-700">✅ NABL Certified</div>}
                            {hospital.diagnosticCenterDetails.homeSampleCollection && <div className="font-bold text-purple-700">🏠 Home Sample Collection</div>}
                            {hospital.diagnosticCenterDetails.reportTime && <div><span className="text-gray-500">Avg Report Time:</span> <span className="font-bold">{hospital.diagnosticCenterDetails.reportTime}</span></div>}
                          </div>
                       </div>
                    )}

                    {hospital.operatingHours && (
                      <div>
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-lg"><FaClock style={{ color: theme }} /> Working Hours</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                          {['monday','tuesday','wednesday','thursday', 'friday','saturday','sunday'].map(day => (
                            <div key={day} className="flex justify-between items-center py-2 border-b border-gray-100">
                              <span className="text-sm text-gray-500 capitalize font-medium">{day}</span>
                              <span className={`text-sm font-semibold ${hospital.operatingHours && hospital.operatingHours[day] === 'Closed' ? 'text-red-500' : 'text-gray-800'}`}>{(hospital.operatingHours && hospital.operatingHours[day]) || 'N/A'}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB: PACKAGES & ROOMS */}
                {activeTab === 'packages & rooms' && (
                  <div className="space-y-8 animate-fadeIn">
                    
                    {hospital.packages?.length > 0 ? (
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Health Checkup Packages</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {hospital.packages.map((pkg, i) => (
                            <div key={i} className="border border-green-200 bg-green-50 p-4 rounded-xl relative overflow-hidden">
                              <div className="absolute -right-4 -top-4 w-16 h-16 bg-green-200 rounded-full opacity-50"></div>
                              <h4 className="font-bold text-green-800 text-lg">{pkg.name}</h4>
                              <p className="text-2xl font-black text-green-600 mt-2 mb-3">₹{pkg.price}</p>
                              {pkg.duration && <p className="text-xs text-gray-600 mb-2">⏱️ {pkg.duration}</p>}
                              {pkg.includedTests?.length > 0 && (
                                <div>
                                  <p className="text-xs font-bold text-gray-700 mb-1">Included Tests:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {pkg.includedTests.map((test, j) => <span key={j} className="text-[10px] bg-white border border-green-100 px-2 py-0.5 rounded">{test}</span>)}
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
                            <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-gray-100 rounded-xl bg-white shadow-sm">
                              <div>
                                <h4 className="font-bold text-gray-800 text-lg">{room.type}</h4>
                                {room.facilities?.length > 0 && <p className="text-xs text-gray-500 mt-1">{room.facilities.join(' • ')}</p>}
                              </div>
                              <div className="mt-3 md:mt-0 text-right">
                                <span className="text-xl font-black text-blue-600">₹{room.pricePerDay}</span><span className="text-gray-400 text-sm">/day</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : <p className="text-gray-500 mt-6">No room types listed.</p>}
                  </div>
                )}

                {/* TAB: SERVICES */}
                {activeTab === 'services' && <div className="animate-fadeIn"><PriceList services={hospital.services || []} themeColor={theme} /></div>}

                {/* TAB: REVIEWS */}
                {activeTab === 'reviews' && <div className="animate-fadeIn"><ReviewForm facilityId={hospital._id || hospital.id} facilityType="hospital" onReviewSubmitted={fetchHospital} /></div>}
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="space-y-4">
            
            <div className="bg-white rounded-2xl shadow-md p-5 border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><FaPhone style={{ color: theme }} /> Contact & Social</h3>
              <div className="space-y-3">
                {hospital.phone && <a href={`tel:${hospital.phone}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition"><div className="w-10 h-10 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: theme }}><FaPhone className="text-sm" /></div><div><p className="text-xs text-gray-500 font-semibold">Phone</p><p className="font-semibold text-gray-800">{hospital.phone}</p></div></a>}
                {hospital.email && <a href={`mailto:${hospital.email}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition"><div className="w-10 h-10 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: theme }}><FaEnvelope className="text-sm" /></div><div><p className="text-xs text-gray-500 font-semibold">Email</p><p className="font-semibold text-gray-800 text-sm truncate">{hospital.email}</p></div></a>}
                
                {/* Social Media Links */}
                {hospital.socialMedia && (hospital.socialMedia.facebook || hospital.socialMedia.instagram || hospital.socialMedia.twitter || hospital.socialMedia.youtube) && (
                  <div className="pt-3 border-t border-gray-100 flex justify-around">
                    {hospital.socialMedia.facebook && <a href={hospital.socialMedia.facebook} target="_blank" rel="noreferrer" className="p-2 text-blue-600 hover:bg-blue-50 rounded-full text-xl"><FaFacebook /></a>}
                    {hospital.socialMedia.instagram && <a href={hospital.socialMedia.instagram} target="_blank" rel="noreferrer" className="p-2 text-pink-600 hover:bg-pink-50 rounded-full text-xl"><FaInstagram /></a>}
                    {hospital.socialMedia.twitter && <a href={hospital.socialMedia.twitter} target="_blank" rel="noreferrer" className="p-2 text-blue-400 hover:bg-blue-50 rounded-full text-xl"><FaTwitter /></a>}
                    {hospital.socialMedia.youtube && <a href={hospital.socialMedia.youtube} target="_blank" rel="noreferrer" className="p-2 text-red-600 hover:bg-red-50 rounded-full text-xl"><FaYoutube /></a>}
                  </div>
                )}
              </div>
            </div>

            {/* Management & Documents */}
            {(hospital.documents?.awards?.length > 0 || hospital.documents?.isoCertification || hospital.staffAndManagement?.medicalDirector) && (
              <div className="bg-white rounded-2xl shadow-md p-5 border border-gray-100">
                 <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><FaUserTie style={{ color: theme }} /> Management & Certs</h3>
                 <div className="space-y-3 text-sm">
                   {hospital.staffAndManagement?.medicalDirector && <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Medical Director</span><span className="font-semibold">{hospital.staffAndManagement.medicalDirector}</span></div>}
                   {hospital.staffAndManagement?.chiefSurgeon && <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Chief Surgeon</span><span className="font-semibold">{hospital.staffAndManagement.chiefSurgeon}</span></div>}
                   {hospital.documents?.isoCertification && <div className="flex justify-between border-b pb-2"><span className="text-gray-500">ISO Certified</span><span className="font-bold text-green-600">✅ Yes</span></div>}
                   {hospital.documents?.awards?.length > 0 && <div><span className="text-gray-500 block mb-1">Awards / Recognitions</span><div className="flex flex-wrap gap-1">{hospital.documents.awards.map((aw, i) => <span key={i} className="bg-yellow-50 text-yellow-700 text-[10px] px-2 py-1 rounded font-bold">{aw}</span>)}</div></div>}
                 </div>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-md p-5 border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-3">📍 Location</h3>
              <div className="h-32 rounded-xl flex items-center justify-center mb-3 border border-dashed border-gray-300" style={{ backgroundColor: theme + '05' }}>
                <div className="text-center"><FaMapMarkerAlt className="text-4xl mx-auto mb-1" style={{ color: theme }} /><p className="text-sm text-gray-600 font-medium">{hospital.address?.city}, {hospital.address?.state}</p>{distance && <p className="text-xs text-green-600 font-semibold mt-1">{distance.toFixed(1)} km away</p>}</div>
              </div>
              <MapButton hospital={hospital} fullWidth={true} />
            </div>

            <div className="bg-white rounded-2xl shadow-md p-5 border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4">ℹ️ Quick Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center pb-2 border-b border-gray-50"><span className="text-gray-500">Category</span><span className="font-semibold capitalize text-gray-800">{getCategoryIcon(hospital.category)} {hospital.category || 'Private'}</span></div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-50"><span className="text-gray-500">Type</span><span className="font-semibold capitalize text-gray-800">{hospital.type || 'N/A'}</span></div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-50"><span className="text-gray-500">Total Beds</span><span className="font-semibold text-gray-800">{hospital.numberOfBeds || 'N/A'}</span></div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-50"><span className="text-gray-500">Total Services</span><span className="font-semibold text-gray-800">{totalServicesListed} listed</span></div>
                <div className="flex justify-between items-center"><span className="text-gray-500">Pin Code</span><span className="font-semibold text-gray-800">{hospital.address?.pincode || 'N/A'}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ DOCTORS SECTION - FIXED SCHEMA KEYS AND ADDED BUTTON */}
      {hospital.doctors && hospital.doctors.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 mt-12 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3"><FaStethoscope style={{ color: theme }} /> Our Specialists</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hospital.doctors.map((doctor, idx) => (
              <div key={idx} className="bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-xl transition-all overflow-hidden flex flex-col h-full">
                <div className="h-32 flex items-end justify-center relative" style={{ backgroundColor: `${theme}20` }}>
                   {doctor.photo ? <img src={doctor.photo} alt={doctor.name} className="w-24 h-24 rounded-full object-cover border-4 border-white absolute -bottom-12 shadow-sm" /> : <div className="w-24 h-24 rounded-full bg-white border-4 border-gray-100 flex items-center justify-center absolute -bottom-12 shadow-sm"><FaUserMd className="text-4xl text-gray-300" /></div>}
                </div>
                <div className="pt-16 p-5 flex-1 flex flex-col text-center">
                  <h3 className="text-xl font-bold text-gray-900">{doctor.name}</h3>
                  <p className="text-sm font-semibold mb-2" style={{ color: theme }}>{doctor.specialization}</p>
                  
                  <div className="text-sm text-gray-600 space-y-1 mb-4">
                    {doctor.qualification && <p>🎓 {doctor.qualification}</p>}
                    {doctor.experience && <p>⭐ {doctor.experience} Experience</p>}
                    {doctor.languages?.length > 0 && <p>🗣️ {doctor.languages.join(', ')}</p>}
                  </div>
                  
                  <div className="mt-auto border-t pt-4 flex justify-between items-center bg-gray-50 -mx-5 px-5 py-3 mb-4">
                     <div className="text-left">
                       <p className="text-xs text-gray-500 uppercase font-bold">OPD Timing</p>
                       <p className="text-sm font-medium text-gray-800">{doctor.availability || doctor.opdTiming || 'Contact Hospital'}</p>
                     </div>
                     <div className="text-right">
                       <p className="text-xs text-gray-500 uppercase font-bold">Consultation</p>
                       <p className="text-lg font-black text-green-600">{doctor.consultationFee || doctor.fees ? `₹${doctor.consultationFee || doctor.fees}` : 'N/A'}</p>
                     </div>
                  </div>

                  <button 
                    onClick={() => handleBookAppointment(doctor._id)} 
                    disabled={!hospital.appointmentsEnabled}
                    className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed -mx-5 -mb-5 px-5"
                    style={{ width: 'calc(100% + 40px)' }}
                  >
                    {hospital.appointmentsEnabled ? 'Book Appointment' : 'Booking Unavailable'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* GENERAL SERVICES LIST */}
      <div id="services-section" className="max-w-6xl mx-auto px-4 py-8 scroll-mt-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">General Services & Facilities</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {combinedTests.length > 0 && (
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition">
              <div className="flex items-center gap-3 mb-4"><div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center"><FaFlask className="text-xl text-blue-600" /></div><div><h3 className="font-bold text-gray-900">Tests / Diagnosis</h3><p className="text-sm text-gray-600">{combinedTests.length} available</p></div></div>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {combinedTests.map((item, idx) => <div key={idx} className="flex items-center gap-2 text-sm"><span className="text-blue-500">✓</span><span className="text-gray-700">{item}</span></div>)}
              </div>
            </div>
          )}

          {combinedTreatments.length > 0 && (
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition">
              <div className="flex items-center gap-3 mb-4"><div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center"><FaPills className="text-xl text-green-600" /></div><div><h3 className="font-bold text-gray-900">Treatments</h3><p className="text-sm text-gray-600">{combinedTreatments.length} available</p></div></div>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {combinedTreatments.map((item, idx) => <div key={idx} className="flex items-center gap-2 text-sm"><span className="text-green-500">✓</span><span className="text-gray-700">{item}</span></div>)}
              </div>
            </div>
          )}

          {combinedSurgeries.length > 0 && (
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition">
              <div className="flex items-center gap-3 mb-4"><div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center"><FaCut className="text-xl text-red-600" /></div><div><h3 className="font-bold text-gray-900">Surgeries</h3><p className="text-sm text-gray-600">{combinedSurgeries.length} available</p></div></div>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {combinedSurgeries.map((item, idx) => <div key={idx} className="flex items-center gap-2 text-sm"><span className="text-red-500">✓</span><span className="text-gray-700">{item}</span></div>)}
              </div>
            </div>
          )}

          {combinedProcedures.length > 0 && (
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition">
              <div className="flex items-center gap-3 mb-4"><div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center"><FaClipboardList className="text-xl text-purple-600" /></div><div><h3 className="font-bold text-gray-900">Procedures</h3><p className="text-sm text-gray-600">{combinedProcedures.length} available</p></div></div>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {combinedProcedures.map((item, idx) => <div key={idx} className="flex items-center gap-2 text-sm"><span className="text-purple-500">✓</span><span className="text-gray-700">{item}</span></div>)}
              </div>
            </div>
          )}

          {combinedTherapies.length > 0 && (
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition">
              <div className="flex items-center gap-3 mb-4"><div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center"><FaSpa className="text-xl text-teal-600" /></div><div><h3 className="font-bold text-gray-900">Therapies</h3><p className="text-sm text-gray-600">{combinedTherapies.length} available</p></div></div>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {combinedTherapies.map((item, idx) => <div key={idx} className="flex items-center gap-2 text-sm"><span className="text-teal-500">✓</span><span className="text-gray-700">{item}</span></div>)}
              </div>
            </div>
          )}

          {hospital.insuranceAccepted?.length > 0 && (
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition">
              <div className="flex items-center gap-3 mb-4"><div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center"><FaShieldAlt className="text-xl text-green-600" /></div><div><h3 className="font-bold text-gray-900">Insurance Providers</h3><p className="text-sm text-gray-600">{hospital.insuranceAccepted.length} accepted</p></div></div>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {hospital.insuranceAccepted.map((item, idx) => <div key={idx} className="flex items-center gap-2 text-sm"><FaShieldAlt className="text-green-500 text-xs" /><span className="text-gray-700">{item}</span></div>)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HospitalDetails;