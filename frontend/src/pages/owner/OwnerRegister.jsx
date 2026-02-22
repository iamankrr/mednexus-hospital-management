import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHospital, FaFlask, FaPhone, FaEnvelope } from 'react-icons/fa';
// ✅ Importing your centralized API instead of direct axios
import { hospitalAPI, labAPI, ownerAPI } from '../../services/api';
import axios from 'axios'; // We keep this only if we absolutely need a direct call, but we'll try to use api.js

const OwnerRegister = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [facilities, setFacilities] = useState([]);
  
  const [formData, setFormData] = useState({
    facilityType: 'hospital',
    facilityId: '',
    phone: '',
    email: '',
    businessLicense: '',
    registrationNumber: ''
  });

  useEffect(() => {
    checkExistingOwner();
  }, []);

  useEffect(() => {
    if (step === 2) {
      fetchAvailableFacilities();
    }
  }, [step, formData.facilityType]);

  const checkExistingOwner = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // ✅ Uses direct api since `userAPI.me()` isn't in api.js currently
      const res = await axios.get('http://localhost:3000/api/users/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.data.data.role === 'owner' && res.data.data.ownerProfile?.facilityId) {
        alert('You are already registered as an owner!');
        navigate('/owner/dashboard');
      }
    } catch (error) {
      console.error('Check owner error:', error);
    }
  };

  const fetchAvailableFacilities = async () => {
    try {
      setLoading(true);
      
      // ✅ Using centralized API methods to fetch facilities
      const apiMethod = formData.facilityType === 'hospital' 
        ? hospitalAPI.getAll({ limit: 1000 }) 
        : labAPI.getAll({ limit: 1000 });

      const res = await apiMethod;
      
      // Filter: Only show facilities WITHOUT an owner AND that are Verified/Approved
      const available = (res.data.data || []).filter(f => !f.owner);
      
      console.log('Available facilities:', available);
      setFacilities(available);
    } catch (error) {
      console.error('Fetch facilities error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.facilityId) {
      alert('Please select a facility');
      return;
    }

    if (!formData.phone || !formData.email) {
      alert('Phone and email are required');
      return;
    }

    try {
      setLoading(true);

      // ✅ Using centralized API method for owner registration
      const response = await ownerAPI.register(formData);

      if (response.data.success) {
        alert('✅ Owner registration successful! Please wait for admin approval.');
        
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // ✅ Trigger navbar refresh so role change is reflected
        window.dispatchEvent(new Event('storage'));
        
        navigate('/owner/dashboard');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        
        <div className="bg-white rounded-2xl shadow-lg p-8">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Register as Owner</h1>
            <p className="text-gray-600">Manage your hospital or laboratory</p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                1
              </div>
              <span className="ml-2 font-medium">Type</span>
            </div>
            <div className={`w-16 h-1 mx-4 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                2
              </div>
              <span className="ml-2 font-medium">Select</span>
            </div>
            <div className={`w-16 h-1 mx-4 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                3
              </div>
              <span className="ml-2 font-medium">Details</span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>

            {/* Step 1: Choose Type */}
            {step === 1 && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">Select Facility Type</h2>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, facilityType: 'hospital' })}
                    className={`p-6 border-2 rounded-xl transition ${
                      formData.facilityType === 'hospital'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <FaHospital className="text-4xl mx-auto mb-2 text-blue-600" />
                    <p className="font-bold text-gray-800">Hospital</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, facilityType: 'laboratory' })}
                    className={`p-6 border-2 rounded-xl transition ${
                      formData.facilityType === 'laboratory'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <FaFlask className="text-4xl mx-auto mb-2 text-blue-600" />
                    <p className="font-bold text-gray-800">Laboratory</p>
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full mt-6 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700"
                >
                  Next
                </button>
              </div>
            )}

            {/* Step 2: Select Facility */}
            {step === 2 && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Select Your {formData.facilityType === 'hospital' ? 'Hospital' : 'Laboratory'}
                </h2>
                
                {loading ? (
                  <div className="text-center py-8">Loading facilities...</div>
                ) : facilities.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No available {formData.facilityType}s without owner.</p>
                    <p className="text-sm mt-2">All facilities are already claimed or you need to contact admin.</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                    {facilities.map((facility) => (
                      <button
                        key={facility._id}
                        type="button"
                        onClick={() => setFormData({ ...formData, facilityId: facility._id })}
                        className={`w-full p-4 border-2 rounded-xl text-left transition ${
                          formData.facilityId === facility._id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <p className="font-bold text-gray-800">{facility.name}</p>
                        <p className="text-sm text-gray-600">{facility.address?.city}, {facility.address?.state}</p>
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 px-6 py-3 border border-gray-300 rounded-xl font-bold hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => formData.facilityId && setStep(3)}
                    disabled={!formData.facilityId}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Contact Details */}
            {step === 3 && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">Contact Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FaPhone className="inline mr-2" />
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="9876543210"
                      required
                      maxLength={10}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FaEnvelope className="inline mr-2" />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="owner@example.com"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business License Number (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.businessLicense}
                      onChange={(e) => setFormData({ ...formData, businessLicense: e.target.value })}
                      placeholder="License number"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Registration Number (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.registrationNumber}
                      onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                      placeholder="Registration number"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex-1 px-6 py-3 border border-gray-300 rounded-xl font-bold hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Submitting...' : 'Submit Registration'}
                  </button>
                </div>
              </div>
            )}

          </form>

        </div>

      </div>
    </div>
  );
};

export default OwnerRegister;