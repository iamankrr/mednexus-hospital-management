import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaHospital, 
  FaFlask, 
  FaUsers, 
  FaStar, 
  FaEnvelope,
  FaArrowLeft,
  FaGoogle,
  FaClipboardCheck
} from 'react-icons/fa';
import axios from 'axios';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalHospitals: 0,
    totalLabs: 0,
    totalUsers: 0,
    totalReviews: 0,
    pendingApprovals: 0
  });
  const [loading, setLoading] = useState(true);
  const [updatingRatings, setUpdatingRatings] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.get('http://localhost:3000/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateGoogleRatings = async () => {
    if (!window.confirm('Update Google ratings for all hospitals and labs? This may take a few minutes.')) {
      return;
    }

    try {
      setUpdatingRatings(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        'http://localhost:3000/api/admin/update-google-ratings',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert(`✅ ${response.data.message}`);
        fetchStats(); // Refresh stats
      } else {
        alert(`❌ ${response.data.message}`);
      }
    } catch (error) {
      alert('Failed to update Google ratings. Check console for details.');
      console.error('Google rating update error:', error);
    } finally {
      setUpdatingRatings(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-white hover:text-blue-200 mb-4"
          >
            <FaArrowLeft /> Back to Home
          </button>
          <h1 className="text-4xl font-bold">Admin Dashboard</h1>
          <p className="text-blue-100 mt-2">Manage hospitals, labs, users, and reviews</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Stats Cards */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            
            {/* Hospitals */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-blue-100 text-sm">Total Hospitals</p>
                  <h3 className="text-4xl font-bold">{stats.totalHospitals}</h3>
                </div>
                <FaHospital className="text-5xl opacity-50" />
              </div>
              <button
                onClick={() => navigate('/admin/hospitals')}
                className="w-full bg-white text-blue-600 py-2 rounded-lg hover:bg-blue-50 transition duration-200 font-semibold"
              >
                Manage Hospitals
              </button>
            </div>

            {/* Laboratories */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-green-100 text-sm">Total Laboratories</p>
                  <h3 className="text-4xl font-bold">{stats.totalLabs}</h3>
                </div>
                <FaFlask className="text-5xl opacity-50" />
              </div>
              <button
                onClick={() => navigate('/admin/labs')}
                className="w-full bg-white text-green-600 py-2 rounded-lg hover:bg-green-50 transition duration-200 font-semibold"
              >
                Manage Labs
              </button>
            </div>

            {/* Users */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-orange-100 text-sm">Total Users</p>
                  <h3 className="text-4xl font-bold">{stats.totalUsers}</h3>
                </div>
                <FaUsers className="text-5xl opacity-50" />
              </div>
              <button
                onClick={() => navigate('/admin/users')}
                className="w-full bg-white text-orange-600 py-2 rounded-lg hover:bg-orange-50 transition duration-200 font-semibold"
              >
                Manage Users
              </button>
            </div>

            {/* Reviews */}
            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-yellow-100 text-sm">Total Reviews</p>
                  <h3 className="text-4xl font-bold">{stats.totalReviews}</h3>
                </div>
                <FaStar className="text-5xl opacity-50" />
              </div>
              <button
                onClick={() => navigate('/admin/reviews')}
                className="w-full bg-white text-yellow-600 py-2 rounded-lg hover:bg-yellow-50 transition duration-200 font-semibold"
              >
                Manage Reviews
              </button>
            </div>

            {/* Contact Requests */}
            <div className="bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-pink-100 text-sm">Pending Approvals</p>
                  <h3 className="text-4xl font-bold">{stats.pendingApprovals}</h3>
                </div>
                <FaEnvelope className="text-5xl opacity-50" />
              </div>
              <button
                onClick={() => navigate('/admin/contacts')}
                className="w-full bg-white text-pink-600 py-2 rounded-lg hover:bg-pink-50 transition duration-200 font-semibold"
              >
                View Requests
              </button>
            </div>

            {/* Google Ratings Update (With Schedule Info) */}
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold mb-1">Google Ratings</h3>
                  <p className="text-purple-100 text-sm">Auto-updates every 6 hours</p>
                  <p className="text-purple-200 text-xs mt-1">Next: 2:00 AM IST</p>
                </div>
                <FaGoogle className="text-5xl opacity-50" />
              </div>
              <div className="space-y-2">
                <button
                  onClick={handleUpdateGoogleRatings}
                  disabled={updatingRatings}
                  className={`w-full ${
                    updatingRatings 
                      ? 'bg-purple-300 cursor-not-allowed' 
                      : 'bg-white text-purple-600 hover:bg-purple-50'
                  } py-2 rounded-lg font-semibold transition duration-200`}
                >
                  {updatingRatings ? '⏳ Updating...' : '🔄 Update Now'}
                </button>
              </div>
              <p className="text-xs text-purple-100 mt-2 text-center">
                {updatingRatings ? 'Please wait...' : 'Auto-scheduled: Every 6 hours'}
              </p>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/admin/hospitals/add')}
              className="bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition duration-200 font-semibold flex items-center justify-center gap-2"
            >
              + Add Hospital
            </button>
            <button
              onClick={() => navigate('/admin/labs/add')}
              className="bg-green-500 text-white py-3 px-6 rounded-lg hover:bg-green-600 transition duration-200 font-semibold flex items-center justify-center gap-2"
            >
              + Add Laboratory
            </button>
            <button
              onClick={() => navigate('/admin/reviews')}
              className="bg-yellow-500 text-white py-3 px-6 rounded-lg hover:bg-yellow-600 transition duration-200 font-semibold flex items-center justify-center gap-2"
            >
              <FaStar /> Moderate Reviews
            </button>
            
            {/* ✅ NEW: Review User Submissions Button */}
            <button
              onClick={() => navigate('/admin/submissions')}
              className="bg-teal-500 text-white py-3 px-6 rounded-lg hover:bg-teal-600 transition duration-200 font-semibold flex items-center justify-center gap-2"
            >
              <FaClipboardCheck /> Review Submissions
            </button>
           
            {/* Owners Management - Made col-span-2 to balance the 3-column grid perfectly */}
            <div className="md:col-span-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-indigo-100 text-sm">Owner Accounts</p>
                  <h3 className="text-4xl font-bold">Manage</h3>
                </div>
                <FaUsers className="text-5xl opacity-50" />
              </div>
              <button
                onClick={() => navigate('/admin/owners')}
                className="w-full bg-white text-indigo-600 py-2 rounded-lg hover:bg-indigo-50 transition duration-200 font-semibold"
              >
                Verify Owners
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;