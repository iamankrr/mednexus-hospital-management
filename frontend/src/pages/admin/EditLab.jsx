import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { labAPI } from '../../services/api';  
import ServiceManager from '../../components/ServiceManager';
import ThemeColorPicker from '../../components/ThemeColorPicker';
import ImageUploadManager from '../../components/ImageUploadManager';
import CityStateSelector from '../../components/CityStateSelector';
import { FaSave, FaArrowLeft, FaTrash, FaFlask, FaSync } from 'react-icons/fa'; 
import axios from 'axios'; // ✅ ADDED AXIOS FOR SYNC FEATURE

const EditLab = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [syncing, setSyncing] = useState(false); // ✅ SYNC STATE
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    phone: '',
    email: '',
    website: '',
    themeColor: '#10B981', 
    googlePlaceId: '',
    googleRating: 0,       // ✅ ADDED
    googleReviewCount: 0,  // ✅ ADDED
    establishedDate: '', 
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
    facilities: [],
    testCategories: [],
    operatingHours: {
      monday: '9:00 AM - 5:00 PM',
      tuesday: '9:00 AM - 5:00 PM',
      wednesday: '9:00 AM - 5:00 PM',
      thursday: '9:00 AM - 5:00 PM',
      friday: '9:00 AM - 5:00 PM',
      saturday: '9:00 AM - 2:00 PM',
      sunday: 'Closed'
    },
    homeCollection: false,
    emergencyAvailable: false,
    images: [],
    services: [] 
  });

  const [newFacility, setNewFacility] = useState('');
  const [newTestCategory, setNewTestCategory] = useState('');

  useEffect(() => {
    fetchLab();
  }, [id]);

  const fetchLab = async () => {
    try {
      setLoading(true);
      const response = await labAPI.getById(id);
      const lab = response.data.data;
      
      setFormData({
        name: lab.name || '',
        description: lab.description || '',
        phone: lab.phone || '',
        email: lab.email || '',
        website: lab.website || '',
        themeColor: lab.themeColor || '#10B981',
        googlePlaceId: lab.googlePlaceId || '',
        googleRating: lab.googleRating || 0,             // ✅ SET RATING
        googleReviewCount: lab.googleReviewCount || 0,   // ✅ SET REVIEWS
        establishedDate: lab.establishedDate || '', 
        address: lab.address || {},
        location: lab.location || { type: 'Point', coordinates: [0, 0] },
        facilities: lab.facilities || [],
        testCategories: lab.testCategories || [],
        operatingHours: lab.operatingHours || {},
        homeCollection: lab.homeCollection || false,
        emergencyAvailable: lab.emergencyAvailable || false,
        images: lab.images || [],
        services: lab.services || []
      });
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load laboratory details');
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW FUNCTION: SYNC GOOGLE RATINGS MANUALLY
  const handleSyncGoogle = async () => {
    if (!formData.googlePlaceId) {
      alert("Please enter a Google Place ID first.");
      return;
    }
    
    setSyncing(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:3000/api/admin/fetch-place-details',
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

  const handleSave = async () => {
    if (!formData.name) {
      alert('Lab name is required!');
      return;
    }

    try {
      setSaving(true);
      await labAPI.update(id, formData);
      alert('✅ Laboratory updated successfully!');
      navigate('/admin/labs');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this laboratory? This cannot be undone!')) return;

    try {
      await labAPI.delete(id);
      alert('✅ Laboratory deleted');
      navigate('/admin/labs');
    } catch (error) {
      alert('Failed to delete laboratory');
    }
  };

  const handleAddToArray = (field, item, setNewItemState) => {
    if (item.trim() && !formData[field].includes(item.trim())) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], item.trim()]
      }));
      setNewItemState('');
    }
  };

  const handleRemoveFromArray = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/admin/labs')}
            className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600"
          >
            Back to Laboratories
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/admin/labs')}
              className="text-gray-600 hover:text-green-600"
            >
              <FaArrowLeft className="text-xl" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Laboratory</h1>
              <p className="text-gray-500">{formData.name}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition"
            >
              <FaTrash />
              Delete
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition disabled:opacity-50"
            >
              <FaSave />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Warning Note */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-red-800">
            ⚠️ <strong>Admin Note:</strong> To update Google Ratings, paste the Place ID and click the Sync button below.
          </p>
        </div>

        <div className="space-y-6">

          {/* Basic Info */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">📝 Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Laboratory Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <input
                  type="text"
                  value={formData.website}
                  onChange={e => setFormData({...formData, website: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Established Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.establishedDate ? new Date(formData.establishedDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => setFormData({ ...formData, establishedDate: e.target.value })}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* ✅ NEW: GOOGLE PLACE ID WITH SYNC BUTTON FOR LABS */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Google Place ID (Optional)
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={formData.googlePlaceId}
                    onChange={e => setFormData({...formData, googlePlaceId: e.target.value})}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="ChIJ..."
                  />
                  <button
                    type="button"
                    onClick={handleSyncGoogle}
                    disabled={syncing || !formData.googlePlaceId}
                    className="px-6 py-2 bg-green-100 text-green-700 font-bold rounded-lg hover:bg-green-200 transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <FaSync className={syncing ? "animate-spin" : ""} />
                    {syncing ? 'Fetching...' : 'Sync Ratings'}
                  </button>
                </div>
                {formData.googleReviewCount > 0 && (
                  <p className="text-sm text-green-600 mt-2 font-semibold">
                    ⭐ Synced Data: {formData.googleRating} Rating ({formData.googleReviewCount} Reviews)
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>

          {/* Address using CityStateSelector */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">📍 Address</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <CityStateSelector
                  selectedState={formData.address?.state || ''}
                  selectedCity={formData.address?.city || ''}
                  onStateChange={(val) => setFormData({
                    ...formData,
                    address: {...formData.address, state: val}
                  })}
                  onCityChange={(val) => setFormData({
                    ...formData,
                    address: {...formData.address, city: val}
                  })}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                <input
                  type="text"
                  value={formData.address?.street || ''}
                  onChange={e => setFormData({
                    ...formData,
                    address: {...formData.address, street: e.target.value}
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Area</label>
                <input
                  type="text"
                  value={formData.address?.area || ''}
                  onChange={e => setFormData({
                    ...formData,
                    address: {...formData.address, area: e.target.value}
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PIN Code</label>
                <input
                  type="text"
                  value={formData.address?.pincode || ''}
                  maxLength={6}
                  onChange={e => setFormData({
                    ...formData,
                    address: {...formData.address, pincode: e.target.value}
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
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

          {/* Images Upload */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">📸 Photos</h2>
            <ImageUploadManager
              images={formData.images || []}
              onImagesChange={(newImages) => {
                setFormData({ ...formData, images: newImages });
              }}
              maxImages={10}
              facilityId={id}
              facilityType="laboratory" 
            />
          </div>

          {/* Facilities and Categories */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">🏥 Facilities & Test Categories</h2>
            
            {/* Facilities */}
            <div className="mb-6 border-b pb-6">
              <h3 className="font-semibold mb-2">Facilities</h3>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newFacility}
                  onChange={e => setNewFacility(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddToArray('facilities', newFacility, setNewFacility)}
                  placeholder="e.g., Home Collection"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
                <button
                  onClick={() => handleAddToArray('facilities', newFacility, setNewFacility)}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.facilities.map((fac, i) => (
                  <span key={i} className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-200">
                    {fac}
                    <button onClick={() => handleRemoveFromArray('facilities', i)} className="text-red-500 hover:text-red-700 font-bold">×</button>
                  </span>
                ))}
              </div>
            </div>

            {/* Test Categories */}
            <div>
              <h3 className="font-semibold mb-2">Test Categories</h3>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newTestCategory}
                  onChange={e => setNewTestCategory(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddToArray('testCategories', newTestCategory, setNewTestCategory)}
                  placeholder="e.g., Blood Test"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
                <button
                  onClick={() => handleAddToArray('testCategories', newTestCategory, setNewTestCategory)}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.testCategories.map((cat, i) => (
                  <span key={i} className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200">
                    {cat}
                    <button onClick={() => handleRemoveFromArray('testCategories', i)} className="text-red-500 hover:text-red-700 font-bold">×</button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Working Hours */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">🕐 Working Hours</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].map(day => (
                <div key={day}>
                  <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                    {day}
                  </label>
                  <input
                    type="text"
                    value={formData.operatingHours[day] || ''}
                    onChange={e => setFormData({
                      ...formData,
                      operatingHours: {...formData.operatingHours, [day]: e.target.value}
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Quick Toggles */}
          <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.homeCollection}
                onChange={e => setFormData({...formData, homeCollection: e.target.checked})}
                className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <span className="font-medium text-gray-700">🏠 Home Sample Collection Available</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.emergencyAvailable}
                onChange={e => setFormData({...formData, emergencyAvailable: e.target.checked})}
                className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <span className="font-medium text-gray-700">🚨 24/7 Emergency Services Available</span>
            </label>
          </div>

          {/* Service Manager for Tests/Prices */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">🧪 Tests & Price List</h2>
            <ServiceManager
              facilityId={id}
              facilityType="laboratory"
              initialServices={formData.services || []}
              onUpdate={(services) => setFormData({...formData, services})}
            />
          </div>

        </div>

        {/* Bottom Actions */}
        <div className="mt-8 flex justify-between">
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-8 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition shadow-lg"
          >
            <FaTrash />
            Delete Laboratory
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition disabled:opacity-50 shadow-lg"
          >
            <FaSave />
            {saving ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default EditLab;