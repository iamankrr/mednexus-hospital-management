import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaUsers, 
  FaTrash, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaArrowLeft
} from 'react-icons/fa';
import axios from 'axios';

const ManageUsers = () => {

  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  const DEFAULT_ADMIN_EMAIL = 'admin@hospital.com';
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchUsers();
  }, [filter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      let url = "http://localhost:3000/api/admin/users";
      if(filter !== "all"){
        url += `?role=${filter}`;
      }

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if(res.data.success){
        setUsers(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    if(!window.confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this user?`)) return;

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:3000/api/admin/users/${userId}/status`,
        { isActive: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("User status updated");
      fetchUsers();
    } catch(err) {
      alert(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleDeleteUser = async (userId) => {
    if(!window.confirm("Delete this user permanently?")) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:3000/api/admin/users/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("User deleted");
      fetchUsers();
    } catch(err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* HEADER */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-start">
            <div>
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="flex items-center gap-2 text-white hover:text-purple-200 mb-4"
              >
                <FaArrowLeft/> Back to Dashboard
              </button>

              <div className="flex items-center gap-3">
                <FaUsers className="text-4xl"/>
                <div>
                  <h1 className="text-4xl font-bold">Manage Users</h1>
                  <p className="text-purple-100 mt-2">
                    View and manage all registered users
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* FILTER */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex gap-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === 'all' ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              All Users
            </button>
            <button
              onClick={() => setFilter('user')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === 'user' ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Users
            </button>
            <button
              onClick={() => setFilter('admin')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === 'admin' ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Admins
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id}>
                    <td className="px-6 py-4">{user.name}</td>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4">{user.phone}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.role === 'admin' ? 'bg-red-100 text-red-800' 
                        : user.role === 'owner' ? 'bg-purple-100 text-purple-800' 
                        : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.isActive 
                        ? <FaCheckCircle className="text-green-500 text-xl"/> 
                        : <FaTimesCircle className="text-red-500 text-xl"/>
                      }
                    </td>
                    <td className="px-6 py-4">
                      {user.email === DEFAULT_ADMIN_EMAIL ? (
                        <span className="text-gray-400 font-bold text-xs uppercase bg-gray-100 px-3 py-1 rounded">
                          Default Admin
                        </span>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleToggleStatus(user._id, user.isActive)}
                            className={`${
                              user.isActive ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-500 hover:bg-green-600'
                            } text-white px-3 py-1 rounded`}
                          >
                            {user.isActive ? "Deactivate" : "Activate"}
                          </button>
                          
                          {/* ONLY DEFAULT ADMIN CAN DELETE OTHER ADMINS */}
                          {(currentUser.email === DEFAULT_ADMIN_EMAIL || user.role !== 'admin') && (
                            <button
                              onClick={() => handleDeleteUser(user._id)}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded flex items-center gap-1"
                            >
                              <FaTrash/> Delete
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageUsers;