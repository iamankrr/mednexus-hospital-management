import React, { useState } from 'react';
import { FaTimes, FaUser, FaEnvelope, FaPhone, FaLock } from 'react-icons/fa';
import axios from 'axios';

const AssignOwnerModal = ({ facility, facilityType, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [ownerData, setOwnerData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!ownerData.name || !ownerData.email || !ownerData.password || !ownerData.phone) {
      alert('❌ Please fill all fields!');
      return;
    }

    if (ownerData.phone.length !== 10) {
      alert('❌ Phone number must be 10 digits!');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await axios.post(
        'http://localhost:3000/api/admin/assign-owner',
        {
          facilityId: facility._id,
          facilityType,
          ownerData
        },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        alert(`✅ Owner assigned successfully!\n\nLogin Details:\nEmail: ${ownerData.email}\nPassword: ${ownerData.password}`);
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Assign owner error:', error);
      alert(error.response?.data?.message || 'Failed to assign owner');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-800 text-white p-6 rounded-t-2xl flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Assign Owner</h2>
            <p className="text-green-100 text-sm">Create owner account for this facility</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-green-700 rounded-full transition"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Facility Info */}
        <div className="p-6 bg-blue-50 border-b">
          <h3 className="font-bold text-gray-900 text-lg mb-2">Facility Details</h3>
          <p className="text-gray-700">{facility.name}</p>
          <p className="text-sm text-gray-600">
            {facility.address?.city}, {facility.address?.state}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              <strong>⚠️ Note:</strong> This will create a new owner account who can manage this facility. 
              Make sure the email and phone number are correct.
            </p>
          </div>

          {/* Owner Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaUser className="inline mr-2" />
              Owner Name *
            </label>
            <input
              type="text"
              value={ownerData.name}
              onChange={(e) => setOwnerData({ ...ownerData, name: e.target.value })}
              required
              placeholder="Full name of the owner"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Owner Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaEnvelope className="inline mr-2" />
              Email Address *
            </label>
            <input
              type="email"
              value={ownerData.email}
              onChange={(e) => setOwnerData({ ...ownerData, email: e.target.value })}
              required
              placeholder="owner@example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
            />
            <p className="text-xs text-gray-500 mt-1">This will be used for login</p>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaLock className="inline mr-2" />
              Password *
            </label>
            <input
              type="password"
              value={ownerData.password}
              onChange={(e) => setOwnerData({ ...ownerData, password: e.target.value })}
              required
              minLength={6}
              placeholder="Minimum 6 characters"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaPhone className="inline mr-2" />
              Contact Number *
            </label>
            <input
              type="tel"
              value={ownerData.phone}
              onChange={(e) => setOwnerData({ ...ownerData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
              required
              maxLength={10}
              placeholder="10-digit phone number"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-xl font-bold hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Assigning...' : '✅ Assign Owner'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default AssignOwnerModal;