import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, 
  FaFlask,
  FaPlus, 
  FaCheck, 
  FaTimes, 
  FaUser,
  FaPhone,
  FaEnvelope
} from 'react-icons/fa';
import axios from 'axios';
import API_URL from '../../config/api';
import toast from 'react-hot-toast';

const ManageLabs = () => {
  const navigate = useNavigate();
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  // Owner Modal State
  const [ownerModal, setOwnerModal] = useState({
    isOpen: false,
    lab: null,
    owner: null,
    mode: 'view' // 'view', 'create'
  });

  // State for new owner form
  const [newOwnerData, setNewOwnerData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });

  useEffect(() => {
    fetchLabs();
  }, []);

  const fetchLabs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Fetching all labs for admin
      const response = await axios.get(`${API_URL}/api/admin/labs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      console.log('✅ Labs loaded:', response.data.data.length);
      setLabs(response.data.data || []);
    } catch (error) {
      console.error('❌ Fetch error:', error);
      toast.error('Failed to load laboratories');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAppointments = async (labId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.put(
        `${API_URL}/api/admin/labs/${labId}/toggle-appointments`,
        { appointmentsEnabled: !currentStatus },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      setLabs(prev =>
        prev.map(l =>
          l._id === labId 
            ? { ...l, appointmentsEnabled: !currentStatus }
            : l
        )
      );

      toast.success(`Appointments ${!currentStatus ? 'enabled' : 'disabled'}`);
      
    } catch (error) {
      console.error('❌ Toggle error:', error);
      toast.error('Failed to toggle appointments');
    }
  };

  const openOwnerModal = (lab) => {
    setOwnerModal({
      isOpen: true,
      lab: lab,
      owner: lab.owner || null,
      mode: lab.owner ? 'view' : 'create' // Default to 'create' if no owner
    });
    setNewOwnerData({ name: '', email: '', phone: '', password: '' });
  };

  // ✅ CREATE NEW OWNER & ASSIGN
  const handleCreateAndAssignOwner = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      if (!newOwnerData.name || !newOwnerData.email || !newOwnerData.phone || !newOwnerData.password) {
        toast.error('Please fill all owner details');
        return;
      }

      // Use the existing admin assignment route
      await axios.post(
        `${API_URL}/api/admin/assign-owner`,
        { 
          facilityId: ownerModal.lab._id,
          facilityType: 'laboratory',
          ownerData: newOwnerData
        },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      toast.success('Owner created and assigned successfully!');
      setOwnerModal({ ...ownerModal, isOpen: false });
      fetchLabs();

    } catch (error) {
      console.error('❌ Create owner error:', error);
      toast.error(error.response?.data?.message || 'Failed to create owner');
    }
  };

  const handleRemoveOwner = async () => {
    if (!window.confirm('Are you sure you want to remove this owner?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');

      await axios.put(
        `${API_URL}/api/admin/labs/${ownerModal.lab._id}/remove-owner`,
        {},
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      toast.success('Owner removed successfully');
      setOwnerModal({ ...ownerModal, isOpen: false });
      fetchLabs();

    } catch (error) {
      console.error('❌ Remove owner error:', error);
      toast.error('Failed to remove owner');
    }
  };

  const handleDelete = async (labId) => {
    if (!window.confirm('Are you sure you want to delete this lab?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      await axios.delete(`${API_URL}/api/admin/labs/${labId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      toast.success('Lab deleted successfully');
      fetchLabs();
    } catch (error) {
      console.error('❌ Delete error:', error);
      toast.error('Failed to delete lab');
    }
  };

  // Filter logic (supports both status field and isVerified fallback)
  const filteredLabs = labs.filter(l => {
    if (activeTab === 'all') return true;
    if (l.status) {
      if (activeTab === 'pending') return l.status === 'pending';
      if (activeTab === 'approved') return l.status === 'approved';
    } else {
      if (activeTab === 'pending') return l.owner && !l.isVerified;
      if (activeTab === 'approved') return l.owner && l.isVerified;
    }
    return true;
  });

  const counts = {
    all: labs.length,
    pending: labs.filter(l => l.status ? l.status === 'pending' : (l.owner && !l.isVerified)).length,
    approved: labs.filter(l => l.status ? l.status === 'approved' : (l.owner && l.isVerified)).length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Segment */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-8 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center gap-2 text-white hover:text-blue-200 mb-4"
          >
            <FaArrowLeft /> Back to Dashboard
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <FaFlask className="text-4xl" />
                <h1 className="text-4xl font-bold">Manage Laboratories</h1>
              </div>
              <p className="text-blue-100">View, approve, and manage all laboratories</p>
            </div>
            
            <button
              onClick={() => navigate('/admin/labs/add')}
              className="flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition shadow-sm"
            >
              <FaPlus /> Add Laboratory
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        
        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200 pb-4">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-3 rounded-xl font-bold transition ${
              activeTab === 'all'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            All Laboratories ({counts.all})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-6 py-3 rounded-xl font-bold transition ${
              activeTab === 'pending'
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            Pending Approval ({counts.pending})
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`px-6 py-3 rounded-xl font-bold transition ${
              activeTab === 'approved'
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            Approved ({counts.approved})
          </button>
        </div>

        {/* Labs List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading laboratories...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredLabs.map((lab) => (
              <div key={lab._id} className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  
                  {/* Lab Info */}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">{lab.name}</h3>
                    <p className="text-gray-600 mb-3">
                      {lab.address?.area && `${lab.address?.area}, `}
                      {lab.address?.city && `${lab.address?.city}, `}
                      {lab.address?.state}
                    </p>
                    
                    <div className="flex gap-2 flex-wrap">
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        {lab.type || 'Laboratory'}
                      </span>
                      {lab.owner ? (
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                          Owner: {lab.owner.name}
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                          No Owner Assigned
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 flex-wrap justify-end">
                    
                    {/* Appointment Toggle - ONLY SHOW IF HAS OWNER */}
                    {lab.owner ? (
                      <button
                        onClick={() => handleToggleAppointments(lab._id, lab.appointmentsEnabled)}
                        className={`px-4 py-2 rounded-lg font-bold transition flex items-center gap-2 shadow-sm ${
                          lab.appointmentsEnabled
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-gray-400 text-white hover:bg-gray-500'
                        }`}
                        title={lab.appointmentsEnabled ? 'Disable appointments' : 'Enable appointments'}
                      >
                        {lab.appointmentsEnabled ? <FaCheck /> : <FaTimes />}
                        <span>Appointments {lab.appointmentsEnabled ? 'ON' : 'OFF'}</span>
                      </button>
                    ) : (
                      <div className="px-4 py-2 bg-gray-100 text-gray-500 rounded-lg font-medium flex items-center gap-2 shadow-sm">
                        <FaTimes />
                        <span>No Owner - Can't Enable</span>
                      </div>
                    )}

                    {/* Owner Management */}
                    <button
                      onClick={() => openOwnerModal(lab)}
                      className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition flex items-center gap-2 shadow-sm"
                    >
                      <FaUser />
                      {lab.owner ? 'Manage Owner' : 'Add Owner'}
                    </button>

                    {/* View */}
                    <button
                      onClick={() => navigate(`/lab/${lab._id}`)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition shadow-sm"
                    >
                      View
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => navigate(`/admin/labs/edit/${lab._id}`)}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition shadow-sm"
                    >
                      Edit
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(lab._id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition shadow-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredLabs.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
                <FaFlask className="text-6xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No laboratories found</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Owner Management Modal */}
      {ownerModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Owner Management</h2>
                <button
                  onClick={() => setOwnerModal({ ...ownerModal, isOpen: false })}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  &times;
                </button>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-700 mb-2">Laboratory</h3>
                <p className="text-gray-600">{ownerModal.lab?.name}</p>
              </div>

              {/* View Current Owner */}
              {ownerModal.mode === 'view' && ownerModal.owner && (
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
                    className="mt-4 w-full bg-red-600 text-white py-2 rounded-lg font-bold hover:bg-red-700 transition shadow-sm"
                  >
                    Remove Owner
                  </button>
                </div>
              )}

              {/* Add New Owner Form */}
              {ownerModal.mode === 'create' && (
                <div>
                  <h3 className="text-lg font-bold text-gray-700 mb-4">Add New Owner</h3>
                  <form onSubmit={handleCreateAndAssignOwner} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name</label>
                      <input 
                        type="text" 
                        required
                        className="w-full p-2 border rounded-lg"
                        placeholder="John Doe"
                        value={newOwnerData.name}
                        onChange={(e) => setNewOwnerData({...newOwnerData, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input 
                        type="email" 
                        required
                        className="w-full p-2 border rounded-lg"
                        placeholder="owner@laboratory.com"
                        value={newOwnerData.email}
                        onChange={(e) => setNewOwnerData({...newOwnerData, email: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input 
                        type="tel" 
                        required
                        className="w-full p-2 border rounded-lg"
                        placeholder="9876543210"
                        value={newOwnerData.phone}
                        onChange={(e) => setNewOwnerData({...newOwnerData, phone: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                      <input 
                        type="password" 
                        required
                        className="w-full p-2 border rounded-lg"
                        placeholder="Set owner password"
                        value={newOwnerData.password}
                        onChange={(e) => setNewOwnerData({...newOwnerData, password: e.target.value})}
                      />
                    </div>
                    
                    <button 
                      type="submit"
                      className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition mt-4"
                    >
                      Create & Assign Owner
                    </button>
                  </form>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageLabs;