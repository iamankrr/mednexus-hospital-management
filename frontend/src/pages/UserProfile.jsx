import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
// ✅ Added FaLock for the Change Password button, and FaSignOutAlt for Logout
import { FaUser, FaEnvelope, FaPhone, FaEdit, FaSave, FaLock, FaSignOutAlt } from 'react-icons/fa';
import Footer from '../components/Footer';
import API_URL from '../config/api'; // ✅ Added API_URL import

const UserProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // ✅ UPDATED: using API_URL, setting user data, and added logging
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get(`${API_URL}/api/users/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // ✅ Actually set the user data
      setUser(response.data.data);
      console.log('Profile loaded:', response.data.data);

      setFormData({
        name: response.data.data.name,
        phone: response.data.data.phone || ''
      });
    } catch (error) {
      console.error('Profile error:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/api/users/profile`, // ✅ Updated to use API_URL here too
        formData,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      setUser(response.data.data);
      setEditing(false);
      alert('✅ Profile updated successfully');

      // Update localStorage
      const storedUser = JSON.parse(localStorage.getItem('user'));
      localStorage.setItem('user', JSON.stringify({
        ...storedUser,
        name: response.data.data.name,
        phone: response.data.data.phone
      }));
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';  // ✅ Go to home page
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8">
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
                  <FaUser className="text-4xl text-blue-600" />
                </div>
                <div>
                  {/* ✅ Added fallbacks to header as well */}
                  <h1 className="text-3xl font-bold">{user?.name || 'Loading...'}</h1>
                  <p className="text-blue-100">{user?.email || 'Loading...'}</p>
                  <span className="inline-block mt-2 px-3 py-1 bg-blue-500 rounded-full text-sm font-semibold">
                    {user?.role === 'user' ? 'User' : user?.role === 'owner' ? 'Owner' : 'Admin'}
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="p-8">
              {editing ? (
                <form onSubmit={handleUpdate} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 flex items-center justify-center gap-2"
                    >
                      <FaSave /> Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className="flex-1 py-3 bg-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                    <FaUser className="text-xl text-blue-600 mt-1" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-700">Name</p>
                      {/* ✅ Added user?.name fallback */}
                      <p className="text-gray-900">{user?.name || 'Loading...'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                    <FaEnvelope className="text-xl text-blue-600 mt-1" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-700">Email</p>
                      {/* ✅ Added user?.email fallback */}
                      <p className="text-gray-900">{user?.email || 'Loading...'}</p>
                    </div>
                  </div>

                  {user?.phone && (
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                      <FaPhone className="text-xl text-blue-600 mt-1" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-700">Phone</p>
                        <p className="text-gray-900">{user.phone}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-4 mt-6">
                    <button
                      onClick={() => setEditing(true)}
                      className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 flex items-center justify-center gap-2 transition shadow-sm"
                    >
                      <FaEdit /> Edit Profile
                    </button>

                    <button  
                      onClick={() => navigate('/change-password')}  
                      className="flex-1 py-3 bg-yellow-600 text-white rounded-xl font-bold hover:bg-yellow-700 flex items-center justify-center gap-2 transition shadow-sm"
                    >  
                      <FaLock /> Change Password
                    </button>

                    <button  
                      onClick={handleLogout}  
                      className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 flex items-center justify-center gap-2 transition shadow-sm"
                    >  
                      <FaSignOutAlt /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default UserProfile;