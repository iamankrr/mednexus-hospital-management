import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaFlask, 
  FaEdit, 
  FaTrash, 
  FaArrowLeft,
  FaPlus,
  FaHome,
  FaUserTie
} from 'react-icons/fa';
import axios from 'axios';
import { labAPI } from '../../services/api'; // ✅ Using our structured API
import OwnerDetailsModal from '../../components/OwnerDetailsModal'; // ✅ Imported Modal
import AssignOwnerModal from '../../components/AssignOwnerModal'; // ✅ Imported Assign Owner Modal

const ManageLabs = () => {
  const navigate = useNavigate();
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'pending', 'approved'

  // State for Owner Modal
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [showOwnerModal, setShowOwnerModal] = useState(false);

  // ✅ Added State for Assign Owner Modal
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

  const handleApprove = async (id) => {
    if (!window.confirm('Approve this laboratory?')) return;
    try {
      await axios.put(
        `http://localhost:3000/api/admin/labs/${id}/approve`,
        { isApproved: true }, // Send true since this is an "Approve" specific button now
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      alert('✅ Laboratory approved successfully!');
      fetchLabs(); // ✅ Refresh
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

  // Function to toggle appointments
  const handleToggleAppointments = async (id, currentStatus) => {
    const action = currentStatus ? 'disable' : 'enable';
    if (!window.confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} appointments for this lab?`)) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:3000/api/admin/labs/${id}/toggle-appointments`,
        {},
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      alert(`✅ Appointments ${action}d successfully!`);
      fetchLabs();
    } catch (error) {
      console.error('Toggle error:', error);
      alert(error.response?.data?.message || 'Failed to toggle appointments');
    }
  };

  // Function to handle View Owner logic
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

  // ✅ New function to handle Remove Owner
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

  // Filter labs based on active tab
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
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700"
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
                    </div>
                  </div>

                  {/* Right Side: Actions */}
                  <div className="flex items-center gap-3">
                    
                    {/* Toggle Appointments Button */}
                    {lab.owner && (
                      <button
                        onClick={() => handleToggleAppointments(lab._id, lab.appointmentsEnabled)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition flex items-center gap-2 ${
                          lab.appointmentsEnabled
                            ? 'bg-green-500 text-white hover:bg-green-600'
                            : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                        }`}
                        title={lab.appointmentsEnabled ? 'Appointments Enabled' : 'Appointments Disabled'}
                      >
                        📅 {lab.appointmentsEnabled ? 'ON' : 'OFF'}
                      </button>
                    )}

                    {/* Status Badge / Approve Button */}
                    {lab.isVerified ? (
                      <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-bold border border-green-200">
                        ✓ Verified
                      </span>
                    ) : lab.owner ? (
                      <button
                        onClick={() => handleApprove(lab._id)}
                        className="px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm font-bold hover:bg-yellow-600 transition shadow-sm"
                      >
                        Approve
                      </button>
                    ) : null}

                    {/* ✅ Updated Owner Actions (View / Remove / Assign) */}
                    {lab.owner ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewOwner(lab.owner)}
                          className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm font-bold hover:bg-purple-600 flex items-center gap-2"
                          title="View Owner Details"
                        >
                          <FaUserTie /> View
                        </button>
                        <button
                          onClick={() => handleRemoveOwner(lab._id)}
                          className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-bold hover:bg-orange-600"
                        >
                          Remove Owner
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedFacility(lab);
                          setShowAssignOwnerModal(true);
                        }}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-bold hover:bg-green-600"
                      >
                        Assign Owner
                      </button>
                    )}

                    {/* Edit Button */}
                    <button
                      onClick={() => navigate(`/admin/labs/edit/${lab._id}`)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-bold hover:bg-blue-600 transition shadow-sm flex items-center gap-2"
                    >
                      <FaEdit /> Edit
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(lab._id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-bold hover:bg-red-600 transition shadow-sm flex items-center gap-2"
                    >
                      <FaTrash /> Delete
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

      {/* ✅ Added Assign Owner Modal */}
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