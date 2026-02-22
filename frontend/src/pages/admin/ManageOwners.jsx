import React, { useState, useEffect } from 'react';
import { 
  FaCheckCircle, 
  FaTimesCircle, 
  FaUser, 
  FaHospital, 
  FaFlask, 
  FaEye, 
  FaTimes, 
  FaExchangeAlt 
} from 'react-icons/fa';
import axios from 'axios';
// import OwnerDetailsModal from '../../components/OwnerDetailsModal'; 

const ManageOwners = () => {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('pending'); // 'pending', 'approved', 'all'
  const [ownerFilter, setOwnerFilter] = useState('all'); // 'all', 'hospital', 'laboratory'

  // Modal State
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [showOwnerModal, setShowOwnerModal] = useState(false);

  useEffect(() => {
    fetchOwners();
  }, []);

  const fetchOwners = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get('http://localhost:3000/api/admin/owners', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setOwners(response.data.data || []);
    } catch (error) {
      console.error('Fetch owners error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (ownerId) => {
    if (!window.confirm('Approve this owner?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:3000/api/admin/owners/${ownerId}/approve`,
        {},
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      alert('✅ Owner approved successfully');
      fetchOwners();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to approve owner');
    }
  };

  const handleReject = async (userId) => {
    if (!window.confirm('Reject this owner application?')) return;

    try {
      const token = localStorage.getItem('token');
      
      await axios.put(
        `http://localhost:3000/api/admin/owners/${userId}/reject`,
        {},
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      alert('❌ Owner application rejected');
      fetchOwners();
    } catch (error) {
      console.error('Reject error:', error);
      alert('Failed to reject owner');
    }
  };

  const handleViewOwner = async (ownerId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:3000/api/admin/owners/${ownerId}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setSelectedOwner(response.data.data);
        setShowOwnerModal(true);
      }
    } catch (error) {
      console.error('View owner error:', error);
      alert(error.response?.data?.message || 'Failed to load owner details');
    }
  };

  // ✅ New Handler: Remove Owner From Facility
  const handleRemoveOwnerFromFacility = async (ownerId, facilityType, facilityId) => {
    if (!window.confirm('Remove this owner from their facility?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:3000/api/admin/owners/${ownerId}/remove-facility`,
        {},
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      alert('✅ Owner removed from facility');
      fetchOwners();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to remove owner');
    }
  };

  // ✅ New Handler: Change Owner
  const handleChangeOwner = async (ownerId, facilityType, facilityId) => {
    const newOwnerEmail = prompt('Enter new owner email:');
    if (!newOwnerEmail) return;

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:3000/api/admin/facilities/${facilityType}/${facilityId}/change-owner`,
        { newOwnerEmail },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      alert('✅ Owner changed successfully');
      fetchOwners();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to change owner');
    }
  };

  const filteredOwners = owners.filter(owner => {
    // Check Status Filter
    if (statusFilter !== 'all') {
      const isApproved = statusFilter === 'approved';
      const isPending = statusFilter === 'pending';
      
      if (isApproved && owner.ownerProfile?.isVerified !== true) return false;
      if (isPending && owner.ownerProfile?.isVerified !== false) return false;
    }
    
    // Check Facility Type Filter
    if (ownerFilter !== 'all' && owner.ownerProfile?.facilityType !== ownerFilter) {
      return false;
    }
    
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Manage Owners</h1>
          <p className="text-gray-600">Review and approve owner registrations</p>
        </div>

        {/* Facility Type Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setOwnerFilter('all')}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              ownerFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All Owners
          </button>
          <button
            onClick={() => setOwnerFilter('hospital')}
            className={`px-6 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${
              ownerFilter === 'hospital'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <FaHospital /> Hospital Owners
          </button>
          <button
            onClick={() => setOwnerFilter('laboratory')}
            className={`px-6 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${
              ownerFilter === 'laboratory'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <FaFlask /> Lab Owners
          </button>
        </div>

        {/* Status Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200 pb-2">
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-6 py-3 font-semibold transition ${
              statusFilter === 'pending'
                ? 'text-orange-600 border-b-2 border-orange-600'
                : 'text-gray-600 hover:text-orange-600'
            }`}
          >
            Pending Approval ({owners.filter(o => o.ownerProfile?.isVerified === false && (ownerFilter === 'all' || o.ownerProfile?.facilityType === ownerFilter)).length})
          </button>
          <button
            onClick={() => setStatusFilter('approved')}
            className={`px-6 py-3 font-semibold transition ${
              statusFilter === 'approved'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 hover:text-green-600'
            }`}
          >
            Approved ({owners.filter(o => o.ownerProfile?.isVerified === true && (ownerFilter === 'all' || o.ownerProfile?.facilityType === ownerFilter)).length})
          </button>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-6 py-3 font-semibold transition ${
              statusFilter === 'all'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            All Status ({owners.filter(o => ownerFilter === 'all' || o.ownerProfile?.facilityType === ownerFilter).length})
          </button>
        </div>

        {/* Owner List */}
        <div className="space-y-4">
          {filteredOwners.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
              <p className="text-gray-500 text-lg">No owners found in this category</p>
            </div>
          ) : (
            filteredOwners.map((owner) => (
              <div key={owner._id} className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 transition hover:shadow-lg">
                <div className="flex flex-col md:flex-row items-start gap-6">
                  
                  {/* Owner Icon */}
                  <div className="flex-shrink-0 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <FaUser className="text-2xl text-blue-600" />
                  </div>

                  {/* Owner Info */}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">{owner.name}</h3>
                    <p className="text-gray-600 text-sm">{owner.email}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                      {/* Phone */}
                      <div>
                        <p className="text-xs text-gray-500 font-semibold mb-1">PHONE</p>
                        <p className="text-sm font-medium text-gray-900">{owner.phone || 'N/A'}</p>
                      </div>

                      {/* Facility Type */}
                      <div>
                        <p className="text-xs text-gray-500 font-semibold mb-1">FACILITY TYPE</p>
                        <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                          {owner.ownerProfile?.facilityType === 'hospital' ? (
                            <>
                              <FaHospital className="text-blue-600" /> Hospital
                            </>
                          ) : (
                            <>
                              <FaFlask className="text-purple-600" /> Laboratory
                            </>
                          )}
                        </p>
                      </div>

                      {/* Facility Name */}
                      <div>
                        <p className="text-xs text-gray-500 font-semibold mb-1">FACILITY NAME</p>
                        <p className="text-sm font-medium text-gray-900 truncate" title={owner.ownerProfile?.facilityId?.name || owner.facilityDetails?.name}>
                          {owner.ownerProfile?.facilityId?.name || owner.facilityDetails?.name || 'N/A'}
                        </p>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="mt-4">
                      <p className="text-xs text-gray-500 font-semibold mb-1">STATUS</p>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                        owner.ownerProfile?.isVerified 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {owner.ownerProfile?.isVerified ? '✓ Approved' : '⏳ Pending'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 min-w-[140px] w-full md:w-auto mt-4 md:mt-0">
                    
                    {/* View Owner Button */}
                    <button
                      onClick={() => handleViewOwner(owner._id)}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-bold hover:bg-blue-200 flex items-center justify-center gap-2 transition"
                    >
                      <FaEye /> View
                    </button>

                    {/* ✅ Legacy Approve / Reject for Pending Owners */}
                    {!owner.isActive && (
                      <>
                        <button
                          onClick={() => handleApprove(owner._id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 flex items-center justify-center gap-2 transition"
                        >
                          <FaCheckCircle /> Approve
                        </button>
                        <button
                          onClick={() => handleReject(owner._id)}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 flex items-center justify-center gap-2 transition"
                        >
                          <FaTimesCircle /> Reject
                        </button>
                      </>
                    )}

                    {/* ✅ New Actions: Remove / Change Owner (Only if a facility exists) */}
                    {owner.ownerProfile?.facilityId && owner.ownerProfile?.isVerified && (
                      <>
                        <button
                          onClick={() => handleRemoveOwnerFromFacility(owner._id, owner.ownerProfile.facilityType, owner.ownerProfile.facilityId._id || owner.ownerProfile.facilityId)}
                          className="px-4 py-2 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700 flex items-center justify-center gap-2 transition"
                        >
                          <FaTimes /> Remove
                        </button>

                        <button
                          onClick={() => handleChangeOwner(owner._id, owner.ownerProfile.facilityType, owner.ownerProfile.facilityId._id || owner.ownerProfile.facilityId)}
                          className="px-4 py-2 bg-yellow-500 text-white rounded-lg font-bold hover:bg-yellow-600 flex items-center justify-center gap-2 transition"
                        >
                          <FaExchangeAlt /> Change
                        </button>
                      </>
                    )}
                  </div>

                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* Simple Modal for View Owner */}
      {showOwnerModal && selectedOwner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Owner Details</h2>
            <div className="space-y-3 mb-6">
              <p><strong>Name:</strong> {selectedOwner.name}</p>
              <p><strong>Email:</strong> {selectedOwner.email}</p>
              <p><strong>Phone:</strong> {selectedOwner.phone}</p>
              <p><strong>Role:</strong> {selectedOwner.role}</p>
              <hr />
              <p><strong>Facility Type:</strong> <span className="capitalize">{selectedOwner.ownerProfile?.facilityType}</span></p>
              <p><strong>Verification Status:</strong> {selectedOwner.ownerProfile?.isVerified ? 'Approved' : 'Pending'}</p>
              {selectedOwner.ownerProfile?.businessLicense && <p><strong>License:</strong> {selectedOwner.ownerProfile.businessLicense}</p>}
            </div>
            <button 
              onClick={() => setShowOwnerModal(false)}
              className="w-full py-2 bg-gray-200 text-gray-800 rounded-xl font-bold hover:bg-gray-300 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageOwners;