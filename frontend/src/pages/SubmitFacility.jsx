import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHospital, FaFlask, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';
import { indianStatesAndCities, getAllStates } from '../data/indianCities';
import axios from 'axios';

const SubmitFacility = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [availableCities, setAvailableCities] = useState([]);
  
  const [formData, setFormData] = useState({
    facilityType: 'hospital',
    name: '',
    address: {
      street: '',
      area: '',
      city: '',
      state: '',
      pincode: '',
      landmark: ''
    },
    phone: '',
    email: '',
    additionalInfo: ''
  });

  // Update cities when state changes
  React.useEffect(() => {
    if (formData.address.state) {
      setAvailableCities(indianStatesAndCities[formData.address.state] || []);
    } else {
      setAvailableCities([]);
    }
  }, [formData.address.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to submit a facility');
      navigate('/login');
      return;
    }

    if (!formData.name || !formData.address.street || !formData.address.city || !formData.address.state) {
      alert('❌ Please fill all required fields');
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        'http://localhost:3000/api/submissions',
        formData,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        alert('✅ Facility submitted successfully!\n\nYour submission is now pending admin review. You will be notified once it is approved.');
        navigate('/my-submissions');
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert(error.response?.data?.message || 'Failed to submit facility');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Submit a Facility</h1>
          <p className="text-gray-600">Help us grow our database by adding hospitals and laboratories</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-6 space-y-6">
          
          {/* Facility Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Facility Type *</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, facilityType: 'hospital' })}
                className={`p-4 border-2 rounded-xl transition ${
                  formData.facilityType === 'hospital'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <FaHospital className="text-3xl mx-auto mb-2 text-blue-600" />
                <p className="font-bold">Hospital</p>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, facilityType: 'laboratory' })}
                className={`p-4 border-2 rounded-xl transition ${
                  formData.facilityType === 'laboratory'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <FaFlask className="text-3xl mx-auto mb-2 text-purple-600" />
                <p className="font-bold">Laboratory</p>
              </button>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Facility Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="Enter full name of the facility"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Address Section */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              <FaMapMarkerAlt className="inline mr-2" />
              Address Details
            </h3>

            <div className="space-y-4">
              {/* Street */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Street Address *</label>
                <input
                  type="text"
                  value={formData.address.street}
                  onChange={(e) => setFormData({ ...formData, address: { ...formData.address, street: e.target.value } })}
                  required
                  placeholder="Building number, street name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Area/Locality</label>
                <input
                  type="text"
                  value={formData.address.area}
                  onChange={(e) => setFormData({ ...formData, address: { ...formData.address, area: e.target.value } })}
                  placeholder="Sector, locality, neighborhood"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* State & City */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                  <select
                    value={formData.address.state}
                    onChange={(e) => setFormData({ ...formData, address: { ...formData.address, state: e.target.value, city: '' } })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select State</option>
                    {getAllStates().map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                  <select
                    value={formData.address.city}
                    onChange={(e) => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })}
                    required
                    disabled={!formData.address.state}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    <option value="">Select City</option>
                    {availableCities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pincode & Landmark */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">PIN Code</label>
                  <input
                    type="text"
                    value={formData.address.pincode}
                    onChange={(e) => setFormData({ ...formData, address: { ...formData.address, pincode: e.target.value } })}
                    maxLength={6}
                    placeholder="6-digit PIN code"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Landmark</label>
                  <input
                    type="text"
                    value={formData.address.landmark}
                    onChange={(e) => setFormData({ ...formData, address: { ...formData.address, landmark: e.target.value } })}
                    placeholder="Nearby landmark"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Contact Information (Optional)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaPhone className="inline mr-2" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  maxLength={10}
                  placeholder="10-digit phone number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaEnvelope className="inline mr-2" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Information (Optional)
            </label>
            <textarea
              value={formData.additionalInfo}
              onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
              rows={3}
              placeholder="Any additional details about the facility..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Info Box */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>📌 Note:</strong> Your submission will be reviewed by our admin team. 
              Once approved, the facility will be added to our database with complete details.
              You can track the status of your submission in "My Submissions" page.
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-xl font-bold hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : '✅ Submit for Review'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default SubmitFacility;