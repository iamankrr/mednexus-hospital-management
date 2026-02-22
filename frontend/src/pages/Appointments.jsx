import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaClock, FaHospital, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import axios from 'axios';

const Appointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

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
      
      console.log('📋 Fetching user appointments...');
      const response = await axios.get('http://localhost:3000/api/appointments/my-appointments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('✅ Appointments response:', response.data);
      setAppointments(response.data.data || []);
    } catch (error) {
      console.error('❌ Fetch appointments error:', error);
      console.error('❌ Error response:', error.response?.data);
      
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3000/api/appointments/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      alert('✅ Appointment cancelled');
      fetchAppointments();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to cancel appointment');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
            <p className="text-gray-600">Manage your upcoming and past appointments</p>
          </div>
        </div>

        {/* Appointments List */}
        {appointments.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl">
            <FaCalendarAlt className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-4">No appointments yet</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700"
            >
              Browse Hospitals & Labs
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div key={appointment._id} className="bg-white rounded-2xl shadow-md p-6 border border-gray-200">
                <div className="flex items-start justify-between">
                  
                  {/* Appointment Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <FaHospital className="text-2xl text-blue-500" />
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {appointment.facility?.name || 'Facility'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {appointment.facility?.address?.city}, {appointment.facility?.address?.state}
                        </p>
                      </div>
                    </div>

                    {/* Patient Details */}
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

                    {/* Reason */}
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Reason</p>
                      <p className="text-sm text-gray-900">{appointment.reason}</p>
                    </div>
                  </div>

                  {/* Actions - Only for pending/confirmed */}
                  {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
                    <div className="flex flex-col gap-2 ml-4">
                      <button
                        onClick={() => navigate(`/appointments/edit/${appointment._id}`, { state: { appointment } })}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 transition"
                      >
                        <FaEdit /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(appointment._id)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition"
                      >
                        <FaTrash /> Cancel
                      </button>
                    </div>
                  )}

                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default Appointments;