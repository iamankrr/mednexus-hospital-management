import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import axios from 'axios';

const OwnerPending = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const res = await axios.get('http://localhost:3000/api/users/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const userData = res.data.data;
      setUser(userData);

      // If approved, redirect to dashboard
      if (userData.role === 'owner' && userData.ownerProfile?.isVerified) {
        navigate('/owner/dashboard');
      }
    } catch (error) {
      console.error('Check status error:', error);
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

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        
        {/* Status Icon */}
        <div className="text-center mb-8">
          {user?.ownerProfile?.isVerified === false ? (
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaClock className="text-4xl text-yellow-500" />
            </div>
          ) : user?.ownerProfile?.isVerified === true ? (
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCheckCircle className="text-4xl text-green-500" />
            </div>
          ) : (
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaTimesCircle className="text-4xl text-red-500" />
            </div>
          )}

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {user?.ownerProfile?.isVerified === false ? 'Approval Pending' : 
             user?.ownerProfile?.isVerified === true ? 'Approved!' : 'Status Unknown'}
          </h1>
          
          <p className="text-gray-600">
            {user?.ownerProfile?.isVerified === false
              ? 'Your owner registration is under review by our admin team.'
              : user?.ownerProfile?.isVerified === true
              ? 'Your account has been approved! You can now manage your facility.'
              : 'Please contact support for assistance.'}
          </p>
        </div>

        {/* Registration Details */}
        {user?.ownerProfile && (
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h2 className="font-bold text-gray-800 mb-4">Your Registration Details</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium text-gray-900">{user.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium text-gray-900">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phone:</span>
                <span className="font-medium text-gray-900">{user.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Facility Type:</span>
                <span className="font-medium text-gray-900 capitalize">{user.ownerProfile.facilityType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`font-bold ${
                  user.ownerProfile.isVerified === false ? 'text-yellow-600' :
                  user.ownerProfile.isVerified === true ? 'text-green-600' : 'text-red-600'
                }`}>
                  {user.ownerProfile.isVerified === false ? '⏳ Pending' :
                   user.ownerProfile.isVerified === true ? '✅ Approved' : '❌ Rejected'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => window.location.reload()}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50"
          >
            Refresh Status
          </button>
          
          {user?.ownerProfile?.isVerified === true && (
            <button
              onClick={() => navigate('/owner/dashboard')}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700"
            >
              Go to Dashboard
            </button>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            Approval usually takes 24-48 hours. You will receive an email once approved.
          </p>
        </div>

      </div>
    </div>
  );
};

export default OwnerPending;