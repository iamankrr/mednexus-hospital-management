import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft, FaHospital, FaPlus, FaCheck, FaTimes } from 'react-icons/fa';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import API_URL from '../../config/api';

const ManageHospitals = () => {
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await axios.get(`${API_URL}/api/hospitals`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      console.log('✅ Hospitals loaded:', response.data.data.length);
      setHospitals(response.data.data || []);
    } catch (error) {
      console.error('❌ Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAppointments = async (hospitalId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.put(
        `${API_URL}/api/hospitals/${hospitalId}`,
        { appointmentsEnabled: !currentStatus },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      // Update local state
      setHospitals(prev => 
        prev.map(h => 
          h._id === hospitalId 
            ? { ...h, appointmentsEnabled: !currentStatus }
            : h
        )
      );

      alert(`✅ Appointments ${!currentStatus ? 'enabled' : 'disabled'}`);
      
    } catch (error) {
      console.error('❌ Toggle error:', error);
      alert('Failed to toggle appointments');
    }
  };

  const handleDelete = async (hospitalId) => {
    if (!window.confirm('Are you sure you want to delete this hospital?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      await axios.delete(`${API_URL}/api/hospitals/${hospitalId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      alert('✅ Hospital deleted successfully');
      fetchHospitals();
    } catch (error) {
      console.error('❌ Delete error:', error);
      alert('Failed to delete hospital');
    }
  };

  const filteredHospitals = hospitals.filter(h => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return h.status === 'pending';
    if (activeTab === 'approved') return h.status === 'approved';
    return true;
  });

  const counts = {
    all: hospitals.length,
    pending: hospitals.filter(h => h.status === 'pending').length,
    approved: hospitals.filter(h => h.status === 'approved').length
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
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center gap-2 text-white/90 hover:text-white mb-6 transition"
          >
            <FaArrowLeft /> Back to Dashboard
          </button>

          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <FaHospital className="text-4xl" />
                <h1 className="text-4xl font-bold">Manage Hospitals</h1>
              </div>
              <p className="text-blue-100">View, approve, and manage all hospitals</p>
            </div>

            <button
              onClick={() => navigate('/admin/hospitals/add')}
              className="flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition"
            >
              <FaPlus /> Add Hospital
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-3 rounded-xl font-bold transition ${
              activeTab === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            All Hospitals ({counts.all})
          </button>

          <button
            onClick={() => setActiveTab('pending')}
            className={`px-6 py-3 rounded-xl font-bold transition ${
              activeTab === 'pending'
                ? 'bg-yellow-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Pending Approval ({counts.pending})
          </button>

          <button
            onClick={() => setActiveTab('approved')}
            className={`px-6 py-3 rounded-xl font-bold transition ${
              activeTab === 'approved'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Approved ({counts.approved})
          </button>
        </div>

        {/* Hospital List */}
        <div className="space-y-4">
          {filteredHospitals.map(hospital => (
            <div key={hospital._id} className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-start justify-between">
                {/* Hospital Info */}
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">{hospital.name}</h3>
                  <p className="text-gray-600 mb-3">
                    {hospital.address?.area}, {hospital.address?.city}, {hospital.address?.state}
                  </p>
                  
                  <div className="flex gap-2 flex-wrap">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {hospital.type}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                      {hospital.category}
                    </span>
                    {hospital.owner && (
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                        Owner: {hospital.owner.name}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 flex-wrap">
                  {/* Appointment Toggle */}
                  <button
                    onClick={() => handleToggleAppointments(hospital._id, hospital.appointmentsEnabled)}
                    className={`px-4 py-2 rounded-lg font-bold transition flex items-center gap-2 ${
                      hospital.appointmentsEnabled
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-400 text-white hover:bg-gray-500'
                    }`}
                  >
                    {hospital.appointmentsEnabled ? <FaCheck /> : <FaTimes />}
                    {hospital.appointmentsEnabled ? 'Appointments ON' : 'Appointments OFF'}
                  </button>

                  {/* View */}
                  <button
                    onClick={() => navigate(`/hospital/${hospital._id}`)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                  >
                    View
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => navigate(`/admin/hospitals/edit/${hospital._id}`)}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                  >
                    Edit
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(hospital._id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredHospitals.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No hospitals found</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ManageHospitals;