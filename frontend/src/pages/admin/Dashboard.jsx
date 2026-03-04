import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FaHospital,
  FaFlask,
  FaUsers,
  FaStar,
  FaEnvelope,
  FaArrowLeft,
  FaSync,
  FaGoogle
} from 'react-icons/fa';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import API_URL from '../../config/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    hospitals: 0,
    laboratories: 0,
    users: 0,
    reviews: 0,
    pendingOwners: 0
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get(`${API_URL}/api/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      console.log('✅ Stats loaded:', response.data);

      setStats(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('❌ Stats error:', error);
      setLoading(false);
      
      if (error.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  const handleUpdateRatings = async () => {
    try {
      setUpdating(true);
      const token = localStorage.getItem('token');

      await axios.post(
        `${API_URL}/api/admin/update-google-ratings`,
        {},
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      alert('✅ Google ratings updated successfully!');
      fetchStats();
    } catch (error) {
      console.error('Update error:', error);
      alert('❌ Failed to update ratings');
    } finally {
      setUpdating(false);
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
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-white/90 hover:text-white mb-6 transition"
          >
            <FaArrowLeft /> Back to Home
          </button>

          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-blue-100">
            Manage hospitals, labs, users, and reviews
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Hospitals */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-8 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-blue-100 text-sm">Total Hospitals</p>
                <h2 className="text-5xl font-bold mt-2">{stats.hospitals}</h2>
              </div>
              <FaHospital className="text-6xl text-white/30" />
            </div>
            <button
              onClick={() => navigate('/admin/hospitals')}
              className="w-full mt-6 bg-white text-blue-600 py-3 rounded-xl font-bold hover:bg-blue-50 transition"
            >
              Manage Hospitals
            </button>
          </div>

          {/* Laboratories */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-8 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-green-100 text-sm">Total Laboratories</p>
                <h2 className="text-5xl font-bold mt-2">{stats.laboratories}</h2>
              </div>
              <FaFlask className="text-6xl text-white/30" />
            </div>
            <button
              onClick={() => navigate('/admin/labs')}
              className="w-full mt-6 bg-white text-green-600 py-3 rounded-xl font-bold hover:bg-green-50 transition"
            >
              Manage Labs
            </button>
          </div>

          {/* Users */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg p-8 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-orange-100 text-sm">Total Users</p>
                <h2 className="text-5xl font-bold mt-2">{stats.users}</h2>
              </div>
              <FaUsers className="text-6xl text-white/30" />
            </div>
            <button
              onClick={() => navigate('/admin/users')}
              className="w-full mt-6 bg-white text-orange-600 py-3 rounded-xl font-bold hover:bg-orange-50 transition"
            >
              Manage Users
            </button>
          </div>

          {/* Reviews */}
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl shadow-lg p-8 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-yellow-100 text-sm">Total Reviews</p>
                <h2 className="text-5xl font-bold mt-2">{stats.reviews}</h2>
              </div>
              <FaStar className="text-6xl text-white/30" />
            </div>
            <button
              onClick={() => navigate('/admin/reviews')}
              className="w-full mt-6 bg-white text-yellow-600 py-3 rounded-xl font-bold hover:bg-yellow-50 transition"
            >
              Manage Reviews
            </button>
          </div>

          {/* Pending Approvals */}
          <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl shadow-lg p-8 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-pink-100 text-sm">Pending Approvals</p>
                <h2 className="text-5xl font-bold mt-2">{stats.pendingOwners}</h2>
              </div>
              <FaEnvelope className="text-6xl text-white/30" />
            </div>
            <button
              onClick={() => navigate('/admin/owners')}
              className="w-full mt-6 bg-white text-pink-600 py-3 rounded-xl font-bold hover:bg-pink-50 transition"
            >
              View Requests
            </button>
          </div>

          {/* Google Ratings */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-8 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-purple-100 text-sm">Google Ratings</p>
                <p className="text-lg mt-2">Auto-updates every 6 hours</p>
                <p className="text-sm text-purple-200">Next: 2:00 AM IST</p>
              </div>
              <FaGoogle className="text-6xl text-white/30" />
            </div>
            <button
              onClick={handleUpdateRatings}
              disabled={updating}
              className="w-full mt-6 bg-white text-purple-600 py-3 rounded-xl font-bold hover:bg-purple-50 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <FaSync className={updating ? 'animate-spin' : ''} />
              {updating ? 'Updating...' : 'Update Now'}
            </button>
            <p className="text-xs text-purple-200 mt-2 text-center">
              Auto-scheduled: Every 6 hours
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/admin/hospitals/add')}
              className="bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
              <FaHospital /> Add Hospital
            </button>

            <button
              onClick={() => navigate('/admin/labs/add')}
              className="bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition flex items-center justify-center gap-2"
            >
              <FaFlask /> Add Laboratory
            </button>

            <button
              onClick={() => navigate('/admin/reviews')}
              className="bg-yellow-600 text-white py-4 rounded-xl font-bold hover:bg-yellow-700 transition flex items-center justify-center gap-2"
            >
              <FaStar /> Moderate Reviews
            </button>

            <button
              onClick={() => navigate('/admin/users')}
              className="bg-orange-600 text-white py-4 rounded-xl font-bold hover:bg-orange-700 transition flex items-center justify-center gap-2"
            >
              <FaUsers /> View All Users
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;