import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaHospital, FaMapMarkerAlt, FaStar, FaArrowLeft, FaPlus } from 'react-icons/fa';
import axios from 'axios';
import { indianStatesAndCities, getAllStates } from '../../data/indianCities'; 
import ImageUploadManager from '../../components/ImageUploadManager'; 

const AddHospital = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Search, 2: Details, 3: Review
  const [loading, setLoading] = useState(false);
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
    category: 'private', // government, public, private, charity
    type: 'general',
    googlePlaceId: '',
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
      coordinates: [0, 0]
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
    // Services arrays
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
    emergencyAvailable: false,
    isActive: true
  });

  // Add Handlers for Services
  const addTest = () => {
    if (newTest.trim() && !formData.tests?.includes(newTest.trim())) {
      setFormData({
        ...formData,
        tests: [...(formData.tests || []), newTest.trim()]
      });
      setNewTest('');
    }
  };

  const addTreatment = () => {
    if (newTreatment.trim() && !formData.treatments?.includes(newTreatment.trim())) {
      setFormData({
        ...formData,
        treatments: [...(formData.treatments || []), newTreatment.trim()]
      });
      setNewTreatment('');
    }
  };

  const addSurgery = () => {
    if (newSurgery.trim() && !formData.surgeries?.includes(newSurgery.trim())) {
      setFormData({
        ...formData,
        surgeries: [...(formData.surgeries || []), newSurgery.trim()]
      });
      setNewSurgery('');
    }
  };

  const addInsurance = () => {
    if (newInsurance.trim() && !formData.insuranceAccepted?.includes(newInsurance.trim())) {
      setFormData({
        ...formData,
        insuranceAccepted: [...(formData.insuranceAccepted || []), newInsurance.trim()]
      });
      setNewInsurance('');
    }
  };

  // Update cities when state changes
  useEffect(() => {
    if (searchState) {
      setAvailableCities(indianStatesAndCities[searchState] || []);
      setSearchCity(''); // Reset city when state changes
    } else {
      setAvailableCities([]);
    }
  }, [searchState]);

  // Hospital categories
  const categories = [
    { value: 'government', label: '🏛️ Government' },
    { value: 'public', label: '🏥 Public' },
    { value: 'private', label: '💼 Private' },
    { value: 'charity', label: '❤️ Charity/NGO' }
  ];

  // Hospital types (16 types)
  const hospitalTypes = [
    'general', 'dental', 'eye', 'maternity', 'children', 
    'orthopedic', 'cardiac', 'cancer', 'neuro', 'ent',
    'dermatology', 'psychiatry', 'rehabilitation', 'veterinary',
    'ayurvedic', 'homeopathic'
  ];

  // Common facilities
  const commonFacilities = [
    'ICU', 'Emergency', 'Pharmacy', 'Lab', 'X-Ray', 'CT Scan', 
    'MRI', 'Ultrasound', 'ECG', 'Ambulance', 'Blood Bank', 
    'OT', 'Cafeteria', 'Parking', 'Wheelchair', 'WiFi'
  ];

  // Search Google Places
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      alert('Please enter a search query');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Build search query with city
      const fullQuery = searchCity 
         ? `${searchQuery} ${searchCity}` 
         : searchQuery;

      console.log('🔍 Searching:', fullQuery);

      const response = await axios.post(
        'http://localhost:3000/api/admin/search-places',
        { 
           query: fullQuery, 
           type: 'hospital'
        },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
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

  // Fetch place details
  const handleSelectPlace = async (place) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await axios.post(
        'http://localhost:3000/api/admin/fetch-place-details',
        { placeId: place.placeId },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      const placeData = response.data.data;

      setSelectedPlace(place);
      setFormData({
        ...formData,
        name: placeData.name,
        googlePlaceId: place.placeId,
        address: placeData.address,
        location: placeData.location,
        phone: placeData.phone,
        website: placeData.website,
        googleRating: placeData.googleRating,
        googleReviewCount: placeData.googleReviewCount,
        images: []  // Empty array - no Google photos
      });

      setStep(2);
    } catch (error) {
      console.error('Fetch details error:', error);
      alert('Failed to fetch place details');
    } finally {
      setLoading(false);
    }
  };

  // Toggle facility
  const toggleFacility = (facility) => {
    if (formData.facilities.includes(facility)) {
      setFormData({
        ...formData,
        facilities: formData.facilities.filter(f => f !== facility)
      });
    } else {
      setFormData({
        ...formData,
        facilities: [...formData.facilities, facility]
      });
    }
  };

  // Submit hospital
  const handleSubmit = async () => {
    if (!formData.name || !formData.type) {
      alert('❌ Hospital name and type are required!');
      return;
    }
  
    // Validate owner data if creating owner
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
      
      console.log('📤 Submitting hospital:', formData);
  
      // Prepare payload
      const payload = {
        hospitalData: formData,
        createOwner: createOwner,
        ownerData: createOwner ? ownerData : null
      };
  
      const response = await axios.post(
        'http://localhost:3000/api/admin/create-hospital-with-owner',
        payload,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
  
      console.log('✅ Response:', response.data);
  
      if (response.data.success) {
        if (createOwner) {
          alert(`✅ Hospital and Owner created successfully!\n\nOwner Login:\nEmail: ${ownerData.email}\nPassword: ${ownerData.password}`);
        } else {
          alert('✅ Hospital added successfully!');
        }
        navigate('/admin/hospitals');
      }
    } catch (error) {
      console.error('❌ Submit error:', error);
      console.error('❌ Error response:', error.response?.data);
      
      const errorMessage = error.response?.data?.message || 'Failed to add hospital. Please try again.';
      alert(`❌ ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => step === 1 ? navigate('/admin/hospitals') : setStep(step - 1)}
            className="p-2 rounded-lg hover:bg-gray-200"
          >
            <FaArrowLeft className="text-xl" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add New Hospital</h1>
            <p className="text-gray-600">Search and import from Google Places</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              1
            </div>
            <span className="ml-2 font-medium">Search</span>
          </div>
          <div className={`w-16 h-1 mx-4 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              2
            </div>
            <span className="ml-2 font-medium">Details</span>
          </div>
          <div className={`w-16 h-1 mx-4 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              3
            </div>
            <span className="ml-2 font-medium">Review</span>
          </div>
        </div>

        {/* STEP 1: Search */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              <FaSearch className="inline mr-2" />
              Search Hospital on Google Places
            </h2>
            
            {/* State and City Selectors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* State Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State (Optional)
                </label>
                <select
                  value={searchState}
                  onChange={(e) => setSearchState(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All States</option>
                  {getAllStates().map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              {/* City Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City (Optional)
                </label>
                <select
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  disabled={!searchState}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="">All Cities</option>
                  {availableCities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              💡 Select state and city to see results from that location first
            </p>

            {/* Search Input */}
            <div className="flex gap-3 mb-6">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search for hospital (e.g., 'Apollo Hospital')"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-bold text-gray-700">Search Results:</h3>
                {searchResults.map((place) => (
                  <div
                    key={place.placeId}
                    onClick={() => handleSelectPlace(place)}
                    className="p-4 border border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900">{place.name}</h4>
                        <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                          <FaMapMarkerAlt className="text-gray-400" />
                          {place.address}
                        </p>
                        {place.rating > 0 && (
                          <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                            <FaStar className="text-yellow-500" />
                            {place.rating} ({place.totalRatings} reviews)
                          </p>
                        )}
                      </div>
                      <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold hover:bg-blue-200">
                        Select
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
          <div className="bg-white rounded-2xl shadow-md p-6 space-y-6">
            
            <h2 className="text-xl font-bold text-gray-800 border-b pb-3">Hospital Details</h2>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setFormData({ ...formData, category: cat.value })}
                    className={`p-3 rounded-xl border-2 transition ${
                      formData.category === cat.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <p className="font-bold text-sm">{cat.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hospital Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 capitalize"
              >
                {hospitalTypes.map(type => (
                  <option key={type} value={type} className="capitalize">{type}</option>
                ))}
              </select>
            </div>

            {/* Name (pre-filled from Google) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hospital Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                placeholder="Brief description of the hospital..."
              />
            </div>

            {/* Contact Info & Established Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {/* Established Date Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Established Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.establishedDate}
                  onChange={(e) => setFormData({ ...formData, establishedDate: e.target.value })}
                  max={new Date().toISOString().split('T')[0]} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">When was this hospital established?</p>
              </div>
            </div>

            {/* Facilities */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Facilities
              </label>
              
              {/* Common Facilities */}
              <div className="grid grid-cols-3 md:grid-cols-4 gap-2 mb-3">
                {commonFacilities.map(facility => (
                  <button
                    key={facility}
                    type="button"
                    onClick={() => toggleFacility(facility)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      formData.facilities.includes(facility)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {facility}
                  </button>
                ))}
              </div>

              {/* Custom Facility Input */}
              <div className="border-t pt-3 mt-3">
                <p className="text-sm font-medium text-gray-700 mb-2">Add Custom Facility:</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customFacility}
                    onChange={(e) => setCustomFacility(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (customFacility.trim() && !formData.facilities.includes(customFacility.trim())) {
                          setFormData({
                            ...formData,
                            facilities: [...formData.facilities, customFacility.trim()]
                          });
                          setCustomFacility('');
                        }
                      }
                    }}
                    placeholder="Type facility name and press Enter"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customFacility.trim() && !formData.facilities.includes(customFacility.trim())) {
                        setFormData({
                          ...formData,
                          facilities: [...formData.facilities, customFacility.trim()]
                        });
                        setCustomFacility('');
                      }
                    }}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Selected Facilities Display */}
              {formData.facilities.length > 0 && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-blue-900 mb-2">
                    Selected Facilities ({formData.facilities.length}):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {formData.facilities.map((facility) => (
                      <span
                        key={facility}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-medium"
                      >
                        {facility}
                        <button
                          type="button"
                          onClick={() => toggleFacility(facility)}
                          className="hover:bg-blue-600 rounded-full p-1"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ==================== SERVICES SECTION (OPTIONAL) ==================== */}
            <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Services (Optional)</h3>
              <p className="text-sm text-gray-600 mb-6">Add services now or later from dashboard</p>

              {/* Tests */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tests Available
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newTest}
                    onChange={(e) => setNewTest(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTest();
                      }
                    }}
                    placeholder="e.g., Blood Test, X-Ray"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={addTest}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
                  >
                    <FaPlus />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tests?.map((test, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-2">
                      {test}
                      <button
                        type="button"
                        onClick={() => setFormData({
                          ...formData,
                          tests: formData.tests.filter((_, i) => i !== idx)
                        })}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Treatments */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Treatments Available
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newTreatment}
                    onChange={(e) => setNewTreatment(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTreatment();
                      }
                    }}
                    placeholder="e.g., Diabetes Management"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={addTreatment}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700"
                  >
                    <FaPlus />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.treatments?.map((treatment, idx) => (
                    <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center gap-2">
                      {treatment}
                      <button
                        type="button"
                        onClick={() => setFormData({
                          ...formData,
                          treatments: formData.treatments.filter((_, i) => i !== idx)
                        })}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Surgeries */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Surgeries Available
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newSurgery}
                    onChange={(e) => setNewSurgery(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSurgery();
                      }
                    }}
                    placeholder="e.g., Cardiac Surgery"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={addSurgery}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700"
                  >
                    <FaPlus />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.surgeries?.map((surgery, idx) => (
                    <span key={idx} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm flex items-center gap-2">
                      {surgery}
                      <button
                        type="button"
                        onClick={() => setFormData({
                          ...formData,
                          surgeries: formData.surgeries.filter((_, i) => i !== idx)
                        })}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Insurance */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Insurance Accepted
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newInsurance}
                    onChange={(e) => setNewInsurance(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addInsurance();
                      }
                    }}
                    placeholder="e.g., Ayushman Bharat, Star Health"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={addInsurance}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700"
                  >
                    <FaPlus />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.insuranceAccepted?.map((insurance, idx) => (
                    <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center gap-2">
                      {insurance}
                      <button
                        type="button"
                        onClick={() => setFormData({
                          ...formData,
                          insuranceAccepted: formData.insuranceAccepted.filter((_, i) => i !== idx)
                        })}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Number of Beds */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Beds
                </label>
                <input
                  type="number"
                  value={formData.numberOfBeds || ''}
                  onChange={(e) => setFormData({ ...formData, numberOfBeds: parseInt(e.target.value) || 0 })}
                  min="0"
                  placeholder="Total beds available"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Image Upload (Manual ONLY, Maximum 6) */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                Upload Photos (Maximum 6)
              </h3>
              <ImageUploadManager
                images={formData.images || []}
                onImagesChange={(newImages) => {
                  console.log('📸 Images updated:', newImages);
                  setFormData({ ...formData, images: newImages });
                }}
                maxImages={6}
                facilityId={null}
                facilityType="hospital"
              />
            </div>

            {/* Emergency */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="emergency"
                checked={formData.emergencyAvailable}
                onChange={(e) => setFormData({ ...formData, emergencyAvailable: e.target.checked })}
                className="w-5 h-5 text-blue-600"
              />
              <label htmlFor="emergency" className="font-medium text-gray-700">
                Emergency Services Available 24/7
              </label>
            </div>

            {/* Owner Registration (Optional) */}
            <div className="border-t pt-4">
              <div className="flex items-center gap-3 mb-4">
                <input
                  type="checkbox"
                  id="createOwner"
                  checked={createOwner}
                  onChange={(e) => setCreateOwner(e.target.checked)}
                  className="w-5 h-5 text-blue-600"
                />
                <label htmlFor="createOwner" className="font-bold text-gray-800">
                  Register Owner for this Hospital (Optional)
                </label>
              </div>

              {createOwner && (
                <div className="space-y-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-sm text-blue-800 mb-3">
                    <strong>Note:</strong> Create an owner account who can manage this hospital. 
                    They will be able to update facility details, manage appointments, and respond to reviews.
                  </p>
                  
                  {/* Owner Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Owner Name *
                    </label>
                    <input
                      type="text"
                      value={ownerData.name}
                      onChange={(e) => setOwnerData({ ...ownerData, name: e.target.value })}
                      required={createOwner}
                      placeholder="Full name of the owner"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Owner Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Owner Email *
                    </label>
                    <input
                      type="email"
                      value={ownerData.email}
                      onChange={(e) => setOwnerData({ ...ownerData, email: e.target.value })}
                      required={createOwner}
                      placeholder="owner@example.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">This will be used to login</p>
                  </div>

                  {/* Owner Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password *
                    </label>
                    <input
                      type="password"
                      value={ownerData.password}
                      onChange={(e) => setOwnerData({ ...ownerData, password: e.target.value })}
                      required={createOwner}
                      minLength={6}
                      placeholder="Minimum 6 characters"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Owner Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Number *
                    </label>
                    <input
                      type="tel"
                      value={ownerData.phone}
                      onChange={(e) => setOwnerData({ ...ownerData, phone: e.target.value })}
                      required={createOwner}
                      maxLength={10}
                      placeholder="10-digit phone number"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-xs text-yellow-800">
                      ⚠️ <strong>Important:</strong> Owner will be able to login immediately and manage this hospital. 
                      Make sure the email and phone number are correct.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={() => setStep(1)}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-xl font-bold hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700"
              >
                Review & Submit
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Review */}
        {step === 3 && (
          <div className="bg-white rounded-2xl shadow-md p-6">
            
            <h2 className="text-xl font-bold text-gray-800 mb-4">Review & Confirm</h2>

            <div className="space-y-4 mb-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 uppercase font-semibold mb-1">Name</p>
                <p className="font-bold text-gray-900">{formData.name}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 uppercase font-semibold mb-1">Category</p>
                  <p className="font-bold text-gray-900 capitalize">{formData.category}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 uppercase font-semibold mb-1">Type</p>
                  <p className="font-bold text-gray-900 capitalize">{formData.type}</p>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 uppercase font-semibold mb-1">Address</p>
                <p className="font-medium text-gray-900">
                  {formData.address.street}, {formData.address.area}, {formData.address.city}, {formData.address.state} - {formData.address.pincode}
                </p>
              </div>

              {/* Show Established Date in Review if exists */}
              {formData.establishedDate && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 uppercase font-semibold mb-1">Established Date</p>
                  <p className="font-medium text-gray-900">{formData.establishedDate}</p>
                </div>
              )}

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 uppercase font-semibold mb-1">Google Rating</p>
                <p className="font-bold text-gray-900">
                  <FaStar className="inline text-yellow-500" /> {formData.googleRating} ({formData.googleReviewCount} reviews)
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 uppercase font-semibold mb-1">Facilities ({formData.facilities.length})</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.facilities.map(f => (
                    <span key={f} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              {/* Added Review block for Services */}
              {(formData.tests?.length > 0 || formData.treatments?.length > 0 || formData.surgeries?.length > 0 || formData.insuranceAccepted?.length > 0) && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 uppercase font-semibold mb-2">Services Added</p>
                  <div className="space-y-2">
                    {formData.tests?.length > 0 && <p className="text-sm"><strong>Tests:</strong> {formData.tests.length} added</p>}
                    {formData.treatments?.length > 0 && <p className="text-sm"><strong>Treatments:</strong> {formData.treatments.length} added</p>}
                    {formData.surgeries?.length > 0 && <p className="text-sm"><strong>Surgeries:</strong> {formData.surgeries.length} added</p>}
                    {formData.insuranceAccepted?.length > 0 && <p className="text-sm"><strong>Insurance:</strong> {formData.insuranceAccepted.length} accepted</p>}
                  </div>
                </div>
              )}

              {/* Show owner info if created */}
              {createOwner && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800 uppercase font-semibold mb-2">Owner Account Will Be Created</p>
                  <div className="grid grid-cols-2 gap-2 text-sm text-yellow-900">
                    <p><span className="font-bold">Name:</span> {ownerData.name}</p>
                    <p><span className="font-bold">Email:</span> {ownerData.email}</p>
                    <p><span className="font-bold">Phone:</span> {ownerData.phone}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={() => setStep(2)}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-xl font-bold hover:bg-gray-50"
              >
                Back to Edit
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Submitting...' : '✅ Add Hospital'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AddHospital;