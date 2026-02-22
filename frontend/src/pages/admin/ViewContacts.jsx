import React, { useState, useEffect } from 'react';
import { FaEnvelope, FaEnvelopeOpen, FaTrash, FaClock } from 'react-icons/fa';
import axios from 'axios';

const ViewContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await axios.get('http://localhost:3000/api/contacts', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setContacts(response.data.data || []);
    } catch (error) {
      console.error('Fetch contacts error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.put(
        `http://localhost:3000/api/contacts/${id}/mark-read`,
        {},
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      fetchContacts();
    } catch (error) {
      console.error('Mark read error:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this contact message?')) return;

    try {
      const token = localStorage.getItem('token');
      
      await axios.delete(`http://localhost:3000/api/contacts/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      alert('✅ Contact deleted');
      fetchContacts();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete contact');
    }
  };

  const filteredContacts = contacts.filter(contact => {
    if (filter === 'unread') return !contact.isRead;
    if (filter === 'read') return contact.isRead;
    return true;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact Messages</h1>
          <p className="text-gray-600">Messages from users via contact form</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-3 font-semibold transition ${
              filter === 'all'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            All ({contacts.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-6 py-3 font-semibold transition ${
              filter === 'unread'
                ? 'text-orange-600 border-b-2 border-orange-600'
                : 'text-gray-600 hover:text-orange-600'
            }`}
          >
            Unread ({contacts.filter(c => !c.isRead).length})
          </button>
          <button
            onClick={() => setFilter('read')}
            className={`px-6 py-3 font-semibold transition ${
              filter === 'read'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 hover:text-green-600'
            }`}
          >
            Read ({contacts.filter(c => c.isRead).length})
          </button>
        </div>

        {/* Contacts List */}
        {filteredContacts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl">
            <FaEnvelope className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No contacts in this category</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredContacts.map((contact) => (
              <div
                key={contact._id}
                className={`bg-white rounded-2xl shadow-md p-6 border-l-4 ${
                  contact.isRead ? 'border-green-500' : 'border-orange-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  
                  {/* Contact Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      {contact.isRead ? (
                        <FaEnvelopeOpen className="text-2xl text-green-500" />
                      ) : (
                        <FaEnvelope className="text-2xl text-orange-500" />
                      )}
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{contact.name}</h3>
                        <p className="text-sm text-gray-500">{contact.email}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Subject</p>
                        <p className="text-sm font-medium text-gray-900">{contact.subject}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Received</p>
                        <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                          <FaClock className="text-gray-400" />
                          {formatDate(contact.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Message</p>
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">{contact.message}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 ml-4">
                    {!contact.isRead && (
                      <button
                        onClick={() => handleMarkRead(contact._id)}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition whitespace-nowrap"
                      >
                        Mark Read
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(contact._id)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition"
                    >
                      <FaTrash /> Delete
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

export default ViewContacts;