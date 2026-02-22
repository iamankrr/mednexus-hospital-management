import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaArrowLeft, FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa';
import axios from 'axios';

const ContactRequests = () => {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchContacts();
  }, [filter]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      let url = 'http://localhost:3000/api/admin/contacts';
      if (filter !== 'all') {
        url += `?status=${filter}`;
      }

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setContacts(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching contacts:', err);
      setError(err.response?.data?.message || 'Failed to load contact requests');
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (contactId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.put(
        `http://localhost:3000/api/admin/contacts/${contactId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Status updated successfully!');
      fetchContacts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'bg-orange-100', text: 'text-orange-800', icon: FaClock },
      in_progress: { bg: 'bg-blue-100', text: 'text-blue-800', icon: FaClock },
      resolved: { bg: 'bg-green-100', text: 'text-green-800', icon: FaCheckCircle },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: FaTimesCircle }
    };
    
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;
    
    return (
      <span className={`${badge.bg} ${badge.text} px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2 w-fit`}>
        <Icon /> {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center gap-2 text-white hover:text-orange-200 mb-4"
          >
            <FaArrowLeft /> Back to Dashboard
          </button>
          <div className="flex items-center gap-3">
            <FaEnvelope className="text-4xl" />
            <div>
              <h1 className="text-4xl font-bold">Contact Requests</h1>
              <p className="text-orange-100 mt-2">View and manage contact form submissions</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex gap-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === 'all'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({contacts.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === 'pending'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('in_progress')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === 'in_progress'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => setFilter('resolved')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === 'resolved'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Resolved
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Contact List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          </div>
        ) : contacts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <FaEnvelope className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No contact requests found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {contacts.map((contact) => (
              <div key={contact._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{contact.name}</h3>
                    <p className="text-sm text-gray-500">{contact.email} • {contact.phone}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(contact.createdAt)}</p>
                  </div>
                  {getStatusBadge(contact.status)}
                </div>

                <div className="mb-4">
                  <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mb-2">
                    {contact.type.replace('_', ' ').toUpperCase()}
                  </span>
                  {contact.organizationType && (
                    <span className="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium ml-2">
                      {contact.organizationType.toUpperCase()}
                    </span>
                  )}
                </div>

                {contact.organizationName && (
                  <p className="text-gray-700 mb-2">
                    <span className="font-semibold">Organization:</span> {contact.organizationName}
                  </p>
                )}

                <p className="text-gray-600 mb-4">{contact.message}</p>

                {contact.adminNotes && (
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                    <p className="text-sm font-semibold text-blue-800 mb-1">Admin Notes:</p>
                    <p className="text-sm text-blue-700">{contact.adminNotes}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  {contact.status !== 'in_progress' && (
                    <button
                      onClick={() => handleUpdateStatus(contact._id, 'in_progress')}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition duration-200"
                    >
                      Mark In Progress
                    </button>
                  )}
                  {contact.status !== 'resolved' && (
                    <button
                      onClick={() => handleUpdateStatus(contact._id, 'resolved')}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition duration-200"
                    >
                      Mark Resolved
                    </button>
                  )}
                  {contact.status !== 'rejected' && (
                    <button
                      onClick={() => handleUpdateStatus(contact._id, 'rejected')}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-200"
                    >
                      Reject
                    </button>
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

export default ContactRequests;