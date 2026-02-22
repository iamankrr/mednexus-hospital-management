import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHospital, FaFlask, FaClock, FaCheckCircle, FaTimesCircle, FaTrash } from 'react-icons/fa';
import axios from 'axios';

const MySubmissions = () => {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get('http://localhost:3000/api/submissions/my-submissions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setSubmissions(response.data.data || []);
    } catch (error) {
      console.error('Fetch submissions error:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this submission?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3000/api/submissions/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      alert('✅ Submission deleted');
      fetchSubmissions();
    } catch (error) {
      console.error('Delete error:', error);
      alert(error.response?.data?.message || 'Failed to delete submission');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">
            <FaClock /> Pending Review
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
            <FaCheckCircle /> Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
            <FaTimesCircle /> Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Submissions</h1>
            <p className="text-gray-600">Track your facility submission requests</p>
          </div>
          <button
            onClick={() => navigate('/submit-facility')}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700"
          >
            + Submit New Facility
          </button>
        </div>

        {/* Submissions List */}
        {submissions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-gray-500 text-lg mb-4">No submissions yet</p>
            <button
              onClick={() => navigate('/submit-facility')}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700"
            >
              Submit Your First Facility
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission) => (
              <div key={submission._id} className="bg-white rounded-2xl shadow-md p-6 border border-gray-200">
                <div className="flex items-start justify-between">
                  
                  {/* Submission Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      {submission.facilityType === 'hospital' ? (
                        <FaHospital className="text-2xl text-blue-500" />
                      ) : (
                        <FaFlask className="text-2xl text-purple-500" />
                      )}
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{submission.name}</h3>
                        <p className="text-sm text-gray-500 capitalize">
                          {submission.facilityType}
                        </p>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Location</p>
                        <p className="text-sm font-medium text-gray-900">
                          {submission.address.city}, {submission.address.state}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Submitted</p>
                        <p className="text-sm font-medium text-gray-900">
                          {formatDate(submission.createdAt)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Status</p>
                        {getStatusBadge(submission.status)}
                      </div>
                      {submission.reviewedAt && (
                        <div>
                          <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Reviewed</p>
                          <p className="text-sm font-medium text-gray-900">
                            {formatDate(submission.reviewedAt)}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Address */}
                    <div className="p-3 bg-gray-50 rounded-lg mb-3">
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Address</p>
                      <p className="text-sm text-gray-900">
                        {submission.address.street}
                        {submission.address.area && `, ${submission.address.area}`}
                        {`, ${submission.address.city}, ${submission.address.state}`}
                        {submission.address.pincode && ` - ${submission.address.pincode}`}
                      </p>
                    </div>

                    {/* Rejection Reason */}
                    {submission.status === 'rejected' && submission.rejectionReason && (
                      <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                        <p className="text-xs text-red-700 uppercase font-semibold mb-1">Rejection Reason</p>
                        <p className="text-sm text-red-900">{submission.rejectionReason}</p>
                      </div>
                    )}

                    {/* Admin Notes */}
                    {submission.adminNotes && (
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 mt-3">
                        <p className="text-xs text-blue-700 uppercase font-semibold mb-1">Admin Notes</p>
                        <p className="text-sm text-blue-900">{submission.adminNotes}</p>
                      </div>
                    )}

                    {/* Approved Facility Link */}
                    {submission.status === 'approved' && submission.approvedFacilityId && (
                      <div className="mt-3">
                        <button
                          onClick={() => navigate(`/${submission.facilityType === 'hospital' ? 'hospital' : 'lab'}/${submission.approvedFacilityId}`)}
                          className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
                        >
                          → View Live Listing
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {submission.status === 'pending' && (
                    <div className="ml-4">
                      <button
                        onClick={() => handleDelete(submission._id)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition"
                      >
                        <FaTrash /> Delete
                      </button>
                    </div>
                  )}

                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default MySubmissions;