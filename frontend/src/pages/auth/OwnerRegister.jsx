import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FaHospital, FaFlask } from 'react-icons/fa';

const OwnerRegister = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [facilityType, setFacilityType] = useState('');
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    facilityId: '',
    personalDetails: {
      qualification: '',
      experience: '',
      address: ''
    },
    internalInfo: {
      businessLicense: '',
      registrationNumber: '',
      additionalInfo: ''
    }
  });

  useEffect(() => {
    if (facilityType) {
      fetchFacilities();
    }
  }, [facilityType]);

  const fetchFacilities = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:3000/api/users/facilities-without-owner/${facilityType}`
      );
      setFacilities(response.data.data);
    } catch (error) {
      console.error('Fetch facilities error:', error);
      alert('Failed to load facilities');
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

    try {
      setLoading(true);
      const response = await axios.post(
        'http://localhost:3000/api/users/register-owner',
        {
          ...formData,
          facilityType
        }
      );

      alert(response.data.message);
      navigate('/login');
    } catch (error) {
      alert(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Register as Owner</h1>
          <p className="text-gray-600 mb-8">
            Manage your hospital or laboratory with MedNexus
          </p>

          {/* Step Indicators */}
          <div className="flex items-center justify-between mb-8">
            <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}>
                1
              </div>
              <span className="ml-2 font-medium">Facility</span>
            </div>
            <div className="flex-1 h-1 mx-4 bg-gray-200"></div>
            <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}>
                2
              </div>
              <span className="ml-2 font-medium">Account</span>
            </div>
            <div className="flex-1 h-1 mx-4 bg-gray-200"></div>
            <div className={`flex items-center ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}>
                3
              </div>
              <span className="ml-2 font-medium">Details</span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Step 1: Select Facility Type */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">Select Facility Type</h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setFacilityType('hospital');
                      setStep(2);
                    }}
                    className="p-6 border-2 border-gray-300 rounded-xl hover:border-blue-600 hover:bg-blue-50 transition"
                  >
                    <FaHospital className="text-4xl text-blue-600 mx-auto mb-3" />
                    <p className="font-bold text-gray-900">Hospital</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFacilityType('laboratory');
                      setStep(2);
                    }}
                    className="p-6 border-2 border-gray-300 rounded-xl hover:border-purple-600 hover:bg-purple-50 transition"
                  >
                    <FaFlask className="text-4xl text-purple-600 mx-auto mb-3" />
                    <p className="font-bold text-gray-900">Laboratory</p>
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Select Facility & Account Details */}
            {step === 2 && (
              <div className="space-y-6">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-blue-600 hover:underline mb-4"
                >
                  ← Back
                </button>

                <h2 className="text-xl font-bold text-gray-900">
                  Select {facilityType === 'hospital' ? 'Hospital' : 'Laboratory'}
                </h2>

                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500 mx-auto"></div>
                  </div>
                ) : facilities.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-xl">
                    <p className="text-gray-500">No facilities available without owners</p>
                  </div>
                ) : (
                  <select
                    value={formData.facilityId}
                    onChange={(e) => setFormData({ ...formData, facilityId: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                  >
                    <option value="">Select a facility</option>
                    {facilities.map((facility) => (
                      <option key={facility._id} value={facility._id}>
                        {facility.name} - {facility.address?.city}
                      </option>
                    ))}
                  </select>
                )}

                <h3 className="text-lg font-bold text-gray-900 mt-8">Account Details</h3>

                <input
                  type="text"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                />

                <input
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                />

                <input
                  type="password"
                  placeholder="Password (min 6 characters)"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                />

                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                />

                <button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={!formData.facilityId || !formData.email || !formData.password}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50"
                >
                  Next: Additional Details
                </button>
              </div>
            )}

            {/* Step 3: Additional Details */}
            {step === 3 && (
              <div className="space-y-6">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-blue-600 hover:underline mb-4"
                >
                  ← Back
                </button>

                <h2 className="text-xl font-bold text-gray-900">Additional Information (Optional)</h2>

                <h3 className="text-lg font-semibold text-gray-900 mt-6">Personal Details</h3>

                <input
                  type="text"
                  placeholder="Qualification"
                  value={formData.personalDetails.qualification}
                  onChange={(e) => setFormData({
                    ...formData,
                    personalDetails: { ...formData.personalDetails, qualification: e.target.value }
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                />

                <input
                  type="text"
                  placeholder="Experience (e.g., 10 years)"
                  value={formData.personalDetails.experience}
                  onChange={(e) => setFormData({
                    ...formData,
                    personalDetails: { ...formData.personalDetails, experience: e.target.value }
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                />

                <textarea
                  placeholder="Address"
                  value={formData.personalDetails.address}
                  onChange={(e) => setFormData({
                    ...formData,
                    personalDetails: { ...formData.personalDetails, address: e.target.value }
                  })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                ></textarea>

                <h3 className="text-lg font-semibold text-gray-900 mt-6">Internal Information</h3>

                <input
                  type="text"
                  placeholder="Business License Number"
                  value={formData.internalInfo.businessLicense}
                  onChange={(e) => setFormData({
                    ...formData,
                    internalInfo: { ...formData.internalInfo, businessLicense: e.target.value }
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                />

                <input
                  type="text"
                  placeholder="Registration Number"
                  value={formData.internalInfo.registrationNumber}
                  onChange={(e) => setFormData({
                    ...formData,
                    internalInfo: { ...formData.internalInfo, registrationNumber: e.target.value }
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                />

                <textarea
                  placeholder="Additional Information"
                  value={formData.internalInfo.additionalInfo}
                  onChange={(e) => setFormData({
                    ...formData,
                    internalInfo: { ...formData.internalInfo, additionalInfo: e.target.value }
                  })}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                ></textarea>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit for Approval'}
                </button>
              </div>
            )}
          </form>

          <p className="text-sm text-gray-600 text-center mt-6">
            Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OwnerRegister;