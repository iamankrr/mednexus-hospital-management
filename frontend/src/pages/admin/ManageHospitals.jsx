import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaHospital, 
  FaArrowLeft,
  FaPlus
} from 'react-icons/fa';
import axios from 'axios';
import { hospitalAPI } from '../../services/api';
import OwnerDetailsModal from '../../components/OwnerDetailsModal'; 
import AssignOwnerModal from '../../components/AssignOwnerModal'; 

const ManageHospitals = () => {
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'pending', 'approved'
  
  // State for Owner Modals
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [showOwnerModal, setShowOwnerModal] = useState(false);
  
  // State for Assign Owner Modal
  const [showAssignOwnerModal, setShowAssignOwnerModal] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState(null);

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      // Fetching without limit so admin can see all
      const response = await hospitalAPI.getAll({ limit: 1000 }); 
      setHospitals(response.data.data || []);
    } catch (error) {
      console.error('Error fetching hospitals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm('Approve this hospital?')) return;
    try {
      await axios.put(
        `http://localhost:3000/api/admin/hospitals/${id}/approve`,
        { isApproved: true },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      alert('✅ Hospital approved successfully!');
      fetchHospitals();
    } catch (error) {
      console.error('Approve error:', error);
      alert('Failed to approve hospital');
    }
  };

  const handleDelete = async (hospitalId) => {
    if (!window.confirm('Are you sure you want to delete this hospital? This action cannot be undone!')) {
      return;
    }

    try {
      await hospitalAPI.delete(hospitalId);
      alert('✅ Hospital deleted successfully!');
      fetchHospitals();
    } catch (err) {
      console.error('Delete error:', err);
      alert(err.response?.data?.message || 'Failed to delete hospital');
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    const action = currentStatus ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} this hospital?`)) return;
    
    try {
      const token = localStorage.getItem('token');
      // Reusing the approve endpoint logic which updates isActive based on the payload
      await axios.put(
        `http://localhost:3000/api/admin/hospitals/${id}/approve`,
        { isApproved: !currentStatus }, 
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      alert(`✅ Hospital ${action}d successfully!`);
      fetchHospitals();
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

  const handleRemoveOwner = async (hospitalId) => {
    if (!window.confirm('Remove owner from this hospital? The owner account will be converted to a regular user.')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:3000/api/admin/remove-owner',
        { facilityId: hospitalId, facilityType: 'hospital' },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      alert('✅ Owner removed successfully');
      fetchHospitals();
    } catch (error) {
      console.error('Remove owner error:', error);
      alert(error.response?.data?.message || 'Failed to remove owner');
    }
  };

  const handleAssignOwner = (hospitalId) => {
    const hospital = hospitals.find(h => h._id === hospitalId);
    setSelectedFacility(hospital);
    setShowAssignOwnerModal(true);
  };

  const filteredHospitals = hospitals.filter(hospital => {
    if (activeTab === 'pending') {
      return hospital.owner && !hospital.isVerified;
    } else if (activeTab === 'approved') {
      return hospital.owner && hospital.isVerified;
    }
    return true;
  });

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
            <div className="flex items-center gap-3">
              <FaHospital className="text-4xl" />
              <div>
                <h1 className="text-4xl font-bold">Manage Hospitals</h1>
                <p className="text-blue-100 mt-2">View, approve, and manage all hospitals</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/admin/hospitals/add')}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700"
            >
              <FaPlus /> Add Hospital
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
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            All Hospitals ({hospitals.length})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === 'pending'
                ? 'text-orange-600 border-b-2 border-orange-600'
                : 'text-gray-600 hover:text-orange-600'
            }`}
          >
            Pending Approval ({hospitals.filter(h => h.owner && !h.isVerified).length})
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === 'approved'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 hover:text-green-600'
            }`}
          >
            Approved ({hospitals.filter(h => h.owner && h.isVerified).length})
          </button>
        </div>

        {/* Hospital List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading hospitals...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredHospitals.map((hospital) => (
              <div key={hospital._id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  
                  {/* Left Side: Info */}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">{hospital.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {hospital.address?.city}, {hospital.address?.state}
                    </p>
                    
                    {/* Badges */}
                    <div className="flex gap-2 mt-3 flex-wrap items-center">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold capitalize">
                        {hospital.type}
                      </span>
                      {hospital.owner ? (
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
                          Owner: {hospital.owner.name || 'User Submitted'}
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold">
                          Admin Created
                        </span>
                      )}
                      
                      {/* Status Badge */}
                      {hospital.isApproved ? (
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

                  {/* Right Side: Actions - EXACT ORDER */}
                  <div className="flex flex-wrap gap-2 justify-end">
                    
                    {/* 1. ON/OFF Toggle */}
                    <button
                      onClick={() => handleToggleActive(hospital._id, hospital.isActive)}
                      className={`px-4 py-2 rounded-lg font-bold ${
                        hospital.isActive 
                          ? 'bg-green-600 text-white hover:bg-green-700' 
                          : 'bg-gray-400 text-white hover:bg-gray-500'
                      }`}
                    >
                      {hospital.isActive ? 'ON' : 'OFF'}
                    </button>

                    {/* 2. Approve (if not approved) */}
                    {!hospital.isApproved && (
                      <button
                        onClick={() => handleApprove(hospital._id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
                      >
                        Approve
                      </button>
                    )}

                    {/* 3. View */}
                    <button
                      onClick={() => navigate(`/hospital/${hospital._id}`)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700"
                    >
                      View
                    </button>

                    {/* 4. Owner (View/Assign) */}
                    {hospital.owner ? (
                      <button
                        onClick={() => handleViewOwner(hospital.owner)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700"
                      >
                        Owner
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAssignOwner(hospital._id)}
                        className="px-4 py-2 bg-purple-400 text-white rounded-lg font-bold hover:bg-purple-500"
                      >
                        Assign Owner
                      </button>
                    )}

                    {/* 5. Remove Owner */}
                    {hospital.owner && (
                      <button
                        onClick={() => handleRemoveOwner(hospital._id)}
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700"
                      >
                        Remove Owner
                      </button>
                    )}

                    {/* 6. Services */}
                    <button
                      onClick={() => navigate(`/admin/hospital/${hospital._id}/manage-services`)}
                      className="px-4 py-2 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700"
                    >
                      Services
                    </button>

                    {/* 7. Edit */}
                    <button
                      onClick={() => navigate(`/admin/hospitals/edit/${hospital._id}`)}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg font-bold hover:bg-yellow-700"
                    >
                      Edit
                    </button>

                    {/* 8. Delete */}
                    <button
                      onClick={() => handleDelete(hospital._id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700"
                    >
                      Delete
                    </button>
                    
                  </div>
                </div>
              </div>
            ))}
            
            {filteredHospitals.length === 0 && (
              <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
                <FaHospital className="text-6xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No hospitals found in this category</p>
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
          facilityType="hospital"
          onClose={() => {
            setShowAssignOwnerModal(false);
            setSelectedFacility(null);
          }}
          onSuccess={fetchHospitals}
        />
      )}

    </div>
  );
};

export default ManageHospitals;