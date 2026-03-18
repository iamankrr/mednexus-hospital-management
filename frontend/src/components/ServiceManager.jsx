import React, { useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaRupeeSign } from 'react-icons/fa';
import axios from 'axios';
import API_URL from '../config/api'; // ✅ FIX: Imported Live API_URL

const CATEGORIES = [
  'Consultation', 'Pathology', 'Radiology', 'Diagnosis', 
  'OPD', 'Surgery', 'Cardiology', 'Neurology', 'Dental', 
  'Eye', 'Orthopedic', 'Maternity', 'Therapy', 'General', 'Other'
];

const ServiceManager = ({ facilityId, facilityType = 'hospital', initialServices = [], onUpdate }) => {
  const [services, setServices] = useState(initialServices);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [form, setForm] = useState({
    name: '', category: 'General', price: '',
    duration: '', description: '', isAvailable: true
  });

  const [editForm, setEditForm] = useState({});

  const getToken = () => localStorage.getItem('token');
  
  // ✅ FIX: Replaced localhost with dynamic API_URL
  const getEndpoint = () =>
    `${API_URL}/api/${facilityType === 'hospital' ? 'hospitals' : 'labs'}/${facilityId}/services`;

  const resetForm = () => {
    setForm({ name: '', category: 'General', price: '', duration: '', description: '', isAvailable: true });
    setShowAddForm(false);
  };

  const cleanPayload = (data) => {
    const payload = { ...data };
    if (!payload.price || payload.price === '') {
      delete payload.price; 
    } else {
      payload.price = parseFloat(payload.price);
    }
    return payload;
  };

  const handleAdd = async () => {
    if (!form.name) {
      alert('Service name is required!');
      return;
    }
    try {
      setLoading(true);
      const payload = cleanPayload(form);
      
      const res = await axios.post(getEndpoint(), payload, { 
        headers: { Authorization: `Bearer ${getToken()}` } 
      });
      
      setServices(res.data.data);
      if (onUpdate) onUpdate(res.data.data);
      resetForm();
      alert('✅ Service added successfully!');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error adding service');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (service) => {
    setEditingId(service._id);
    setEditForm({
      name: service.name,
      category: service.category || 'General',
      price: service.price || '',
      duration: service.duration || '',
      description: service.description || '',
      isAvailable: service.isAvailable !== false
    });
  };

  const handleSaveEdit = async (serviceId) => {
    try {
      setLoading(true);
      const payload = cleanPayload(editForm);

      const res = await axios.put(`${getEndpoint()}/${serviceId}`, payload, { 
        headers: { Authorization: `Bearer ${getToken()}` } 
      });
      
      setServices(prev => prev.map(s => s._id === serviceId ? { ...s, ...payload } : s));
      if (onUpdate) onUpdate(services);
      setEditingId(null);
      alert('✅ Service updated!');
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating service');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (serviceId, serviceName) => {
    if (!window.confirm(`Delete "${serviceName}"?`)) return;
    try {
      setLoading(true);
      await axios.delete(`${getEndpoint()}/${serviceId}`, { 
        headers: { Authorization: `Bearer ${getToken()}` } 
      });
      const updated = services.filter(s => s._id !== serviceId);
      setServices(updated);
      if (onUpdate) onUpdate(updated);
      alert('✅ Service deleted!');
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting service');
    } finally {
      setLoading(false);
    }
  };

  const filtered = services.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.category || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const grouped = {};
  filtered.forEach(s => {
    const cat = s.category || 'General';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(s);
  });

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-5 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">💰 Manage Services</h2>
            <p className="text-blue-100 text-sm mt-1">{services.length} services listed</p>
          </div>
          <button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-xl font-bold hover:bg-blue-50 transition shadow-sm">
            {showAddForm ? <><FaTimes /> Cancel</> : <><FaPlus /> Add Service</>}
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="p-5 bg-blue-50 border-b border-blue-200">
          <h3 className="font-bold text-blue-800 mb-4">➕ Add New Service</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Service Name *</label>
              <input type="text" placeholder="e.g. Blood Test, X-Ray" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Category</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Price (₹) (Optional)</label>
              <input type="number" placeholder="Leave blank for 'On Request'" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Duration</label>
              <input type="text" placeholder="e.g. 30 minutes" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <input type="text" placeholder="Brief description..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={handleAdd} disabled={loading} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50 shadow-sm">{loading ? '⏳ Saving...' : <><FaSave /> Save Service</>}</button>
          </div>
        </div>
      )}

      <div className="p-4 border-b border-gray-100 bg-gray-50">
        <input type="text" placeholder="🔍 Search services..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 shadow-sm" />
      </div>

      <div className="p-4 max-h-[600px] overflow-y-auto custom-scrollbar">
        {services.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <FaRupeeSign className="text-5xl mx-auto mb-3 text-gray-300" />
            <p className="font-medium text-gray-600">No services added yet</p>
          </div>
        ) : (
          Object.entries(grouped).map(([category, items]) => (
            <div key={category} className="mb-6">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                <span className="h-px bg-gray-200 flex-1"></span>{category} ({items.length})<span className="h-px bg-gray-200 flex-1"></span>
              </h3>
              <div className="space-y-3">
                {items.map(service => (
                  <div key={service._id} className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm hover:border-blue-300 transition">
                    {editingId === service._id ? (
                      <div className="p-4 bg-yellow-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                          <input type="text" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="px-3 py-2 border rounded-lg text-sm" placeholder="Service name" />
                          <select value={editForm.category} onChange={e => setEditForm({ ...editForm, category: e.target.value })} className="px-3 py-2 border rounded-lg text-sm">{CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}</select>
                          <input type="number" value={editForm.price} onChange={e => setEditForm({ ...editForm, price: e.target.value })} className="px-3 py-2 border rounded-lg text-sm" placeholder="Price ₹ (Optional)" />
                          <input type="text" value={editForm.duration} onChange={e => setEditForm({ ...editForm, duration: e.target.value })} className="px-3 py-2 border rounded-lg text-sm" placeholder="Duration" />
                          <input type="text" value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} className="md:col-span-2 px-3 py-2 border rounded-lg text-sm" placeholder="Description" />
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleSaveEdit(service._id)} disabled={loading} className="flex items-center gap-1 bg-green-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-600"><FaSave /> Save</button>
                          <button onClick={() => setEditingId(null)} className="flex items-center gap-1 border bg-white text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50"><FaTimes /> Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-4">
                        <div className="flex-1 pr-4">
                          <p className="font-bold text-gray-900 text-lg">{service.name}</p>
                          {service.description && <p className="text-sm text-gray-500 mt-1">{service.description}</p>}
                          {service.duration && <p className="text-xs text-gray-400 mt-1 font-medium">⏱ {service.duration}</p>}
                        </div>
                        <div className="flex items-center gap-4 border-l pl-4 border-gray-100">
                          <span className={`text-lg font-black ${service.price ? 'text-blue-600' : 'text-gray-400 text-sm'}`}>
                            {service.price ? `₹${service.price.toLocaleString()}` : 'On Request'}
                          </span>
                          <div className="flex flex-col gap-1">
                             <button onClick={() => startEdit(service)} className="text-blue-500 hover:text-blue-700 bg-blue-50 p-2 rounded-md"><FaEdit /></button>
                             <button onClick={() => handleDelete(service._id, service.name)} className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-md"><FaTrash /></button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ServiceManager;