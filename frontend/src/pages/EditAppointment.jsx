import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaCalendarAlt, FaClock } from 'react-icons/fa';
import axios from 'axios';
import API_URL from '../config/api';

const EditAppointment = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  
  const [formData, setFormData] = useState({
    patientName: '',
    patientAge: '',
    patientGender: '',
    phone: '',
    appointmentDate: '',
    appointmentTime: '',
    reason: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch initial data from state or API
  useEffect(() => {
    if (location.state?.appointment) {
      const apt = location.state.appointment;
      setFormData({
        patientName: apt.patientName,
        patientAge: apt.patientAge,
        patientGender: apt.patientGender,
        phone: apt.phone,
        appointmentDate: new Date(apt.appointmentDate).toISOString().split('T')[0],
        appointmentTime: apt.appointmentTime,
        reason: apt.reason
      });
    } else {
      // If no state passed, redirect back
      navigate('/appointments');
    }
  }, [location, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/appointments/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('Appointment updated successfully!');
      navigate('/appointments');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update appointment');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Edit Appointment</h2>
          <button onClick={() => navigate('/appointments')} className="text-blue-100 hover:text-white">
            <FaArrowLeft /> Back
          </button>
        </div>

        <div className="p-6">
          {error && <div className="mb-4 bg-red-50 text-red-600 p-3 rounded">{error}</div>}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name</label>
                <input required type="text" name="patientName" value={formData.patientName} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                  <input required type="number" name="patientAge" value={formData.patientAge} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select required name="patientGender" value={formData.patientGender} onChange={handleChange} className="w-full border rounded-lg px-3 py-2">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><FaCalendarAlt/> Date</label>
                <input required type="date" name="appointmentDate" value={formData.appointmentDate} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" min={new Date().toISOString().split('T')[0]} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><FaClock/> Time</label>
                <input required type="time" name="appointmentTime" value={formData.appointmentTime} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Visit</label>
              <textarea required name="reason" value={formData.reason} onChange={handleChange} rows="3" className="w-full border rounded-lg px-3 py-2"></textarea>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400">
              {loading ? 'Saving Changes...' : 'Save Appointment Details'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditAppointment;