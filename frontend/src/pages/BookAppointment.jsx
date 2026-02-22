import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaClock, FaUser, FaPhone, FaEnvelope, FaNotesMedical } from 'react-icons/fa';
import axios from 'axios';

const BookAppointment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // State for fetched facility
  const [facility, setFacility] = useState(null);
  const [facilityType, setFacilityType] = useState(null);
  const [facilityId, setFacilityId] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);

  const [formData, setFormData] = useState({
    patientName: '',
    patientAge: '',
    patientGender: 'male',
    phone: '',
    email: '',
    appointmentDate: '',
    appointmentTime: '',
    reason: '',
    notes: ''
  });

  // ✅ FIXED: Fetch facility based on URL query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlHospitalId = params.get('hospital');
    const urlLabId = params.get('lab');

    // Also check location.state as a fallback if you still use navigate(..., {state}) somewhere else
    const stateFacility = location.state?.facility;
    const stateType = location.state?.type;

    if (urlHospitalId) {
      setFacilityType('hospital');
      setFacilityId(urlHospitalId);
      fetchFacilityDetails('hospital', urlHospitalId);
    } else if (urlLabId) {
      setFacilityType('laboratory');
      setFacilityId(urlLabId);
      fetchFacilityDetails('laboratory', urlLabId);
    } else if (stateFacility) {
      // Fallback if data was passed via state
      setFacility(stateFacility);
      setFacilityType(stateType === 'laboratory' ? 'laboratory' : 'hospital');
      setFacilityId(stateFacility._id || stateFacility.id);
      setFetchingData(false);
    } else {
      alert('No facility selected');
      navigate(-1);
    }
  }, [location, navigate]);

  const fetchFacilityDetails = async (type, id) => {
    try {
      setFetchingData(true);
      const endpoint = type === 'hospital' 
        ? `http://localhost:3000/api/hospitals/${id}`
        : `http://localhost:3000/api/labs/${id}`;
      
      const response = await axios.get(endpoint);
      setFacility(response.data.data);
    } catch (error) {
      console.error('Fetch facility error:', error);
      alert('Error fetching facility details. Please go back and try again.');
      navigate(-1);
    } finally {
      setFetchingData(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to book an appointment');
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      console.log('📅 Booking appointment for:', facility.name);

      const response = await axios.post(
        'http://localhost:3000/api/appointments',
        {
          facilityType: facilityType,
          facilityId: facilityId,
          ...formData
        },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      console.log('✅ Response:', response.data);

      if (response.data.success) {
        // ✅ Success Modal
        const confirmMessage = `✅ Appointment Booked Successfully!

Hospital/Lab: ${facility.name}
Patient: ${formData.patientName}
Date: ${new Date(formData.appointmentDate).toLocaleDateString('en-IN')}
Time: ${formData.appointmentTime}

The facility will contact you soon at:
📞 ${formData.phone}
${formData.email ? `📧 ${formData.email}` : ''}

Status: Pending Confirmation
You can view and manage your appointment in "My Appointments" section.`;
        
        alert(confirmMessage);
        
        // Redirect to My Appointments
        navigate('/appointments');
      }
    } catch (error) {
      console.error('❌ Booking error:', error);
      console.error('❌ Error response:', error.response?.data);
      
      const errorMessage = error.response?.data?.message || 'Failed to book appointment. Please try again.';
      alert(`❌ ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  if (fetchingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  if (!facility) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Book Appointment</h1>
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center text-white"
              style={{ backgroundColor: facilityType === 'laboratory' ? '#9333EA' : '#1E40AF' }}
            >
              {facilityType === 'laboratory' ? '🔬' : '🏥'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{facility.name}</h2>
              <p className="text-sm text-gray-500">
                {facility.address?.city}, {facility.address?.state}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-6 space-y-6">
          
          <h3 className="text-xl font-bold text-gray-800 border-b pb-3">Patient Information</h3>

          {/* Patient Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FaUser className="inline mr-2" />
              Patient Name *
            </label>
            <input
              type="text"
              value={formData.patientName}
              onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              placeholder="Enter patient name"
            />
          </div>

          {/* Age & Gender */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age *</label>
              <input
                type="number"
                value={formData.patientAge}
                onChange={(e) => setFormData({ ...formData, patientAge: e.target.value })}
                required
                min="1"
                max="120"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                placeholder="Age"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
              <select
                value={formData.patientGender}
                onChange={(e) => setFormData({ ...formData, patientGender: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Phone & Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FaPhone className="inline mr-2" />
                Phone Number *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                maxLength={10}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                placeholder="9876543210"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FaEnvelope className="inline mr-2" />
                Email (Optional)
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                placeholder="email@example.com"
              />
            </div>
          </div>

          <h3 className="text-xl font-bold text-gray-800 border-b pb-3 pt-4">Appointment Details</h3>

          {/* Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FaCalendarAlt className="inline mr-2" />
                Appointment Date *
              </label>
              <input
                type="date"
                value={formData.appointmentDate}
                onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                required
                min={today}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FaClock className="inline mr-2" />
                Preferred Time *
              </label>
              <input
                type="time"
                value={formData.appointmentTime}
                onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FaNotesMedical className="inline mr-2" />
              Reason for Visit *
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              required
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              placeholder="Describe your symptoms or reason for appointment"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
              placeholder="Any additional information"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 px-6 py-3 text-white rounded-xl font-bold disabled:opacity-50 transition ${
                facilityType === 'laboratory' 
                  ? 'bg-purple-600 hover:bg-purple-700' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? 'Booking...' : 'Book Appointment'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default BookAppointment;