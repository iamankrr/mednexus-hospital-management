import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaArrowLeft, 
  FaHospital, 
  FaPlus, 
  FaCheck, 
  FaTimes, 
  FaUser,
  FaPhone,
  FaEnvelope
} from 'react-icons/fa';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import API_URL from '../../config/api';

const ManageHospitals = () => {
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  
  // Owner Modal State
  const [ownerModal, setOwnerModal] = useState({
    isOpen: false,
    hospital: null,
    owner: null,
    availableOwners: []
  });

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

  // ✅ NEW: Open Owner Modal
  const openOwnerModal = async (hospital) => {
    try {
      const token = localStorage.getItem('token');

      // Fetch available owners
      const ownersResponse = await axios.get(`${API_URL}/api/admin/owners/available`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setOwnerModal({
        isOpen: true,
        hospital: hospital,
        owner: hospital.owner || null,
        availableOwners: ownersResponse.data.data || []
      });

    } catch (error) {
      console.error('❌ Fetch owners error:', error);
      alert('Failed to load owner information');
    }
  };

  // ✅ NEW: Assign Owner
  const handleAssignOwner = async (ownerId) => {
    try {
      const token = localStorage.getItem('token');

      await axios.put(
        `${API_URL}/api/admin/hospitals/${ownerModal.hospital._id}/assign-owner`,
        { ownerId },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      alert('✅ Owner assigned successfully');
      setOwnerModal({ ...ownerModal, isOpen: false });
      fetchHospitals();

    } catch (error) {
      console.error('❌ Assign owner error:', error);
      alert(error.response?.data?.message || 'Failed to assign owner');
    }
  };

  // ✅ NEW: Remove Owner
  const handleRemoveOwner = async () => {
    if (!window.confirm('Are you sure you want to remove this owner?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');

      await axios.put(
        `${API_URL}/api/admin/hospitals/${ownerModal.hospital._id}/remove-owner`,
        {},
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      alert('✅ Owner removed successfully');
      setOwnerModal({ ...ownerModal, isOpen: false });
      fetchHospitals();

    } catch (error) {
      console.error('❌ Remove owner error:', error);
      alert('Failed to remove owner');
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
      <Navbar />

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
                    {hospital.owner ? (
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                        Owner: {hospital.owner.name}
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                        No Owner Assigned
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 flex-wrap">
                  {/* Appointment Toggle - ONLY SHOW IF HAS OWNER */}
                  {hospital.owner ? (
                    <button
                      onClick={() => handleToggleAppointments(hospital._id, hospital.appointmentsEnabled)}
                      className={`px-4 py-2 rounded-lg font-bold transition flex items-center gap-2 ${
                        hospital.appointmentsEnabled
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-gray-400 text-white hover:bg-gray-500'
                      }`}
                      title={hospital.appointmentsEnabled ? 'Disable appointments' : 'Enable appointments'}
                    >
                      {hospital.appointmentsEnabled ? <FaCheck /> : <FaTimes />}
                      <span>Appointments {hospital.appointmentsEnabled ? 'ON' : 'OFF'}</span>
                    </button>
                  ) : (
                    <div className="px-4 py-2 bg-gray-100 text-gray-500 rounded-lg font-medium flex items-center gap-2">
                      <FaTimes />
                      <span>No Owner - Can't Enable</span>
                    </div>
                  )}

                  {/* Owner Management - NEW */}
                  <button
                    onClick={() => openOwnerModal(hospital)}
                    className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition flex items-center gap-2"
                  >
                    <FaUser />
                    {hospital.owner ? 'Manage Owner' : 'Assign Owner'}
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

      {/* Owner Management Modal */}
      {ownerModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Owner Management</h2>
                <button
                  onClick={() => setOwnerModal({ ...ownerModal, isOpen: false })}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-700 mb-2">Hospital</h3>
                <p className="text-gray-600">{ownerModal.hospital?.name}</p>
              </div>

              {/* Current Owner */}
              {ownerModal.owner ? (
                <div className="mb-6 p-4 bg-purple-50 rounded-xl border border-purple-200">
                  <h3 className="text-lg font-bold text-purple-900 mb-3 flex items-center gap-2">
                    <FaUser /> Current Owner
                  </h3>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <FaUser className="text-purple-600" />
                      <span className="font-medium">{ownerModal.owner.name}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <FaEnvelope className="text-purple-600" />
                      <span className="text-sm">{ownerModal.owner.email}</span>
                    </div>
                    
                    {ownerModal.owner.phone && (
                      <div className="flex items-center gap-2">
                        <FaPhone className="text-purple-600" />
                        <span className="text-sm">{ownerModal.owner.phone}</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleRemoveOwner}
                    className="mt-4 w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition"
                  >
                    Remove Owner
                  </button>
                </div>
              ) : (
                <div className="mb-6 p-4 bg-orange-50 rounded-xl border border-orange-200">
                  <p className="text-orange-700">No owner assigned to this hospital</p>
                </div>
              )}

              {/* Available Owners */}
              <div>
                <h3 className="text-lg font-bold text-gray-700 mb-3">
                  {ownerModal.owner ? 'Change Owner' : 'Assign Owner'}
                </h3>

                {ownerModal.availableOwners.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {ownerModal.availableOwners.map(owner => (
                      <button
                        key={owner._id}
                        onClick={() => handleAssignOwner(owner._id)}
                        className="w-full p-4 bg-gray-50 hover:bg-blue-50 rounded-xl text-left transition border border-gray-200 hover:border-blue-300"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{owner.name}</p>
                            <p className="text-sm text-gray-600">{owner.email}</p>
                            {owner.phone && (
                              <p className="text-sm text-gray-600">{owner.phone}</p>
                            )}
                          </div>
                          <FaUser className="text-blue-600" />
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No available owners found</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ManageHospitals;