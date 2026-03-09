import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaClock, FaHospital, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import API_URL from '../config/api';

const Appointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cancel Modal State
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedAptId, setSelectedAptId] = useState(null);
  const [cancelReason, setCancelReason] = useState('Found another doctor');
  const [otherReason, setOtherReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const response = await axios.get(`${API_URL}/api/appointments/my-appointments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setAppointments(response.data.data || []);
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  // Open Cancel Modal
  const handleOpenCancelModal = (id) => {
    setSelectedAptId(id);
    setCancelReason('Found another doctor');
    setOtherReason('');
    setShowCancelModal(true);
  };

  // Submit Cancellation
  const handleConfirmCancel = async () => {
    let finalReason = cancelReason === 'Other' ? otherReason : cancelReason;

    if (cancelReason === 'Other' && !otherReason.trim()) {
      alert("Please specify the reason");
      return;
    }

    setCancelling(true);
    try {
      const token = localStorage.getItem('token');
      
      // ✅ FIX: Instead of DELETE, we update status to 'cancelled' so owner can see the reason
      await axios.put(`${API_URL}/api/appointments/${selectedAptId}`, {
        status: 'cancelled',
        cancellationReason: `User Cancelled: ${finalReason}`
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      alert('✅ Appointment cancelled successfully');
      setShowCancelModal(false);
      fetchAppointments();
    } catch (error) {
      alert('Failed to cancel appointment');
    } finally {
      setCancelling(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 relative">
      <div className="max-w-6xl mx-auto px-4">
        
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
            <p className="text-gray-600">Manage your upcoming and past appointments</p>
          </div>
        </div>

        {appointments.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
            <FaCalendarAlt className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-4">No appointments yet</p>
            <button
              onClick={() => navigate('/hospitals')}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700"
            >
              Browse Hospitals & Labs
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div key={appointment._id} className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
                <div className="flex flex-col md:flex-row items-start justify-between">
                  
                  <div className="flex-1 w-full">
                    <div className="flex items-center gap-3 mb-3">
                      <FaHospital className="text-2xl text-blue-500" />
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {appointment.facility?.name || 'Facility Name'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {appointment.facility?.address?.city || ''}, {appointment.facility?.address?.state || ''}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Patient</p>
                        <p className="text-sm font-medium text-gray-900">{appointment.patientName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Date</p>
                        <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                          <FaCalendarAlt className="text-blue-500" />
                          {formatDate(appointment.appointmentDate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Time</p>
                        <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                          <FaClock className="text-blue-500" />
                          {appointment.appointmentTime}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Status</p>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(appointment.status)}`}>
                          {appointment.status === 'confirmed' && <FaCheckCircle />}
                          {appointment.status === 'cancelled' && <FaTimesCircle />}
                          {appointment.status.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Reason for visit</p>
                      <p className="text-sm text-gray-900">{appointment.reason}</p>
                    </div>

                    {appointment.status === 'cancelled' && appointment.cancellationReason && (
                      <div className="p-3 bg-red-50 rounded-lg mt-3 border border-red-100">
                        <p className="text-xs text-red-600 uppercase font-semibold mb-1">Cancellation Detail</p>
                        <p className="text-sm text-red-900">{appointment.cancellationReason}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-row md:flex-col gap-2 mt-4 md:mt-0 md:ml-4 w-full md:w-auto">
                    {appointment.status === 'pending' && (
                      <button
                        onClick={() => navigate(`/appointments/edit/${appointment._id}`, { state: { appointment } })}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 transition"
                      >
                        <FaEdit /> Edit
                      </button>
                    )}
                    
                    {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
                      <button
                        onClick={() => handleOpenCancelModal(appointment._id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition"
                      >
                        <FaTrash /> Cancel
                      </button>
                    )}
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CANCEL MODAL UI */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Cancel Appointment</h2>
              <button onClick={() => setShowCancelModal(false)} className="text-gray-500 hover:text-red-500"><FaTimes/></button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Why are you cancelling?</label>
              <select 
                value={cancelReason} 
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="Found another doctor">Found another doctor / facility</option>
                <option value="Wait time was too long">Wait time was too long</option>
                <option value="Health issue resolved">Health issue resolved</option>
                <option value="Financial reasons">Financial reasons</option>
                <option value="Other">Other...</option>
              </select>
            </div>

            {cancelReason === 'Other' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Please specify</label>
                <textarea 
                  rows="3" 
                  className="w-full border rounded-lg px-3 py-2 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={otherReason}
                  onChange={(e) => setOtherReason(e.target.value)}
                  placeholder="Type your reason here..."
                ></textarea>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-4 py-2 border text-gray-700 rounded-lg hover:bg-gray-100 font-medium"
              >
                Go Back
              </button>
              <button 
                onClick={handleConfirmCancel}
                disabled={cancelling}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50"
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Appointments;