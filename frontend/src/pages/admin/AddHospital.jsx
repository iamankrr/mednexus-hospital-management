import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaHospital, FaMapMarkerAlt, FaStar, FaArrowLeft, FaPlus, FaSync } from 'react-icons/fa';
import axios from 'axios';
import { indianStatesAndCities, getAllStates } from '../../data/indianCities'; 
import ImageUploadManager from '../../components/ImageUploadManager'; 
import CityStateSelector from '../../components/CityStateSelector'; 
import ThemeColorPicker from '../../components/ThemeColorPicker'; // ✅ ADDED THEME COLOR
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import API_URL from '../../config/api';
import { HOSPITAL_TYPES } from '../../components/HospitalTypeFilter'; 

const AddHospital = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); 
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false); 
  const [customFacility, setCustomFacility] = useState(''); 
  
  // Search state
  const [searchState, setSearchState] = useState(''); 
  const [searchCity, setSearchCity] = useState(''); 
  const [availableCities, setAvailableCities] = useState([]); 
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);

  // Owner State
  const [createOwner, setCreateOwner] = useState(false);
  const [ownerData, setOwnerData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });

  // Services State Variables
  const [newTest, setNewTest] = useState('');
  const [newTreatment, setNewTreatment] = useState('');
  const [newSurgery, setNewSurgery] = useState('');
  const [newInsurance, setNewInsurance] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: 'Private', 
    type: 'general',
    googlePlaceId: '',
    themeColor: '#1E40AF', // ✅ ADDED THEME COLOR
    address: {
      street: '',
      area: '',
      city: '',
      state: '',
      pincode: '',
      landmark: ''
    },
    location: {
      type: 'Point',
      coordinates: [77.2090, 28.6139] 
    },
    phone: '',
    email: '',
    website: '',
    description: '',
    establishedDate: '', 
    googleRating: 0,
    googleReviewCount: 0,
    images: [],
    facilities: [],
    tests: [],
    treatments: [],
    surgeries: [],
    procedures: [],
    therapies: [],
    managementServices: [],
    insuranceAccepted: [],
    numberOfBeds: 0,
    operatingHours: {
      monday: '9:00 AM - 6:00 PM',
      tuesday: '9:00 AM - 6:00 PM',
      wednesday: '9:00 AM - 6:00 PM',
      thursday: '9:00 AM - 6:00 PM',
      friday: '9:00 AM - 6:00 PM',
      saturday: '9:00 AM - 2:00 PM',
      sunday: 'Closed'
    },
    emergencyAvailable: true, 
    isActive: true
  });

  // =====================================
  // ✅ FIXED SERVICES ADDITION FUNCTIONS
  // =====================================
  const addTest = () => {
    if (newTest.trim() && !formData.tests?.includes(newTest.trim())) {
      setFormData({ ...formData, tests: [...(formData.tests || []), newTest.trim()] });
      setNewTest('');
    }
  };

  const addTreatment = () => {
    if (newTreatment.trim() && !formData.treatments?.includes(newTreatment.trim())) {
      setFormData({ ...formData, treatments: [...(formData.treatments || []), newTreatment.trim()] });
      setNewTreatment('');
    }
  };

  const addSurgery = () => {
    if (newSurgery.trim() && !formData.surgeries?.includes(newSurgery.trim())) {
      setFormData({ ...formData, surgeries: [...(formData.surgeries || []), newSurgery.trim()] });
      setNewSurgery('');
    }
  };

  const addInsurance = () => {
    if (newInsurance.trim() && !formData.insuranceAccepted?.includes(newInsurance.trim())) {
      setFormData({ ...formData, insuranceAccepted: [...(formData.insuranceAccepted || []), newInsurance.trim()] });
      setNewInsurance('');
    }
  };

  useEffect(() => {
    if (searchState) {
      setAvailableCities(indianStatesAndCities[searchState] || []);
      setSearchCity('');
    } else {
      setAvailableCities([]);
    }
  }, [searchState]);

  const categories = [
    { value: 'Government', label: '🏛️ Government' },
    { value: 'Public', label: '🏥 Public' },
    { value: 'Private', label: '💼 Private' },
    { value: 'Charity', label: '❤️ Charity/NGO' }
  ];

  const commonFacilities = [
    'ICU', 'Emergency', 'Pharmacy', 'Lab', 'X-Ray', 'CT Scan', 
    'MRI', 'Ultrasound', 'ECG', 'Ambulance', 'Blood Bank', 
    'OT', 'Cafeteria', 'Parking', 'Wheelchair', 'WiFi'
  ];

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      alert('Please enter a search query');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const fullQuery = searchCity ? `${searchQuery} ${searchCity}` : searchQuery;

      const response = await axios.post(
        `${API_URL}/api/admin/search-places`,
        { query: fullQuery, type: 'hospital' },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      setSearchResults(response.data.data || []);
      if (response.data.data?.length === 0) {
        alert('No hospitals found. Try different search terms.');
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlace = async (place) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await axios.post(
        `${API_URL}/api/admin/fetch-place-details`,
        { placeId: place.placeId },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      const placeData = response.data.data;

      setSelectedPlace(place);
      setFormData({
        ...formData,
        name: placeData.name || '',
        googlePlaceId: place.placeId,
        address: {
          street: placeData.address?.street || '',
          area: placeData.address?.area || '',
          city: placeData.address?.city || '',
          state: placeData.address?.state || '',
          pincode: placeData.address?.pincode || '',
          landmark: ''
        },
        location: placeData.location,
        phone: placeData.phone || '',
        website: placeData.website || '',
        googleRating: placeData.googleRating || 0,
        googleReviewCount: placeData.googleReviewCount || 0,
        images: [] 
      });

      setStep(2);
    } catch (error) {
      console.error('Fetch details error:', error);
      alert('Failed to fetch place details');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncGoogle = async () => {
    if (!formData.googlePlaceId) {
      alert("Please enter a Google Place ID first.");
      return;
    }
    
    setSyncing(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${API_URL}/api/admin/fetch-place-details`,
        { placeId: formData.googlePlaceId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (res.data.success) {
        const place = res.data.data;
        setFormData(prev => ({
          ...prev,
          googleRating: place.googleRating || prev.googleRating,
          googleReviewCount: place.googleReviewCount || prev.googleReviewCount,
        }));
        alert(`✅ Sync Successful! Found ${place.googleReviewCount} reviews with ${place.googleRating} rating.`);
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to fetch from Google Places API.");
    } finally {
      setSyncing(false);
    }
  };

  const toggleFacility = (facility) => {
    if (formData.facilities.includes(facility)) {
      setFormData({ ...formData, facilities: formData.facilities.filter(f => f !== facility) });
    } else {
      setFormData({ ...formData, facilities: [...formData.facilities, facility] });
    }
  };

  const handleManualEntry = () => {
    setStep(2);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    if (!formData.name || !formData.type || !formData.category) {
      alert('❌ Name, Category, and Type are required!');
      return;
    }

    if (!formData.address?.city || !formData.address?.state || !formData.address?.pincode) {
      alert('❌ City, State, and PIN Code are required fields!');
      return;
    }
  
    if (createOwner) {
      if (!ownerData.name || !ownerData.email || !ownerData.password || !ownerData.phone) {
        alert('❌ Please fill all owner fields!');
        return;
      }
      if (ownerData.phone.length !== 10) {
        alert('❌ Phone number must be 10 digits!');
        return;
      }
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const payload = {
        hospitalData: formData,
        createOwner: createOwner,
        ownerData: createOwner ? ownerData : null
      };
  
      const response = await axios.post(
        `${API_URL}/api/admin/create-hospital-with-owner`,
        payload,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
  
      if (response.data.success) {
        if (createOwner) {
          alert(`✅ Hospital and Owner created successfully!\n\nOwner Login:\nEmail: ${ownerData.email}\nPassword: ${ownerData.password}`);
        } else {
          alert('✅ Hospital added successfully!');
        }
        navigate('/admin/hospitals');
      }
    } catch (error) {
      console.error('❌ Submit error:', error.response?.data);  
      alert(error.response?.data?.message || 'Failed to add hospital. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-grow max-w-5xl w-full mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => step === 1 ? navigate('/admin/hospitals') : setStep(step - 1)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium p-2 rounded-lg hover:bg-gray-200"
          >
            <FaArrowLeft className="text-xl" /> Back
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FaHospital className="text-blue-600" /> Add New Hospital
            </h1>
            <p className="text-gray-600">Register a new hospital manually or search via Google Places</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>1</div>
            <span className="ml-2 font-medium">Search</span>
          </div>
          <div className={`w-16 h-1 mx-4 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>2</div>
            <span className="ml-2 font-medium">Details</span>
          </div>
          <div className={`w-16 h-1 mx-4 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>3</div>
            <span className="ml-2 font-medium">Review</span>
          </div>
        </div>

        {/* STEP 1: Search */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center justify-between">
              <span><FaSearch className="inline mr-2 text-blue-600" /> Auto-fill from Google Maps</span>
              <button onClick={handleManualEntry} className="text-sm px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-semibold border">
                Skip & Enter Manually ➔
              </button>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State (Optional)</label>
                <select value={searchState} onChange={(e) => setSearchState(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500">
                  <option value="">All States</option>
                  {getAllStates().map(state => <option key={state} value={state}>{state}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City (Optional)</label>
                <select value={searchCity} onChange={(e) => setSearchCity(e.target.value)} disabled={!searchState} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100">
                  <option value="">All Cities</option>
                  {availableCities.map(city => <option key={city} value={city}>{city}</option>)}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mb-6">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search for hospital (e.g., 'Apollo Hospital Delhi')"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
              <button onClick={handleSearch} disabled={loading} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50">
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-bold text-gray-700">Search Results:</h3>
                {searchResults.map((place) => (
                  <div key={place.placeId} onClick={() => handleSelectPlace(place)} className="p-4 border border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900">{place.name}</h4>
                        <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                          <FaMapMarkerAlt className="text-gray-400" /> {place.address}
                        </p>
                        {place.rating > 0 && (
                          <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                            <FaStar className="text-yellow-500" /> {place.rating} ({place.totalRatings} reviews)
                          </p>
                        )}
                      </div>
                      <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold hover:bg-blue-200">
                        Select & Continue
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Details */}
        {step === 2 && (
          <div className="space-y-6">
            
            {/* Basic Info Block */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">📝 Basic Information</h2>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: cat.value })}
                      className={`flex items-center justify-center gap-2 py-3 px-4 border rounded-xl font-medium transition-all ${
                        formData.category.toLowerCase() === cat.value.toLowerCase()
                          ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm'
                          : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hospital Name *</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hospital Type *</label>
                  <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500">
                    {HOSPITAL_TYPES.filter(t => t.value !== 'all').map(type => (
                      <option key={type.value} value={type.value}>{type.icon} {type.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  <input type="text" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Established Date (Optional)</label>
                  <input type="date" value={formData.establishedDate} onChange={(e) => setFormData({ ...formData, establishedDate: e.target.value })} max={new Date().toISOString().split('T')[0]} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500" />
                </div>
                
                {/* Google Sync Block */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Google Place ID (Optional)</label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input type="text" value={formData.googlePlaceId} onChange={e => setFormData({...formData, googlePlaceId: e.target.value})} className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500" placeholder="ChIJ..." />
                    <button type="button" onClick={handleSyncGoogle} disabled={syncing || !formData.googlePlaceId} className="px-6 py-3 bg-blue-100 text-blue-700 font-bold rounded-xl hover:bg-blue-200 transition flex items-center justify-center gap-2 disabled:opacity-50">
                      <FaSync className={syncing ? "animate-spin" : ""} /> {syncing ? 'Fetching...' : 'Sync Ratings'}
                    </button>
                  </div>
                  {formData.googleReviewCount > 0 && (
                    <p className="text-sm text-green-600 mt-2 font-semibold">⭐ Synced Data: {formData.googleRating} Rating ({formData.googleReviewCount} Reviews)</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            </div>

            {/* Address Block */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">📍 Address</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <CityStateSelector
                    selectedState={formData.address.state}
                    selectedCity={formData.address.city}
                    onStateChange={(val) => setFormData({ ...formData, address: {...formData.address, state: val} })}
                    onCityChange={(val) => setFormData({ ...formData, address: {...formData.address, city: val} })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                  <input type="text" value={formData.address.street} onChange={e => setFormData({ ...formData, address: {...formData.address, street: e.target.value} })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Area</label>
                  <input type="text" value={formData.address.area} onChange={e => setFormData({ ...formData, address: {...formData.address, area: e.target.value} })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">PIN Code *</label>
                  <input type="text" value={formData.address.pincode} maxLength={6} onChange={e => setFormData({ ...formData, address: {...formData.address, pincode: e.target.value} })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Landmark</label>
                  <input type="text" value={formData.address.landmark} onChange={e => setFormData({ ...formData, address: {...formData.address, landmark: e.target.value} })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            </div>

            {/* Theme Color */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">🎨 Theme Color</h2>
              <ThemeColorPicker
                value={formData.themeColor}
                onChange={(color) => setFormData({...formData, themeColor: color})}
              />
            </div>

            {/* Photos Block */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">📸 Photos</h2>
              <ImageUploadManager
                images={formData.images || []}
                onImagesChange={(newImages) => setFormData({ ...formData, images: newImages })}
                maxImages={10}
                facilityId={null}
                facilityType="hospital"
              />
            </div>

            {/* Facilities Block */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">🏥 Facilities & Amenities</h2>
              
              <div className="grid grid-cols-3 md:grid-cols-4 gap-2 mb-4">
                {commonFacilities.map(facility => (
                  <button key={facility} type="button" onClick={() => toggleFacility(facility)} className={`px-3 py-2 rounded-lg text-sm font-medium transition border ${formData.facilities.includes(facility) ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
                    {formData.facilities.includes(facility) ? '✓ ' : ''}{facility}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 mb-4">
                <input type="text" value={customFacility} onChange={e => setCustomFacility(e.target.value)} onKeyDown={e => {if (e.key === 'Enter') {e.preventDefault(); if (customFacility.trim() && !formData.facilities.includes(customFacility.trim())) { setFormData({...formData, facilities: [...formData.facilities, customFacility.trim()]}); setCustomFacility('');}}}} placeholder="Add custom facility (e.g., Blood Bank)" className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                <button type="button" onClick={() => {if (customFacility.trim() && !formData.facilities.includes(customFacility.trim())) { setFormData({...formData, facilities: [...formData.facilities, customFacility.trim()]}); setCustomFacility('');}}} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">Add</button>
              </div>

              {formData.facilities.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2 border-t">
                  {formData.facilities.map((fac, i) => (
                    <span key={i} className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200">
                      {fac} <button type="button" onClick={() => toggleFacility(fac)} className="text-red-500 font-bold hover:text-red-700">×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Working Hours */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">🕐 Working Hours</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].map(day => (
                  <div key={day}>
                    <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">{day}</label>
                    <input type="text" value={formData.operatingHours[day]} onChange={e => setFormData({ ...formData, operatingHours: {...formData.operatingHours, [day]: e.target.value} })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                ))}
              </div>
              
              <label className="flex items-center gap-3 cursor-pointer p-3 bg-red-50 rounded-xl border border-red-100">
                <input type="checkbox" checked={formData.emergencyAvailable} onChange={e => setFormData({...formData, emergencyAvailable: e.target.checked})} className="w-5 h-5 text-red-600 rounded focus:ring-red-500" />
                <span className="font-bold text-red-700">🚨 24/7 Emergency Services Available</span>
              </label>
            </div>

            {/* Services (Tests, Treatments, etc) */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">💰 Services Added (Prices N/A)</h2>
              
              {/* Tests */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tests Available</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={newTest} onChange={(e) => setNewTest(e.target.value)} onKeyDown={(e) => {if (e.key === 'Enter') {e.preventDefault(); addTest();}}} placeholder="e.g., Blood Test, X-Ray" className="flex-1 px-4 py-2 border border-gray-300 rounded-lg" />
                  <button type="button" onClick={addTest} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold"><FaPlus /></button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tests?.map((test, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-2">{test} <button type="button" onClick={() => setFormData({...formData, tests: formData.tests.filter((_, i) => i !== idx)})} className="text-red-500 font-bold">×</button></span>
                  ))}
                </div>
              </div>

              {/* Treatments */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Treatments</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={newTreatment} onChange={(e) => setNewTreatment(e.target.value)} onKeyDown={(e) => {if (e.key === 'Enter') {e.preventDefault(); addTreatment();}}} placeholder="e.g., Diabetes Management" className="flex-1 px-4 py-2 border border-gray-300 rounded-lg" />
                  <button type="button" onClick={addTreatment} className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold"><FaPlus /></button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.treatments?.map((treatment, idx) => (
                    <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center gap-2">{treatment} <button type="button" onClick={() => setFormData({...formData, treatments: formData.treatments.filter((_, i) => i !== idx)})} className="text-red-500 font-bold">×</button></span>
                  ))}
                </div>
              </div>

              {/* Surgeries */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Surgeries</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={newSurgery} onChange={(e) => setNewSurgery(e.target.value)} onKeyDown={(e) => {if (e.key === 'Enter') {e.preventDefault(); addSurgery();}}} placeholder="e.g., Cardiac Surgery" className="flex-1 px-4 py-2 border border-gray-300 rounded-lg" />
                  <button type="button" onClick={addSurgery} className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold"><FaPlus /></button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.surgeries?.map((surgery, idx) => (
                    <span key={idx} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm flex items-center gap-2">{surgery} <button type="button" onClick={() => setFormData({...formData, surgeries: formData.surgeries.filter((_, i) => i !== idx)})} className="text-red-500 font-bold">×</button></span>
                  ))}
                </div>
              </div>

              {/* Insurance */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Insurance</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={newInsurance} onChange={(e) => setNewInsurance(e.target.value)} onKeyDown={(e) => {if (e.key === 'Enter') {e.preventDefault(); addInsurance();}}} placeholder="e.g., Ayushman Bharat" className="flex-1 px-4 py-2 border border-gray-300 rounded-lg" />
                  <button type="button" onClick={addInsurance} className="px-4 py-2 bg-purple-600 text-white rounded-lg font-bold"><FaPlus /></button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.insuranceAccepted?.map((insurance, idx) => (
                    <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center gap-2">{insurance} <button type="button" onClick={() => setFormData({...formData, insuranceAccepted: formData.insuranceAccepted.filter((_, i) => i !== idx)})} className="text-red-500 font-bold">×</button></span>
                  ))}
                </div>
              </div>

              <div className="mt-4 border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Number of Beds</label>
                <input type="number" value={formData.numberOfBeds || ''} onChange={(e) => setFormData({ ...formData, numberOfBeds: parseInt(e.target.value) || 0 })} min="0" className="w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            {/* Owner Block */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <label className="flex items-center gap-3 cursor-pointer mb-4">
                <input type="checkbox" checked={createOwner} onChange={(e) => setCreateOwner(e.target.checked)} className="w-5 h-5 text-blue-600 rounded" />
                <span className="font-bold text-gray-800 text-lg">Register Owner (Optional)</span>
              </label>

              {createOwner && (
                <div className="space-y-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name *</label>
                      <input type="text" value={ownerData.name} onChange={(e) => setOwnerData({ ...ownerData, name: e.target.value })} required={createOwner} className="w-full px-4 py-2 border rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Owner Email *</label>
                      <input type="email" value={ownerData.email} onChange={(e) => setOwnerData({ ...ownerData, email: e.target.value })} required={createOwner} className="w-full px-4 py-2 border rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                      <input type="password" value={ownerData.password} onChange={(e) => setOwnerData({ ...ownerData, password: e.target.value })} required={createOwner} minLength={6} className="w-full px-4 py-2 border rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                      <input type="tel" value={ownerData.phone} onChange={(e) => setOwnerData({ ...ownerData, phone: e.target.value })} required={createOwner} maxLength={10} className="w-full px-4 py-2 border rounded-lg" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Nav Buttons */}
            <div className="flex gap-3 pt-4">
              <button onClick={() => setStep(1)} className="flex-1 px-6 py-4 border border-gray-300 rounded-xl font-bold hover:bg-gray-50">Back to Search</button>
              <button onClick={() => setStep(3)} className="flex-1 px-6 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700">Review & Submit ➔</button>
            </div>
          </div>
        )}

        {/* STEP 3: Review */}
        {step === 3 && (
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Review Information</h2>

            <div className="space-y-4 mb-8">
              <div className="p-5 bg-gray-50 border border-gray-200 rounded-xl">
                <p className="text-sm text-gray-500 uppercase font-semibold mb-1">Hospital Name</p>
                <p className="text-xl font-bold text-gray-900">{formData.name}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                  <p className="text-sm text-gray-500 uppercase font-semibold mb-1">Category</p>
                  <p className="font-bold text-gray-900 capitalize">{formData.category}</p>
                </div>
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                  <p className="text-sm text-gray-500 uppercase font-semibold mb-1">Type</p>
                  <p className="font-bold text-gray-900 capitalize">{formData.type}</p>
                </div>
              </div>

              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                <p className="text-sm text-gray-500 uppercase font-semibold mb-1">Address</p>
                <p className="font-medium text-gray-900">
                  {[formData.address.street, formData.address.area, formData.address.city, formData.address.state, formData.address.pincode].filter(Boolean).join(', ')}
                </p>
              </div>

              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                <p className="text-sm text-gray-500 uppercase font-semibold mb-2">Facilities & Services</p>
                <p className="text-sm text-gray-800">✅ {formData.facilities.length} Facilities added</p>
                <p className="text-sm text-gray-800">✅ {formData.tests.length} Tests, {formData.treatments.length} Treatments</p>
              </div>

              {createOwner && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-sm text-blue-800 uppercase font-bold mb-2">Owner Account Will Be Created</p>
                  <p className="text-sm text-blue-900">Name: {ownerData.name} | Email: {ownerData.email}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 px-6 py-4 border-2 border-gray-300 rounded-xl font-bold hover:bg-gray-50 text-gray-700">Back to Edit</button>
              <button onClick={handleSubmit} disabled={loading} className="flex-[2] px-6 py-4 bg-green-600 text-white rounded-xl font-bold text-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg">
                {loading ? <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div> : '✅ Create Hospital Now'}
              </button>
            </div>
          </div>
        )}

      </div>
      <Footer />
    </div>
  );
};

export default AddHospital;