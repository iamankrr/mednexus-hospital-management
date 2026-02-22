import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // ✅ Added axios import
import { hospitalAPI, labAPI } from '../../services/api';
import ServiceManager from '../../components/ServiceManager';
import ThemeColorPicker from '../../components/ThemeColorPicker';
import ImageUploadManager from '../../components/ImageUploadManager';
import { FaSave, FaArrowLeft } from 'react-icons/fa';

const OwnerFacility = () => {
  const navigate = useNavigate();
  const [facility, setFacility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    phone: '',
    email: '',
    website: '',
    themeColor: '#1E40AF',
    establishedDate: '', // ✅ Added establishedDate field
    address: {
      street: '',
      area: '',
      city: '',
      state: '',
      pincode: '',
      landmark: ''
    },
    facilities: [],
    operatingHours: {
      monday: '', tuesday: '', wednesday: '', thursday: '',
      friday: '', saturday: '', sunday: ''
    },
    emergencyAvailable: false,
    images: []
  });

  const [newFacility, setNewFacility] = useState('');

  useEffect(() => {
    fetchUserAndFacility();
  }, []);

  // ✅ FIXED fetchUserAndFacility Function
  const fetchUserAndFacility = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Use the correct endpoint /api/users/me using axios
      const userRes = await axios.get('http://localhost:3000/api/users/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const userData = userRes.data.data;
      
      console.log('👤 User data:', userData);
      console.log('🏥 Owner profile:', userData.ownerProfile);

      if (!userData || userData.role !== 'owner') {
        alert('Owner access required');
        navigate('/');
        return;
      }

      setUser(userData);

      // Get facility
      if (userData.ownerProfile?.facilityId) {
        const facilityType = userData.ownerProfile.facilityType;
        const facilityId = userData.ownerProfile.facilityId;
        
        console.log('📍 Fetching facility:', facilityType, facilityId);
        
        const api = facilityType === 'hospital' ? hospitalAPI : labAPI;
        const res = await api.getById(facilityId);
        const fac = res.data.data;
        
        console.log('✅ Facility loaded:', fac.name);
        
        setFacility(fac);
        setFormData({
          name: fac.name || '',
          description: fac.description || '',
          phone: fac.phone || '',
          email: fac.email || '',
          website: fac.website || '',
          themeColor: fac.themeColor || '#1E40AF',
          establishedDate: fac.establishedDate || '', // ✅ Setting initial value
          address: fac.address || {},
          facilities: fac.facilities || [],
          operatingHours: fac.operatingHours || {},
          emergencyAvailable: fac.emergencyAvailable || false,
          images: fac.images || []
        });
      }
    } catch (error) {
      console.error('❌ Error:', error);
      console.error('❌ Response:', error.response?.data);
      alert('Failed to load facility');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Use correct API based on facility type
      const api = user.ownerProfile.facilityType === 'hospital' ? hospitalAPI : labAPI;
      
      console.log('💾 Saving', user.ownerProfile.facilityType, ':', facility._id);
      console.log('📦 Data:', formData);
      
      await api.update(facility._id, formData);
      
      alert('✅ Facility updated successfully!');
      fetchUserAndFacility(); // Refresh
    } catch (error) {
      console.error('❌ Save error:', error);
      console.error('❌ Response:', error.response?.data);
      alert(error.response?.data?.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleAddFacility = () => {
    if (newFacility.trim()) {
      setFormData({
        ...formData,
        facilities: [...formData.facilities, newFacility.trim()]
      });
      setNewFacility('');
    }
  };

  const handleRemoveFacility = (index) => {
    setFormData({
      ...formData,
      facilities: formData.facilities.filter((_, i) => i !== index)
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  if (!facility) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-xl mb-4">No facility assigned</p>
          <button
            onClick={() => navigate('/owner/dashboard')}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/owner/dashboard')}
              className="text-gray-600 hover:text-blue-600"
            >
              <FaArrowLeft className="text-xl" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manage Your Facility</h1>
              <p className="text-gray-500">{facility.name}</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50"
          >
            <FaSave />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {/* Warning Banner */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-yellow-800">
            ⚠️ <strong>Note:</strong> You cannot edit Google Ratings or Reviews. 
            Those are automatically synced from Google Maps.
          </p>
        </div>

        <div className="space-y-6">

          {/* Basic Info */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">📝 Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <input
                  type="text"
                  value={formData.website}
                  onChange={e => setFormData({...formData, website: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* ✅ Established Date Field Added Here */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Established Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.establishedDate ? new Date(formData.establishedDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => setFormData({ ...formData, establishedDate: e.target.value })}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">📍 Address</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Street</label>
                <input
                  type="text"
                  value={formData.address.street}
                  onChange={e => setFormData({
                    ...formData,
                    address: {...formData.address, street: e.target.value}
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Area</label>
                <input
                  type="text"
                  value={formData.address.area}
                  onChange={e => setFormData({
                    ...formData,
                    address: {...formData.address, area: e.target.value}
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={formData.address.city}
                  onChange={e => setFormData({
                    ...formData,
                    address: {...formData.address, city: e.target.value}
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  value={formData.address.state}
                  onChange={e => setFormData({
                    ...formData,
                    address: {...formData.address, state: e.target.value}
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PIN Code</label>
                <input
                  type="text"
                  value={formData.address.pincode}
                  onChange={e => setFormData({
                    ...formData,
                    address: {...formData.address, pincode: e.target.value}
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Landmark</label>
                <input
                  type="text"
                  value={formData.address.landmark}
                  onChange={e => setFormData({
                    ...formData,
                    address: {...formData.address, landmark: e.target.value}
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Theme Color */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">🎨 Branding</h2>
            <ThemeColorPicker
              value={formData.themeColor}
              onChange={(color) => setFormData({...formData, themeColor: color})}
            />
          </div>

          {/* Images */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">📸 Photos</h2>
            <ImageUploadManager
              images={formData.images || []}
              onImagesChange={(imgs) => {
                console.log('📸 Owner facility images updated:', imgs);
                setFormData({...formData, images: imgs});
              }}
              maxImages={10}
              facilityId={facility._id}
              facilityType={user.ownerProfile.facilityType}
            />
          </div>

          {/* Facilities */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">🏥 Facilities & Amenities</h2>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newFacility}
                onChange={e => setNewFacility(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddFacility()}
                placeholder="Add facility (e.g., ICU, OT, X-Ray)"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleAddFacility}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.facilities.map((fac, i) => (
                <span
                  key={i}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200"
                >
                  {fac}
                  <button
                    onClick={() => handleRemoveFacility(i)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Emergency Toggle */}
          {user.ownerProfile.facilityType === 'hospital' && (
            <div className="bg-white rounded-2xl shadow-md p-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.emergencyAvailable}
                  onChange={e => setFormData({...formData, emergencyAvailable: e.target.checked})}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="font-medium text-gray-700">🚨 24/7 Emergency Services Available</span>
              </label>
            </div>
          )}

          {/* Service Manager */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">💰 Services & Price List</h2>
            <ServiceManager
              facilityId={facility._id}
              facilityType={user.ownerProfile.facilityType}
              initialServices={facility.services || []}
              onUpdate={(services) => setFacility({...facility, services})}
            />
          </div>

        </div>

        {/* Bottom Save Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50 shadow-lg"
          >
            <FaSave />
            {saving ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default OwnerFacility;