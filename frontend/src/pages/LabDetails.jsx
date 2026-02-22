import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  FaExclamationCircle
} from 'react-icons/fa';
import Footer from '../components/Footer';

const LabDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lab, setLab] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');

  // ✅ Added Favorite State
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    fetchLab();
    checkIfFavorite(); // ✅ Check favorite status on mount
  }, [id]);

  const fetchLab = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/labs/${id}`);
      setLab(response.data.data);
    } catch (error) {
      console.error('Error fetching lab:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Check if lab is favorite
  const checkIfFavorite = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get('http://localhost:3000/api/favorites', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const favorites = response.data.data;
      // Backend uses 'laboratories' array
      setIsFavorite(favorites.laboratories?.includes(id));
    } catch (error) {
      console.error('Check favorite error:', error);
    }
  };

  // ✅ Toggle favorite API
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
  
  const getMapUrl = () => {
    if (lab.location?.coordinates?.length === 2) {
      return `https://www.google.com/maps?q=${lab.location.coordinates[1]},${lab.location.coordinates[0]}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lab.name} ${lab.address?.city}`)}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1">
        {/* Hero Section with Image Gallery */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <button onClick={() => navigate(-1)} className="text-purple-600 hover:text-purple-700 mb-4 flex items-center gap-2 font-medium">
              <FaArrowLeft /> Back to Search
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
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-bold">
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
                    <FaCalendarAlt className="text-purple-600" />
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Established</p>
                      <p className="text-sm text-gray-900">
                        {new Date(lab.establishedDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                      <p className="text-xs text-gray-500">{calculateYearsSince(lab.establishedDate)}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4 flex-wrap">
                  {lab.googleRating > 0 && (
                    <div className="flex items-center gap-2">
                      <FaStar className="text-yellow-500 text-xl" />
                      <span className="font-bold text-gray-900 text-lg">{lab.googleRating}</span>
                      <span className="text-sm text-gray-600">{lab.googleReviewCount} Google reviews</span>
                    </div>
                  )}
                  {lab.distance && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold">
                      📍 {lab.distance} km from you
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-3 ml-6">
                {lab.owner && lab.appointmentsEnabled ? (
                  <button onClick={() => navigate(`/appointments/book?lab=${lab._id}`)} className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 flex items-center gap-2 whitespace-nowrap">
                    <FaCalendarCheck /> Book Test
                  </button>
                ) : (
                  <div className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-medium flex items-center gap-2">
                    <FaExclamationCircle /> Online appointments not available
                  </div>
                )}
                
                {/* ✅ Added HandleToggleFavorite logic here */}
                <button onClick={handleToggleFavorite} className={`px-6 py-3 border-2 rounded-xl font-bold flex items-center justify-center gap-2 transition ${isFavorite ? 'bg-red-50 border-red-200 text-red-600' : 'border-purple-600 text-purple-600 hover:bg-purple-50'}`}>
                  <FaHeart className={isFavorite ? 'text-red-500 fill-current' : 'text-purple-600'} /> {isFavorite ? 'Saved' : 'Save'}
                </button>

                <button onClick={() => window.open(getMapUrl(), '_blank')} className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 flex items-center gap-2">
                  <FaMapMarkerAlt /> Get Directions
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex gap-3">
              <button onClick={() => window.open(getMapUrl(), '_blank')} className="px-6 py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700">
                Get Directions
              </button>
              <button className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50">
                Compare
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b sticky top-20 z-10">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex gap-8">
              {['overview', 'pricing', 'reviews'].map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`py-4 font-bold border-b-2 transition ${activeTab === tab ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-600 hover:text-gray-900'}`}>
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
            
            {/* Left Column - Dynamic Based on Active Tab */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* ===== TAB 1: OVERVIEW ===== */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* About */}
                  {lab.description && (
                    <div className="bg-white rounded-2xl shadow-md p-6">
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
                      <p className="text-gray-700 leading-relaxed">{lab.description}</p>
                    </div>
                  )}

                  {/* Facilities */}
                  {lab.facilities && lab.facilities.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-md p-6">
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">Facilities</h2>
                      <div className="flex flex-wrap gap-2">
                        {lab.facilities.map((facility, index) => (
                          <span key={index} className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg font-medium">
                            {facility}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tests Summary */}
                  {lab.tests && lab.tests.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-md p-6">
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">Services & Facilities</h2>
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-bold text-gray-900 mb-3">Tests <span className="text-sm text-gray-600">({lab.tests.length} available)</span></h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            {lab.tests.slice(0, 6).map((test, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-sm">
                                <span className="text-green-600">✓</span>
                                <span className="text-gray-700">{test}</span>
                              </div>
                            ))}
                          </div>
                          {lab.tests.length > 6 && (
                            <p className="text-sm text-purple-600 font-semibold mt-2 cursor-pointer hover:underline" onClick={() => setActiveTab('pricing')}>
                              +{lab.tests.length - 6} more tests (View Pricing)
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Working Hours */}
                  <div className="bg-white rounded-2xl shadow-md p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Working Hours</h2>
                    {lab.operatingHours ? (
                      <div className="space-y-3">
                        {daysOfWeek.map((day) => (
                          <div key={day} className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="font-medium text-gray-700 capitalize">{day}</span>
                            <span className="text-gray-900">{lab.operatingHours.open} - {lab.operatingHours.close}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {daysOfWeek.map((day) => (
                          <div key={day} className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="font-medium text-gray-700 capitalize">{day}</span>
                            <span className="text-gray-500">N/A</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Contact Info */}
                  <div className="bg-white rounded-2xl shadow-md p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Info</h2>
                    <div className="space-y-4">
                      {lab.phone && (
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-1">Phone</p>
                          <a href={`tel:${lab.phone}`} className="text-purple-600 hover:underline font-medium">
                            {lab.phone}
                          </a>
                        </div>
                      )}
                      {lab.email && (
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-1">Email</p>
                          <a href={`mailto:${lab.email}`} className="text-purple-600 hover:underline">
                            {lab.email}
                          </a>
                        </div>
                      )}
                      {lab.website && (
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-1">Website</p>
                          <a href={lab.website} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
                            {lab.website}
                          </a>
                        </div>
                      )}
                      {lab.address?.landmark && (
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-1">Landmark</p>
                          <p className="text-gray-900">{lab.address.landmark}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ===== TAB 2: PRICING ===== */}
              {activeTab === 'pricing' && (
                <div className="bg-white rounded-2xl shadow-md p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">💰 Price List</h2>
                  {lab.tests && lab.tests.length > 0 ? (
                    <div className="space-y-3">
                      {lab.tests.map((test, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 border-b border-gray-100 hover:bg-gray-50 transition rounded-lg">
                          <span className="text-gray-900 font-medium">{test}</span>
                          <span className="text-purple-600 font-bold bg-purple-50 px-3 py-1 rounded-lg">Contact for pricing</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No pricing information available</p>
                    </div>
                  )}
                </div>
              )}

              {/* ===== TAB 3: REVIEWS ===== */}
              {activeTab === 'reviews' && (
                <div className="bg-white rounded-2xl shadow-md p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">⭐ Reviews</h2>
                  
                  {lab.googleRating > 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                      <FaStar className="text-6xl text-yellow-500 mx-auto mb-4 drop-shadow-sm" />
                      <p className="text-3xl font-bold text-gray-900 mb-2">
                        {lab.googleRating} <span className="text-lg text-gray-500 font-medium">/ 5.0</span>
                      </p>
                      <p className="text-gray-600 mb-6 font-medium">
                        Based on {lab.googleReviewCount} Google reviews
                      </p>
                      
                      <a 
                        href={`https://www.google.com/search?q=${encodeURIComponent(`${lab.name} ${lab.address?.city || ''}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-md"
                      >
                        Read on Google
                      </a>
                    </div>
                  ) : (
                    <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
                      <p className="text-gray-500 text-lg">No reviews available yet</p>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Right Sidebar - This stays visible across all tabs */}
            <div className="space-y-6">
              
              {/* Location Card */}
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">📍 Location</h3>
                <p className="text-gray-700 mb-2">{lab.address?.street}, {lab.address?.city}, {lab.address?.state}</p>
                {lab.distance && (
                  <p className="text-sm text-green-600 font-semibold mb-4">{lab.distance} km away</p>
                )}
                <button onClick={() => window.open(getMapUrl(), '_blank')} className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition shadow-sm">
                  Get Directions
                </button>
              </div>

              {/* Quick Info */}
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">ℹ️ Quick Info</h3>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Type</span>
                    <span className="font-semibold text-gray-900">{lab.type}</span>
                  </div>
                  {lab.reportTime && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Report Time</span>
                      <span className="font-semibold text-gray-900">{lab.reportTime}</span>
                    </div>
                  )}
                  {lab.homeCollection !== undefined && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Home Collection</span>
                      <span className={`font-semibold ${lab.homeCollection ? 'text-green-600' : 'text-gray-900'}`}>
                        {lab.homeCollection ? '✅ Available' : 'Not Available'}
                      </span>
                    </div>
                  )}
                  {lab.accreditation && lab.accreditation.length > 0 && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Accreditation</span>
                      <span className="font-semibold text-gray-900 text-right">{lab.accreditation.join(', ')}</span>
                    </div>
                  )}
                  {lab.tests && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Tests Available</span>
                      <span className="font-semibold text-gray-900">{lab.tests.length} listed</span>
                    </div>
                  )}
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Pin Code</span>
                    <span className="font-semibold text-gray-900">{lab.address?.pincode}</span>
                  </div>
                </div>
              </div>

              {/* Map */}
              <div className="bg-white rounded-2xl shadow-md overflow-hidden h-64 relative">
                {lab.location?.coordinates?.length === 2 ? (
                  <iframe
                    title="Lab Location"
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    style={{ border: 0 }}
                    src={`https://maps.google.com/maps?q=${lab.location.coordinates[1]},${lab.location.coordinates[0]}&z=15&output=embed`}
                    allowFullScreen
                  ></iframe>
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-500">
                    Map preview not available
                  </div>
                )}
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