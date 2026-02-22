import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHospital, FaCalendarAlt, FaStar, FaEdit, FaArrowRight, FaClipboardList } from 'react-icons/fa'; // ✅ Added FaClipboardList
import axios from 'axios';

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [facility, setFacility] = useState(null);
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    totalAppointments: 0,
    totalServices: 0
  });

  useEffect(() => {
    fetchOwnerData();
  }, []);

  const fetchOwnerData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Get current user
      const userRes = await axios.get('http://localhost:3000/api/users/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const userData = userRes.data.data;

      if (userData.role !== 'owner') {
        alert('Owner access required');
        navigate('/');
        return;
      }

      setUser(userData);

      // If owner has facility, fetch it
      if (userData.ownerProfile?.facilityId) {
        const facilityType = userData.ownerProfile.facilityType;
        const facilityId = userData.ownerProfile.facilityId;
        
        const endpoint = facilityType === 'hospital' 
          ? `http://localhost:3000/api/hospitals/${facilityId}`
          : `http://localhost:3000/api/labs/${facilityId}`;

        const facilityRes = await axios.get(endpoint);
        const facilityData = facilityRes.data.data;
        
        setFacility(facilityData);

        // Calculate stats
        setStats({
          totalReviews: facilityData.totalReviews || 0,
          averageRating: facilityData.websiteRating || 0,
          totalAppointments: 0, // You can fetch from appointments API
          totalServices: facilityData.services?.length || 0
        });
      }

    } catch (error) {
      console.error('Error fetching owner data:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  if (!user?.ownerProfile?.facilityId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <FaHospital className="text-6xl text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Facility Assigned</h2>
          <p className="text-gray-600 mb-6">
            You are registered as an owner but no facility has been assigned to you yet.
            Please contact admin or register your facility.
          </p>
          <button
            onClick={() => navigate('/owner/register')}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700"
          >
            Register Facility
          </button>
        </div>
      </div>
    );
  }

  const facilityType = user.ownerProfile.facilityType === 'hospital' ? 'Hospital' : 'Laboratory';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Owner Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user.name}!</p>
        </div>

        {/* Facility Info Card */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8 border-l-4" style={{ borderColor: facility?.themeColor || '#1E40AF' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl"
                style={{ backgroundColor: facility?.themeColor || '#1E40AF' }}
              >
                {facilityType === 'Hospital' ? '🏥' : '🔬'}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{facility?.name}</h2>
                <p className="text-gray-600">{facilityType} • {facility?.address?.city}, {facility?.address?.state}</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/owner/facility')}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700"
            >
              <FaEdit /> Manage Facility
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          
          {/* Total Reviews */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center justify-between mb-3">
              <FaStar className="text-3xl text-yellow-400" />
              <span className="text-xs text-gray-500 uppercase font-semibold">Reviews</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalReviews}</p>
            <p className="text-sm text-gray-500 mt-1">Total Reviews</p>
          </div>

          {/* Average Rating */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center justify-between mb-3">
              <FaStar className="text-3xl text-green-500" />
              <span className="text-xs text-gray-500 uppercase font-semibold">Rating</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}</p>
            <p className="text-sm text-gray-500 mt-1">Average Rating</p>
          </div>

          {/* Services */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="text-3xl">💰</div>
              <span className="text-xs text-gray-500 uppercase font-semibold">Services</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalServices}</p>
            <p className="text-sm text-gray-500 mt-1">Listed Services</p>
          </div>

          {/* Appointments */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center justify-between mb-3">
              <FaCalendarAlt className="text-3xl text-blue-500" />
              <span className="text-xs text-gray-500 uppercase font-semibold">Bookings</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalAppointments}</p>
            <p className="text-sm text-gray-500 mt-1">Total Appointments</p>
          </div>

        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6"> {/* ✅ Changed from grid-cols-2 to grid-cols-3 to fit the new card */}
          
          {/* Manage Facility */}
          <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition cursor-pointer" onClick={() => navigate('/owner/facility')}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Manage {facilityType}</h3>
                <p className="text-gray-600 text-sm">
                  Update information, photos, services, and pricing
                </p>
              </div>
              <FaArrowRight className="text-2xl text-blue-500" />
            </div>
          </div>

          {/* View Appointments */}
          <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition cursor-pointer" onClick={() => navigate('/owner/appointments')}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">View Appointments</h3>
                <p className="text-gray-600 text-sm">
                  Manage and track patient bookings
                </p>
              </div>
              <FaArrowRight className="text-2xl text-blue-500" />
            </div>
          </div>

          {/* ✅ New Manage Services Card */}
          <div 
            onClick={() => navigate('/owner/manage-services')}
            className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Manage Services</h3>
                <p className="text-gray-600 text-sm">Add doctors, tests, treatments & more</p>
              </div>
              <FaClipboardList className="text-4xl text-purple-500" />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default OwnerDashboard;