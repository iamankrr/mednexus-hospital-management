import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaClock, FaUser, FaPhone, FaCheckCircle, FaTimesCircle, FaEnvelope, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import API_URL from '../../config/api';

const OwnerAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, confirmed, cancelled

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      const userRes = await axios.get(`${API_URL}/api/users/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const facilityId = userRes.data.data.ownerProfile?.facilityId;
      if (!facilityId) {
        alert('No facility assigned');
        return;
      }

      const response = await axios.get(`${API_URL}/api/appointments/facility/${facilityId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setAppointments(response.data.data || []);
    } catch (error) {
      console.error('Fetch appointments error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    let cancellationReason = '';

    if (newStatus === 'cancelled') {
      cancellationReason = window.prompt("Please enter a reason for declining this appointment:");
      
      if (cancellationReason === null) return; 
      
      if (cancellationReason.trim() === '') {
        alert('A reason is required to decline an appointment.');
        return;
      }
    }

    try {
      const token = localStorage.getItem('token');
      const payload = { status: newStatus };
      
      if (newStatus === 'cancelled') {
        payload.cancellationReason = cancellationReason;
      }

      await axios.put(
        `${API_URL}/api/appointments/${id}`,
        payload,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      alert(`✅ Appointment ${newStatus}`);
      fetchAppointments();
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update appointment');
    }
  };

  const handleDeleteAppointment = async (id) => {
    if (!window.confirm("Are you sure you want to completely delete this appointment? This action cannot be undone.")) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/appointments/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      alert('🗑️ Appointment deleted successfully!');
      fetchAppointments();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete appointment');
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

  const now = new Date().getTime();
  const fortyEightHoursMs = 48 * 60 * 60 * 1000;

  const activeAppointments = appointments.filter(apt => {
    // Keep pending forever until action is taken
    if (apt.status === 'pending') return true;

    const aptDate = new Date(apt.appointmentDate).getTime();
    const actionDate = apt.updatedAt ? new Date(apt.updatedAt).getTime() : aptDate;
    
    // Choose whichever date is in the future.
    const baseDate = Math.max(aptDate, actionDate);

    if (now > baseDate + fortyEightHoursMs) {
      return false; // Remove
    }
    
    return true; 
  });

  const filteredAppointments = activeAppointments.filter(apt => {
    if (filter === 'all') return true;
    return apt.status === filter;
  });

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
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Appointments</h1>
          <p className="text-gray-600">Review and manage patient appointment requests</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200 overflow-x-auto whitespace-nowrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-3 font-semibold transition ${
              filter === 'all' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'
            }`}
          >
            All ({activeAppointments.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-6 py-3 font-semibold transition ${
              filter === 'pending' ? 'text-yellow-600 border-b-2 border-yellow-600' : 'text-gray-600'
            }`}
          >
            Pending ({activeAppointments.filter(a => a.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('confirmed')}
            className={`px-6 py-3 font-semibold transition ${
              filter === 'confirmed' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-600'
            }`}
          >
            Confirmed ({activeAppointments.filter(a => a.status === 'confirmed').length})
          </button>
          <button
            onClick={() => setFilter('cancelled')}
            className={`px-6 py-3 font-semibold transition ${
              filter === 'cancelled' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-600'
            }`}
          >
            Cancelled ({activeAppointments.filter(a => a.status === 'cancelled').length})
          </button>
        </div>

        {/* Appointments List */}
        {filteredAppointments.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl">
            <FaCalendarAlt className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No appointments in this category</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => (
              <div key={appointment._id} className="bg-white rounded-2xl shadow-md p-6 border border-gray-200">
                <div className="flex items-start justify-between">
                  
                  {/* Appointment Details */}
                  <div className="flex-1">
                    
                    {/* Status Badge */}
                    <div className="mb-3">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(appointment.status)}`}>
                        {appointment.status.toUpperCase()}
                      </span>
                    </div>

                    {/* Patient Info Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Patient Name</p>
                        <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                          <FaUser className="text-blue-500" />
                          {appointment.patientName}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Age / Gender</p>
                        <p className="text-sm font-medium text-gray-900">
                          {appointment.patientAge} yrs / {appointment.patientGender}
                        </p>
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
                    </div>

                    {/* Contact Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Phone</p>
                        <a 
                          href={`tel:${appointment.phone}`}
                          className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <FaPhone /> {appointment.phone}
                        </a>
                      </div>
                      {appointment.email && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Email</p>
                          <a 
                            href={`mailto:${appointment.email}`}
                            className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <FaEnvelope /> {appointment.email}
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Reason */}
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 mb-3">
                      <p className="text-xs text-blue-700 uppercase font-semibold mb-1">Reason for Visit</p>
                      <p className="text-sm text-gray-900">{appointment.reason}</p>
                    </div>

                    {/* Notes */}
                    {appointment.notes && (
                      <div className="p-3 bg-gray-50 rounded-lg mb-3">
                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Additional Notes</p>
                        <p className="text-sm text-gray-900">{appointment.notes}</p>
                      </div>
                    )}

                    {/* NEW: Display Cancellation Reason */}
                    {appointment.status === 'cancelled' && appointment.cancellationReason && (
                      <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                        <p className="text-xs text-red-700 uppercase font-semibold mb-1">Reason for Decline</p>
                        <p className="text-sm text-gray-900">{appointment.cancellationReason}</p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 ml-4">
                    {appointment.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(appointment._id, 'confirmed')}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition whitespace-nowrap"
                        >
                          <FaCheckCircle /> Confirm
                        </button>
                        <button
                          onClick={() => handleStatusChange(appointment._id, 'cancelled')}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition whitespace-nowrap"
                        >
                          <FaTimesCircle /> Decline
                        </button>
                      </>
                    )}

                    {appointment.status === 'confirmed' && (
                      <button
                        onClick={() => handleStatusChange(appointment._id, 'completed')}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 transition whitespace-nowrap"
                      >
                        Mark Complete
                      </button>
                    )}

                    {appointment.status !== 'pending' && (
                      <button
                        onClick={() => handleDeleteAppointment(appointment._id)}
                        className="flex items-center justify-center gap-2 px-4 py-2 mt-2 bg-gray-500 text-white rounded-lg font-bold hover:bg-gray-600 transition whitespace-nowrap"
                      >
                        <FaTrash /> Delete
                      </button>
                    )}
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default OwnerAppointments;