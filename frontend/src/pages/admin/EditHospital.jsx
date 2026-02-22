import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { hospitalAPI } from '../../services/api';
import ServiceManager from '../../components/ServiceManager';
import ThemeColorPicker from '../../components/ThemeColorPicker';
import ImageUploadManager from '../../components/ImageUploadManager';
import CityStateSelector from '../../components/CityStateSelector';
import { FaSave, FaArrowLeft, FaTrash } from 'react-icons/fa';
import { HOSPITAL_TYPES } from '../../components/HospitalTypeFilter';

const EditHospital = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    type: 'general',
    description: '',
    phone: '',
    email: '',
    website: '',
    themeColor: '#1E40AF',
    googlePlaceId: '',
    establishedDate: '', 
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
      monday: '9:00 AM - 5:00 PM',
      tuesday: '9:00 AM - 5:00 PM',
      wednesday: '9:00 AM - 5:00 PM',
      thursday: '9:00 AM - 5:00 PM',
      friday: '9:00 AM - 5:00 PM',
      saturday: '9:00 AM - 2:00 PM',
      sunday: 'Closed'
    },
    emergencyAvailable: false,
    images: [],
    services: []
  });

  const [newFacility, setNewFacility] = useState(''); 

  useEffect(() => {
    fetchHospital();
  }, [id]);

  const fetchHospital = async () => {
    try {
      const res = await hospitalAPI.getById(id);
      const hospital = res.data.data;
      
      setFormData({
        name: hospital.name || '',
        type: hospital.type || 'general',
        description: hospital.description || '',
        phone: hospital.phone || '',
        email: hospital.email || '',
        website: hospital.website || '',
        themeColor: hospital.themeColor || '#1E40AF',
        googlePlaceId: hospital.googlePlaceId || '',
        establishedDate: hospital.establishedDate || '', 
        address: {
          street: hospital.address?.street || '',
          area: hospital.address?.area || '',
          city: hospital.address?.city || '',
          state: hospital.address?.state || '',
          pincode: hospital.address?.pincode || '',
          landmark: hospital.address?.landmark || ''
        },
        facilities: hospital.facilities || [],
        operatingHours: hospital.operatingHours || {},
        emergencyAvailable: hospital.emergencyAvailable || false,
        images: hospital.images || [],
        services: hospital.services || []
      });
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to load hospital');
    } finally {
      setLoading(false);
    }
  };

  // ✅ UPDATED handleSave with Proper Validation
  const handleSave = async () => {
    // Basic fields validation
    if (!formData.name || !formData.type) {
      alert('Name and Type are required!');
      return;
    }

    // ✅ Added strict validation for required Address fields to prevent backend crash
    if (!formData.address?.city || !formData.address?.state || !formData.address?.pincode) {
      alert('City, State, and PIN Code are required fields!');
      return;
    }

    console.log('💾 Saving hospital:', id);
    console.log('📦 Form data being sent:', formData);
    console.log('🖼️ Images array length:', formData.images?.length);

    try {
      setSaving(true);
      
      // ✅ Ensure the exact payload structure is sent
      const payload = {
        ...formData,
        address: {
          ...formData.address,
          city: formData.address.city.trim(),
          state: formData.address.state.trim(),
          pincode: formData.address.pincode.trim()
        }
      };

      const response = await hospitalAPI.update(id, payload);
      
      console.log('✅ Save response:', response.data);
      alert('✅ Hospital updated successfully!');
      
      navigate('/admin/hospitals');
    } catch (error) {
      console.error('❌ Save error:', error);
      console.error('❌ Error response:', error.response?.data);
      alert(error.response?.data?.message || 'Failed to save changes. Please check required fields.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this hospital? This cannot be undone!')) return;

    try {
      await hospitalAPI.delete(id);
      alert('✅ Hospital deleted');
      navigate('/admin/hospitals');
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete hospital');
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/admin/hospitals')}
              className="text-gray-600 hover:text-blue-600"
            >
              <FaArrowLeft className="text-xl" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Hospital</h1>
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
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50"
            >
              <FaSave />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Warning */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-red-800">
            ⚠️ <strong>Admin Note:</strong> You cannot edit Google Ratings or Reviews. 
            Those are read-only and synced from Google Maps API.
          </p>
        </div>

        <div className="space-y-6">

          {/* Basic Info */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">📝 Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hospital Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Apollo Hospitals"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type *
                </label>
                <select
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {HOSPITAL_TYPES.filter(t => t.value !== 'all').map(type => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="+91 98765 43210"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="info@hospital.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <input
                  type="text"
                  value={formData.website}
                  onChange={e => setFormData({...formData, website: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="https://hospital.com"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Google Place ID (Optional)
                </label>
                <input
                  type="text"
                  value={formData.googlePlaceId}
                  onChange={e => setFormData({...formData, googlePlaceId: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="ChIJ..."
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description of the hospital..."
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">📍 Address</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <CityStateSelector
                  selectedState={formData.address.state}
                  selectedCity={formData.address.city}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">PIN Code *</label>
                <input
                  type="text"
                  value={formData.address.pincode}
                  maxLength={6}
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
            <h2 className="text-xl font-bold text-gray-800 mb-4">🎨 Theme Color</h2>
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
              onImagesChange={(newImages) => {
                console.log('📸 New images set in form:', newImages);
                setFormData({ ...formData, images: newImages });
              }}
              maxImages={10}
              facilityId={id}
              facilityType="hospital"
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
                placeholder="Add facility (e.g., ICU, OT, MRI)"
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
                    className="text-red-500 hover:text-red-700 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 9:00 AM - 5:00 PM or Closed"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Toggle */}
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

          {/* Service Manager */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">💰 Services & Price List</h2>
            <ServiceManager
              facilityId={id}
              facilityType="hospital"
              initialServices={formData.services}
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
            Delete Hospital
          </button>
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

export default EditHospital;