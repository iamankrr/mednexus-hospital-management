import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaFlask, 
  FaArrowLeft,
  FaPlus,
  FaHome
} from 'react-icons/fa';
import axios from 'axios';
import { labAPI } from '../../services/api'; 
import OwnerDetailsModal from '../../components/OwnerDetailsModal'; 
import AssignOwnerModal from '../../components/AssignOwnerModal'; 

const ManageLabs = () => {
  const navigate = useNavigate();
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'pending', 'approved'

  // State for Owner Modal
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [showOwnerModal, setShowOwnerModal] = useState(false);

  // State for Assign Owner Modal
  const [showAssignOwnerModal, setShowAssignOwnerModal] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState(null);

  useEffect(() => {
    fetchLabs();
  }, []);

  const fetchLabs = async () => {
    try {
      setLoading(true);
      // Fetching without limit so admin can see all
      const response = await labAPI.getAll({ limit: 1000 });
      setLabs(response.data.data || []);
    } catch (error) {
      console.error('Error fetching laboratories:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW: Toggle Appointments Function
  const handleToggleAppointments = async (labId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.put(
        `http://localhost:3000/api/admin/labs/${labId}/toggle-appointments`,
        { appointmentsEnabled: !currentStatus },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      console.log('✅ Appointments toggled:', response.data);
      
      // Update local state
      setLabs(prev => 
        prev.map(l => 
          l._id === labId 
            ? { ...l, appointmentsEnabled: !currentStatus } 
            : l
        )
      );
      
      alert(`✅ Appointments ${!currentStatus ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('❌ Toggle error:', error);
      alert(error.response?.data?.message || '❌ Failed to toggle appointments');
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm('Approve this laboratory?')) return;
    try {
      await axios.put(
        `http://localhost:3000/api/admin/labs/${id}/approve`,
        { isApproved: true },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      alert('✅ Laboratory approved successfully!');
      fetchLabs();
    } catch (error) {
      console.error('Approve error:', error);
      alert('Failed to approve laboratory');
    }
  };

  const handleDelete = async (labId) => {
    if (!window.confirm('Are you sure you want to delete this laboratory? This action cannot be undone!')) {
      return;
    }

    try {
      await labAPI.delete(labId);
      alert('✅ Laboratory deleted successfully!');
      fetchLabs();
    } catch (err) {
      console.error('Delete error:', err);
      alert(err.response?.data?.message || 'Failed to delete laboratory');
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    const action = currentStatus ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} this laboratory?`)) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:3000/api/admin/labs/${id}/approve`,
        { isApproved: !currentStatus }, 
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      alert(`✅ Laboratory ${action}d successfully!`);
      fetchLabs();
    } catch (error) {
      console.error('Toggle error:', error);
      alert('Failed to toggle status');
    }
  };

  const handleViewOwner = async (ownerId) => {
    const idToFetch = typeof ownerId === 'object' ? ownerId._id : ownerId;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:3000/api/admin/owners/${idToFetch}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      setSelectedOwner(response.data.data);
      setShowOwnerModal(true);
    } catch (error) {
      console.error('Fetch owner error:', error);
      alert('Failed to load owner details');
    }
  };

  const handleRemoveOwner = async (labId) => {
    if (!window.confirm('Remove owner from this laboratory? The owner account will be converted to a regular user.')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:3000/api/admin/remove-owner',
        { facilityId: labId, facilityType: 'laboratory' },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      alert('✅ Owner removed successfully');
      fetchLabs();
    } catch (error) {
      console.error('Remove owner error:', error);
      alert(error.response?.data?.message || 'Failed to remove owner');
    }
  };

  const handleAssignOwner = (labId) => {
    const lab = labs.find(l => l._id === labId);
    setSelectedFacility(lab);
    setShowAssignOwnerModal(true);
  };

  const filteredLabs = labs.filter(lab => {
    if (activeTab === 'pending') {
      return lab.owner && !lab.isVerified;
    } else if (activeTab === 'approved') {
      return lab.owner && lab.isVerified;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Segment */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 text-white py-8 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center gap-2 text-white hover:text-green-200 mb-4"
          >
            <FaArrowLeft /> Back to Dashboard
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FaFlask className="text-4xl" />
              <div>
                <h1 className="text-4xl font-bold">Manage Laboratories</h1>
                <p className="text-green-100 mt-2">View, approve, and manage all laboratories</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/admin/labs/add')}
              className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-400 border border-green-400"
            >
              <FaPlus /> Add Laboratory
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        
        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === 'all'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 hover:text-green-600'
            }`}
          >
            All Labs ({labs.length})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === 'pending'
                ? 'text-orange-600 border-b-2 border-orange-600'
                : 'text-gray-600 hover:text-orange-600'
            }`}
          >
            Pending Approval ({labs.filter(l => l.owner && !l.isVerified).length})
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === 'approved'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            Approved ({labs.filter(l => l.owner && l.isVerified).length})
          </button>
        </div>

        {/* Labs List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading laboratories...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredLabs.map((lab) => (
              <div key={lab._id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  
                  {/* Left Side: Info */}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">{lab.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {lab.address?.city}, {lab.address?.state}
                    </p>
                    
                    {/* Badges */}
                    <div className="flex gap-2 mt-3 flex-wrap items-center">
                      {lab.homeCollection && (
                        <span className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                          <FaHome /> Home Collection
                        </span>
                      )}
                      
                      {lab.owner ? (
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
                          Owner: {lab.owner.name || 'User Submitted'}
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold">
                          Admin Created
                        </span>
                      )}

                      {/* Status Badge */}
                      {lab.isApproved ? (
                         <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                           ✓ Approved
                         </span>
                      ) : (
                         <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">
                           Pending
                         </span>
                      )}
                    </div>
                  </div>

                  {/* Right Side: Actions - MERGED WITH APPOINTMENT TOGGLE */}
                  <div className="flex gap-2 flex-wrap justify-end items-center">
                    
                    {/* 1. ON/OFF Toggle */}
                    <button
                      onClick={() => handleToggleActive(lab._id, lab.isActive)}
                      className={`px-4 py-2 rounded-lg font-bold ${
                        lab.isActive 
                          ? 'bg-green-600 text-white hover:bg-green-700' 
                          : 'bg-gray-400 text-white hover:bg-gray-500'
                      }`}
                    >
                      {lab.isActive ? 'ON' : 'OFF'}
                    </button>

                    {/* 2. ✅ NEW: Appointment Toggle Button */}
                    <button
                      onClick={() => handleToggleAppointments(lab._id, lab.appointmentsEnabled)}
                      className={`px-4 py-2 rounded-lg font-bold transition flex items-center gap-2 ${
                        lab.appointmentsEnabled
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-gray-400 text-white hover:bg-gray-500'
                      }`}
                      title={lab.appointmentsEnabled ? 'Click to disable appointments' : 'Click to enable appointments'}
                    >
                      {lab.appointmentsEnabled ? (
                        <>
                          <span className="text-lg">✓</span>
                          <span>Appointments ON</span>
                        </>
                      ) : (
                        <>
                          <span className="text-lg">✗</span>
                          <span>Appointments OFF</span>
                        </>
                      )}
                    </button>

                    {/* 3. Approve/Status */}
                    {lab.status === 'pending' && lab.submittedBy !== 'admin' ? (
                      <button
                        onClick={() => handleApprove(lab._id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition"
                      >
                        Approve
                      </button>
                    ) : lab.status === 'approved' ? (
                      <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium">
                        ✓ Approved
                      </span>
                    ) : (
                      <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium">
                        Admin Created
                      </span>
                    )}

                    {/* 4. View */}
                    <button
                      onClick={() => navigate(`/lab/${lab._id}`)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700"
                    >
                      View
                    </button>

                    {/* 5. Owner (View/Assign) */}
                    {lab.owner ? (
                      <button
                        onClick={() => handleViewOwner(lab.owner)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700"
                      >
                        Owner
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAssignOwner(lab._id)}
                        className="px-4 py-2 bg-pink-600 text-white rounded-lg font-bold hover:bg-pink-700"
                      >
                        Assign Owner
                      </button>
                    )}

                    {/* 6. Remove Owner */}
                    {lab.owner && (
                      <button
                        onClick={() => handleRemoveOwner(lab._id)}
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700"
                      >
                        Remove Owner
                      </button>
                    )}

                    {/* 7. Services */}
                    <button
                      onClick={() => navigate(`/admin/lab/${lab._id}/manage-services`)}
                      className="px-4 py-2 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700"
                    >
                      Services
                    </button>

                    {/* 8. Edit */}
                    <button
                      onClick={() => navigate(`/admin/labs/edit/${lab._id}`)}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg font-bold hover:bg-yellow-700"
                    >
                      Edit
                    </button>

                    {/* 9. Delete */}
                    <button
                      onClick={() => handleDelete(lab._id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700"
                    >
                      Delete
                    </button>
                    
                  </div>
                </div>
              </div>
            ))}
            
            {filteredLabs.length === 0 && (
              <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
                <FaFlask className="text-6xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No laboratories found in this category</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Owner Details Modal */}
      {showOwnerModal && (
        <OwnerDetailsModal
          owner={selectedOwner}
          onClose={() => {
            setShowOwnerModal(false);
            setSelectedOwner(null);
          }}
        />
      )}

      {/* Assign Owner Modal */}
      {showAssignOwnerModal && (
        <AssignOwnerModal
          facility={selectedFacility}
          facilityType="laboratory"
          onClose={() => {
            setShowAssignOwnerModal(false);
            setSelectedFacility(null);
          }}
          onSuccess={fetchLabs}
        />
      )}

    </div>
  );
};

export default ManageLabs;