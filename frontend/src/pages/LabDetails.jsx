import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom'; 
import axios from 'axios';
import { 
  FaFlask, 
  FaMapMarkerAlt, 
  FaStar,
  FaHeart,
  FaCalendarCheck,
  FaArrowLeft,
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
  FaExclamationCircle,
  FaCheckCircle
} from 'react-icons/fa';
import Footer from '../components/Footer';
import PriceList from '../components/PriceList'; // ✅ Using unified PriceList
import ReviewForm from '../components/ReviewForm';

const LabDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const locationRouter = useLocation(); 

  const initialData = locationRouter.state?.facilityData; 

  const [lab, setLab] = useState(initialData || null);
  const [loading, setLoading] = useState(!initialData); 
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');

  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0); 
    fetchLab();
    checkIfFavorite(); 
  }, [id]);

  const fetchLab = async () => {
    try {
      if (!lab) {
        setLoading(true);
      }
      const response = await axios.get(`http://localhost:3000/api/labs/${id}`);
      setLab(response.data.data); 
    } catch (error) {
      console.error('Error fetching lab:', error);
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
      setIsFavorite(favorites.laboratories?.includes(id));
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
        { facilityId: id, facilityType: 'laboratory' },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      setIsFavorite(!isFavorite);
      alert(isFavorite ? '✅ Removed from favorites' : '✅ Added to favorites');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update favorites');
    }
  };

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

  const nextImage = () => {
    if (lab.images && lab.images.length > 0) {
      setActiveImageIndex((prev) => (prev + 1) % lab.images.length);
    }
  };

  const prevImage = () => {
    if (lab.images && lab.images.length > 0) {
      setActiveImageIndex((prev) => (prev - 1 + lab.images.length) % lab.images.length);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500"></div>
      </div>
    );
  }

  if (!lab) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 text-xl mb-4">Laboratory not found</p>
            <button onClick={() => navigate(-1)} className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700">
              Go Back
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const themeColor = lab.themeColor || '#9333EA'; // Default purple for labs
  
  const getMapUrl = () => {
    if (lab.location?.coordinates?.length === 2) {
      return `https://maps.google.com/?q=${lab.location.coordinates[1]},${lab.location.coordinates[0]}`;
    }
    return `https://maps.google.com/?q=${encodeURIComponent(`${lab.name} ${lab.address?.city}`)}`;
  };

  // ✅ LOGIC: Merging unpriced services into tests list
  const unpricedServices = lab.services?.filter(s => !s.price || s.price <= 0) || [];
  const combinedTests = Array.from(new Set([
    ...(lab.tests || []),
    ...unpricedServices.map(s => s.name)
  ]));

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="h-2 w-full" style={{ backgroundColor: themeColor }} />

      <div className="flex-1">
        {/* Hero Section with Image Gallery */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <button onClick={() => navigate(-1)} className="text-purple-600 hover:text-purple-700 mb-4 flex items-center gap-2 font-medium">
              <FaArrowLeft /> Back
            </button>
          </div>

          <div className="relative h-96 bg-gradient-to-br from-purple-100 to-purple-200">
            {lab.images && lab.images.length > 0 ? (
              <>
                <img src={lab.images[activeImageIndex]} alt={lab.name} className="w-full h-full object-cover" />
                {lab.images.length > 1 && (
                  <>
                    <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 rounded-full shadow-lg hover:bg-white">
                      <FaChevronLeft className="text-xl text-gray-800" />
                    </button>
                    <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 rounded-full shadow-lg hover:bg-white">
                      <FaChevronRight className="text-xl text-gray-800" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {lab.images.map((_, idx) => (
                        <button key={idx} onClick={() => setActiveImageIndex(idx)} className={`w-2 h-2 rounded-full transition ${idx === activeImageIndex ? 'bg-white w-8' : 'bg-white/50'}`} />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <FaFlask className="text-8xl text-purple-300 mb-4" />
                <p className="text-purple-400 font-medium">No photos available</p>
              </div>
            )}
          </div>
        </div>

        {/* Header Info Bar */}
        <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 rounded-full text-sm font-bold text-white shadow-sm capitalize" style={{ backgroundColor: themeColor }}>
                    🔬 {lab.type}
                  </span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{lab.name}</h1>
                <p className="text-gray-600 mb-3">
                  {lab.address?.street && `${lab.address.street}, `}
                  {lab.address?.area && `${lab.address.area}, `}
                  {lab.address?.city}, {lab.address?.state}, {lab.address?.pincode}
                </p>

                {lab.establishedDate && (
                  <div className="flex items-center gap-2 mb-3">
                    <FaCalendarAlt style={{ color: themeColor }} />
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Established</p>
                      <p className="text-sm text-gray-900">
                        {new Date(lab.establishedDate).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'long', year: 'numeric'
                        })}
                      </p>
                      <p className="text-xs text-gray-500">{calculateYearsSince(lab.establishedDate)}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4 flex-wrap">
                  {lab.googleRating > 0 && (
                    <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg">
                      <FaStar className="text-yellow-500" />
                      <span className="font-bold text-gray-900 text-lg">{lab.googleRating}</span>
                      <span className="text-sm text-gray-600">{lab.googleReviewCount} Google reviews</span>
                    </div>
                  )}
                  {lab.distance && (
                    <span className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg font-bold">
                      📍 {lab.distance} km from you
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-3 ml-6">
                {lab.owner && lab.appointmentsEnabled ? (
                  <button onClick={() => navigate(`/appointments/book?lab=${lab._id}`)} className="px-6 py-3 text-white rounded-xl font-bold hover:opacity-90 flex items-center gap-2 shadow-md transition" style={{ backgroundColor: themeColor }}>
                    <FaCalendarCheck /> Book Test
                  </button>
                ) : (
                  <div className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-medium flex items-center gap-2">
                    <FaExclamationCircle /> Online appointments not available
                  </div>
                )}
                
                <div className="flex gap-2">
                  <button onClick={handleToggleFavorite} className={`flex-1 px-4 py-3 border-2 rounded-xl font-bold flex items-center justify-center gap-2 transition ${isFavorite ? 'bg-red-50 border-red-200 text-red-600' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
                    <FaHeart className={isFavorite ? 'text-red-500 fill-current' : 'text-gray-400'} /> {isFavorite ? 'Saved' : 'Save'}
                  </button>

                  <button onClick={() => window.open(getMapUrl(), '_blank')} className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 flex items-center justify-center gap-2 transition">
                    <FaMapMarkerAlt /> Directions
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex gap-8">
              {['overview', 'pricing', 'reviews'].map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`py-4 font-bold border-b-2 transition ${activeTab === tab ? 'border-current' : 'border-transparent text-gray-500 hover:text-gray-900'}`} style={activeTab === tab ? { color: themeColor, borderColor: themeColor } : {}}>
                  {tab === 'overview' && '📋 Overview'}
                  {tab === 'pricing' && '💰 Price List'}
                  {tab === 'reviews' && '⭐ Reviews'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* ===== TAB 1: OVERVIEW ===== */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {lab.description && (
                    <div className="bg-white rounded-2xl shadow-md p-6">
                      <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
                      <p className="text-gray-700 leading-relaxed text-sm md:text-base">{lab.description}</p>
                    </div>
                  )}

                  {lab.facilities && lab.facilities.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-md p-6">
                      <h2 className="text-xl font-bold text-gray-900 mb-4">Facilities</h2>
                      <div className="flex flex-wrap gap-2">
                        {lab.facilities.map((facility, index) => (
                          <span key={index} className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ backgroundColor: `${themeColor}15`, color: themeColor }}>
                            <FaCheckCircle className="text-xs" /> {facility}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tests Summary with Unpriced Merged logic */}
                  {combinedTests.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-md p-6">
                      <div className="flex items-center justify-between mb-4">
                         <h2 className="text-xl font-bold text-gray-900">Services & Tests Available</h2>
                         <button onClick={() => setActiveTab('pricing')} className="text-sm font-bold hover:underline" style={{ color: themeColor }}>View Pricing ➔</button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {combinedTests.slice(0, 10).map((test, idx) => (
                          <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-100">
                            <FaFlask style={{ color: themeColor }} />
                            <span className="text-gray-800 text-sm font-medium">{test}</span>
                          </div>
                        ))}
                      </div>
                      {combinedTests.length > 10 && (
                        <button onClick={() => setActiveTab('pricing')} className="mt-4 w-full py-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-sm font-bold text-gray-700 border border-gray-200 transition">
                           View {combinedTests.length - 10} more tests
                        </button>
                      )}
                    </div>
                  )}

                  <div className="bg-white rounded-2xl shadow-md p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Working Hours</h2>
                    {lab.operatingHours ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                        {daysOfWeek.map((day) => (
                          <div key={day} className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-sm font-medium text-gray-500 capitalize">{day}</span>
                            <span className={`text-sm font-semibold ${lab.operatingHours[day] === 'Closed' ? 'text-red-500' : 'text-gray-900'}`}>
                              {lab.operatingHours[day] || 'N/A'}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">Working hours not provided</p>
                    )}
                  </div>
                </div>
              )}

              {/* ===== TAB 2: PRICING (✅ UNIFIED COMPONENT NOW) ===== */}
              {activeTab === 'pricing' && (
                <div className="animate-fadeIn">
                  <PriceList services={lab.services || []} themeColor={themeColor} />
                </div>
              )}

              {/* ===== TAB 3: REVIEWS ===== */}
              {activeTab === 'reviews' && (
                <div className="animate-fadeIn">
                   <ReviewForm facilityId={lab._id || lab.id} facilityType="laboratory" onReviewSubmitted={() => { alert('Review submitted!'); fetchLab(); }} />
                </div>
              )}

            </div>

            {/* Right Sidebar - Remains visible */}
            <div className="space-y-6">
              
              {/* Map Preview */}
              <div className="bg-white rounded-2xl shadow-md overflow-hidden h-64 relative border border-gray-100">
                {lab.location?.coordinates?.length === 2 ? (
                  <iframe title="Lab Location" width="100%" height="100%" frameBorder="0" style={{ border: 0 }} src={`https://maps.google.com/?q=${lab.location.coordinates[1]},${lab.location.coordinates[0]}&output=embed`} allowFullScreen></iframe>
                ) : (
                  <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-500 flex-col">
                    <FaMapMarkerAlt className="text-3xl mb-2 text-gray-300" /> Map not available
                  </div>
                )}
              </div>

              {/* Quick Info */}
              <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4">ℹ️ Quick Info</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="text-gray-500">Type</span>
                    <span className="font-semibold text-gray-900 capitalize">{lab.type}</span>
                  </div>
                  {lab.reportTime && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                      <span className="text-gray-500">Report Time</span>
                      <span className="font-semibold text-gray-900">{lab.reportTime}</span>
                    </div>
                  )}
                  {lab.homeCollection !== undefined && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                      <span className="text-gray-500">Home Collection</span>
                      <span className={`font-bold ${lab.homeCollection ? 'text-green-600' : 'text-gray-500'}`}>
                        {lab.homeCollection ? '✅ Available' : '❌ No'}
                      </span>
                    </div>
                  )}
                  {lab.accreditation && lab.accreditation.length > 0 && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                      <span className="text-gray-500">Accreditation</span>
                      <span className="font-semibold text-gray-900">{lab.accreditation.join(', ')}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="text-gray-500">Services Listed</span>
                    <span className="font-semibold text-gray-900">{(lab.services?.length || 0) + combinedTests.length}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-500">Pin Code</span>
                    <span className="font-semibold text-gray-900">{lab.address?.pincode}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LabDetails;