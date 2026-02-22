import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaHospital, FaFlask, FaCheck, FaTimes, FaEye } from 'react-icons/fa';

const ReviewSubmissions = () => {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending'); // 'pending' or 'approved'

  useEffect(() => {
    fetchSubmissions();
  }, [filter]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:3000/api/submissions?status=${filter}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      setSubmissions(response.data.data);
    } catch (error) {
      console.error('Fetch submissions error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteAndApprove = (submission) => {
    // Navigate to Add Hospital/Lab page with pre-filled data
    if (submission.facilityType === 'hospital') {
      navigate('/admin/add-hospital', {
        state: {
          submissionId: submission._id,
          prefillData: submission.facilityData
        }
      });
    } else {
      navigate('/admin/add-lab', {
        state: {
          submissionId: submission._id,
          prefillData: submission.facilityData
        }
      });
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to reject this submission?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3000/api/submissions/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      alert('Submission rejected');
      fetchSubmissions();
    } catch (error) {
      alert('Failed to reject submission');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Review Facility Submissions</h1>

        {/* Filter Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setFilter('pending')}
            className={`px-6 py-2 rounded-lg font-semibold ${
              filter === 'pending'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Pending Approval
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-6 py-2 rounded-lg font-semibold ${
              filter === 'approved'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Approved
          </button>
        </div>

        {/* Submissions List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto"></div>
          </div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-md">
            <p className="text-gray-500">No {filter} submissions found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission) => (
              <div key={submission._id} className="bg-white rounded-2xl shadow-md p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-full ${
                      submission.facilityType === 'hospital' ? 'bg-blue-100' : 'bg-purple-100'
                    }`}>
                      {submission.facilityType === 'hospital' ? (
                        <FaHospital className="text-2xl text-blue-600" />
                      ) : (
                        <FaFlask className="text-2xl text-purple-600" />
                      )}
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {submission.facilityData.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {submission.facilityData.address?.city}, {submission.facilityData.address?.state}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Submitted by: {submission.submittedBy?.name || 'User'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Date: {new Date(submission.createdAt).toLocaleDateString()}
                      </p>
                      {submission.isApproved && (
                        <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                          ✓ Approved
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {!submission.isApproved && (
                      <>
                        <button
                          onClick={() => handleCompleteAndApprove(submission)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 flex items-center gap-2"
                        >
                          <FaCheck /> Complete & Approve
                        </button>
                        <button
                          onClick={() => handleReject(submission._id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 flex items-center gap-2"
                        >
                          <FaTimes /> Reject
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => {
                        // View details modal
                        alert(JSON.stringify(submission.facilityData, null, 2));
                      }}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg font-bold hover:bg-gray-700 flex items-center gap-2"
                    >
                      <FaEye /> View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewSubmissions;