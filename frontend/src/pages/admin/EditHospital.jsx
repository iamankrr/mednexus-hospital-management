import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { hospitalAPI } from '../../services/api';
import ServiceManager from '../../components/ServiceManager';
import ThemeColorPicker from '../../components/ThemeColorPicker';
import ImageUploadManager from '../../components/ImageUploadManager';
import CityStateSelector from '../../components/CityStateSelector';
import DoctorPhotoUpload from '../../components/DoctorPhotoUpload'; // 👈 Import added
import { FaSave, FaArrowLeft, FaTrash, FaSync, FaPlus, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { HOSPITAL_TYPES } from '../../components/HospitalTypeFilter';
import axios from 'axios';
import API_URL from '../../config/api';

const FormSection = ({ title, icon, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-6 border border-gray-100">
      <button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between p-5 bg-gray-50 hover:bg-gray-100 transition">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">{icon} {title}</h2>
        {isOpen ? <FaChevronUp className="text-gray-500" /> : <FaChevronDown className="text-gray-500" />}
      </button>
      {isOpen && <div className="p-6 border-t border-gray-100 animate-fadeIn">{children}</div>}
    </div>
  );
};

const EditHospital = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false); 

  const [newTest, setNewTest] = useState('');
  const [newTreatment, setNewTreatment] = useState('');
  const [newSurgery, setNewSurgery] = useState('');
  const [newProcedure, setNewProcedure] = useState('');
  const [newTherapy, setNewTherapy] = useState('');
  const [newManagement, setNewManagement] = useState('');
  const [newInsurance, setNewInsurance] = useState('');
  const [customFacility, setCustomFacility] = useState(''); 

  // Updated with photo field
  const [newDoctor, setNewDoctor] = useState({ 
    name: '', specialization: '', qualification: '', 
    experience: '', consultationFee: '', availability: '', 
    languages: '', photo: ''  // 👈 photo field added
  });
  const [newDepartment, setNewDepartment] = useState({ name: '', description: '', headDoctor: '' });
  const [newPackage, setNewPackage] = useState({ name: '', price: '', includedTests: '', duration: '' });
  const [newRoomType, setNewRoomType] = useState({ type: '', pricePerDay: '', facilities: '' });
  const [newAward, setNewAward] = useState('');
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', description: '' });

  const [formData, setFormData] = useState({
    name: '', category: 'Private', type: 'general', description: '', phone: '', email: '', website: '', themeColor: '#1E40AF',
    googlePlaceId: '', googleRating: 0, googleReviewCount: 0, establishedDate: '', 
    address: { street: '', area: '', city: '', state: '', pincode: '', landmark: '' },
    facilities: [], tests: [], treatments: [], surgeries: [], procedures: [], therapies: [], 
    managementServices: [], insuranceAccepted: [], numberOfBeds: 0,
    operatingHours: { monday: '9:00 AM - 5:00 PM', tuesday: '9:00 AM - 5:00 PM', wednesday: '9:00 AM - 5:00 PM', thursday: '9:00 AM - 5:00 PM', friday: '9:00 AM - 5:00 PM', saturday: '9:00 AM - 2:00 PM', sunday: 'Closed' },
    emergencyAvailable: false, images: [], services: [],
    doctors: [], departments: [], packages: [], roomTypes: [], announcements: [],
    emergencyDetails: { contactNumber: '', traumaCenter: false, ambulanceCount: 0, doctors24x7: false },
    staffAndManagement: { medicalDirector: '', chiefSurgeon: '', nursingHead: '', adminManager: '' },
    diagnosticCenterDetails: { labAvailable: false, nablCertified: false, reportTime: '', homeSampleCollection: false },
    documents: { nabhAccreditation: false, isoCertification: false, governmentApproval: false, awards: [] },
    socialMedia: { facebook: '', instagram: '', twitter: '', youtube: '' }
  });

  useEffect(() => { fetchHospital(); }, [id]);

  const fetchHospital = async () => {
    try {
      const res = await hospitalAPI.getById(id);
      const h = res.data.data;
      setFormData(prev => ({
        ...prev, ...h,
        establishedDate: h.establishedDate ? new Date(h.establishedDate).toISOString().split('T')[0] : '', 
        address: { ...prev.address, ...(h.address || {}) },
        emergencyDetails: { ...prev.emergencyDetails, ...(h.emergencyDetails || {}) },
        staffAndManagement: { ...prev.staffAndManagement, ...(h.staffAndManagement || {}) },
        diagnosticCenterDetails: { ...prev.diagnosticCenterDetails, ...(h.diagnosticCenterDetails || {}) },
        documents: { ...prev.documents, ...(h.documents || {}) },
        socialMedia: { ...prev.socialMedia, ...(h.socialMedia || {}) },
        doctors: h.doctors || [], packages: h.packages || [], roomTypes: h.roomTypes || [],
        departments: h.departments || [], announcements: h.announcements || []
      }));
    } catch (error) { alert('Failed to load hospital'); } finally { setLoading(false); }
  };

  const handleSyncGoogle = async () => {
    if (!formData.googlePlaceId) return alert("Please enter a Google Place ID first.");
    setSyncing(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_URL}/api/admin/fetch-place-details`, { placeId: formData.googlePlaceId }, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) {
        setFormData(prev => ({ ...prev, googleRating: res.data.data.googleRating, googleReviewCount: res.data.data.googleReviewCount }));
        alert("✅ Sync Successful!");
      }
    } catch (err) { alert("Failed to fetch from Google Places API."); } finally { setSyncing(false); }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.type || !formData.category) return alert('Name, Category, and Type are required!');
    if (!formData.address?.city || !formData.address?.state || !formData.address?.pincode) return alert('City, State, and PIN Code are required fields!');
    try {
      setSaving(true);
      const payload = { 
        ...formData, 
        website: formData.website || '',
        address: { 
          ...formData.address, 
          landmark: formData.address?.landmark || '' 
        },
        socialMedia: { 
          facebook: formData.socialMedia?.facebook || '', 
          instagram: formData.socialMedia?.instagram || '', 
          twitter: formData.socialMedia?.twitter || '', 
          youtube: formData.socialMedia?.youtube || '' 
        },
        staffAndManagement: { 
          medicalDirector: formData.staffAndManagement?.medicalDirector || '', 
          chiefSurgeon: formData.staffAndManagement?.chiefSurgeon || '', 
          nursingHead: formData.staffAndManagement?.nursingHead || '', 
          adminManager: formData.staffAndManagement?.adminManager || '' 
        },
        documents: {
          ...formData.documents,
          governmentApproval: formData.documents?.governmentApproval || false
        }
      };
      
      delete payload.services; 
      
      await hospitalAPI.update(id, payload);
      alert('✅ Hospital updated successfully!');
      navigate('/admin/hospitals');
    } catch (error) { 
      alert(error.response?.data?.message || 'Failed to save changes.'); 
    } finally { 
      setSaving(false); 
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this hospital? This cannot be undone!')) return;
    try { await hospitalAPI.delete(id); alert('✅ Hospital deleted'); navigate('/admin/hospitals'); } catch (error) { alert('Failed to delete hospital'); }
  };

  const handleAddArrayItem = (field, value, setter) => {
    if (value.trim()) {
      const items = value.split(',').map(item => item.trim()).filter(item => item && !formData[field].includes(item));
      if (items.length > 0) setFormData({ ...formData, [field]: [...formData[field], ...items] });
      setter(''); 
    }
  };

  const handleRemoveArrayItem = (field, index) => setFormData({ ...formData, [field]: formData[field].filter((_, i) => i !== index) });

  const handleAddComplexItem = (field, item, setter, defaultState) => {
    if (item.name || item.type || item.title) { 
      setFormData({ ...formData, [field]: [...formData[field], item] });
      setter(defaultState); // Reset with photo field included
    } else alert("Please fill the required primary name/title field.");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500"></div></div>;

  const categories = [ { label: 'Government', value: 'Government', icon: '🏛️' }, { label: 'Public', value: 'Public', icon: '🏥' }, { label: 'Private', value: 'Private', icon: '💼' }, { label: 'Charity/NGO', value: 'Charity', icon: '❤️' } ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/admin/hospitals')} className="text-gray-600 hover:text-blue-600"><FaArrowLeft className="text-xl" /></button>
            <div><h1 className="text-3xl font-bold text-gray-900">Edit Hospital</h1><p className="text-gray-500">{formData.name}</p></div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleDelete} className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition"><FaTrash /> Delete</button>
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50"><FaSave /> {saving ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-red-800">⚠️ <strong>Admin Note:</strong> To update Google Ratings, paste the Place ID and click the Sync button below.</p>
        </div>

        <div className="space-y-4">
          <FormSection title="Basic Information" icon="📝" defaultOpen={true}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {categories.map(cat => (
                  <button key={cat.value} type="button" onClick={() => setFormData({...formData, category: cat.value})} className={`flex items-center justify-center gap-2 py-3 px-4 border rounded-xl font-medium transition-all ${formData.category?.toLowerCase() === cat.value.toLowerCase() ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
                    <span>{cat.icon}</span> {cat.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Hospital Name *</label><input type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Hospital Type *</label><select value={formData.type || ''} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">{HOSPITAL_TYPES.filter(t => t.value !== 'all').map(type => <option key={type.value} value={type.value}>{type.icon} {type.label}</option>)}</select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone</label><input type="text" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2 border rounded-lg" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2 border rounded-lg" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Website</label><input type="text" value={formData.website || ''} onChange={e => setFormData({...formData, website: e.target.value})} className="w-full px-4 py-2 border rounded-lg" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Established Date</label><input type="date" value={formData.establishedDate || ''} onChange={(e) => setFormData({ ...formData, establishedDate: e.target.value })} max={new Date().toISOString().split('T')[0]} className="w-full px-4 py-2 border rounded-lg" /></div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Google Place ID (Optional)</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input type="text" value={formData.googlePlaceId || ''} onChange={e => setFormData({...formData, googlePlaceId: e.target.value})} className="flex-1 px-4 py-2 border rounded-lg" placeholder="ChIJ..." />
                  <button type="button" onClick={handleSyncGoogle} disabled={syncing || !formData.googlePlaceId} className="px-6 py-2 bg-blue-100 text-blue-700 font-bold rounded-lg disabled:opacity-50"><FaSync className={syncing ? "animate-spin" : ""} /> {syncing ? 'Fetching...' : 'Sync Ratings'}</button>
                </div>
              </div>

              <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} rows={4} className="w-full px-4 py-2 border rounded-lg" /></div>
            </div>
          </FormSection>

          <FormSection title="Address" icon="📍">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2"><CityStateSelector selectedState={formData.address?.state || ''} selectedCity={formData.address?.city || ''} onStateChange={(val) => setFormData({...formData, address: {...formData.address, state: val}})} onCityChange={(val) => setFormData({...formData, address: {...formData.address, city: val}})} /></div>
              <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label><input type="text" value={formData.address?.street || ''} onChange={e => setFormData({...formData, address: {...formData.address, street: e.target.value}})} className="w-full px-4 py-2 border rounded-lg" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Area</label><input type="text" value={formData.address?.area || ''} onChange={e => setFormData({...formData, address: {...formData.address, area: e.target.value}})} className="w-full px-4 py-2 border rounded-lg" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">PIN Code *</label><input type="text" value={formData.address?.pincode || ''} maxLength={6} onChange={e => setFormData({...formData, address: {...formData.address, pincode: e.target.value}})} className="w-full px-4 py-2 border rounded-lg" /></div>
              <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Landmark</label><input type="text" value={formData.address?.landmark || ''} onChange={e => setFormData({...formData, address: {...formData.address, landmark: e.target.value}})} className="w-full px-4 py-2 border rounded-lg" placeholder="Near YMCA Chowk..." /></div>
            </div>
          </FormSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormSection title="Theme Color" icon="🎨"><ThemeColorPicker value={formData.themeColor} onChange={(color) => setFormData({...formData, themeColor: color})} /></FormSection>
            <FormSection title="Photos" icon="📸"><ImageUploadManager images={formData.images || []} onImagesChange={(newImages) => setFormData({ ...formData, images: newImages })} maxImages={10} facilityId={id} facilityType="hospital" /></FormSection>
          </div>

          <FormSection title="Management, Certifications & Social" icon="👔">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h4 className="font-bold text-gray-800 border-b pb-2">Key Management</h4>
                <div><label className="text-xs">Medical Director</label><input type="text" value={formData.staffAndManagement?.medicalDirector || ''} onChange={e=>setFormData({...formData, staffAndManagement: {...formData.staffAndManagement, medicalDirector: e.target.value}})} className="w-full p-2 border rounded" /></div>
                <div><label className="text-xs">Chief Surgeon</label><input type="text" value={formData.staffAndManagement?.chiefSurgeon || ''} onChange={e=>setFormData({...formData, staffAndManagement: {...formData.staffAndManagement, chiefSurgeon: e.target.value}})} className="w-full p-2 border rounded" /></div>
                <div><label className="text-xs">Nursing Head</label><input type="text" value={formData.staffAndManagement?.nursingHead || ''} onChange={e=>setFormData({...formData, staffAndManagement: {...formData.staffAndManagement, nursingHead: e.target.value}})} className="w-full p-2 border rounded" /></div>
                <div><label className="text-xs">Admin Manager</label><input type="text" value={formData.staffAndManagement?.adminManager || ''} onChange={e=>setFormData({...formData, staffAndManagement: {...formData.staffAndManagement, adminManager: e.target.value}})} className="w-full p-2 border rounded" /></div>
              </div>
              <div className="space-y-3">
                <h4 className="font-bold text-gray-800 border-b pb-2">Certifications</h4>
                <label className="flex items-center gap-2"><input type="checkbox" checked={formData.documents?.nabhAccreditation || false} onChange={e=> setFormData({...formData, documents: {...formData.documents, nabhAccreditation: e.target.checked}})} className="w-4 h-4" /> NABH Accreditation</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={formData.documents?.isoCertification || false} onChange={e=> setFormData({...formData, documents: {...formData.documents, isoCertification: e.target.checked}})} className="w-4 h-4" /> ISO Certification</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={formData.documents?.governmentApproval || false} onChange={e=> setFormData({...formData, documents: {...formData.documents, governmentApproval: e.target.checked}})} className="w-4 h-4" /> Government Approved</label>
                <div className="mt-4">
                  <label className="text-xs font-bold text-gray-700">Add Award / Certification</label>
                  <div className="flex gap-2 mt-1">
                    <input type="text" value={newAward} onChange={e=>setNewAward(e.target.value)} onKeyDown={e => { if(e.key === 'Enter') { e.preventDefault(); document.getElementById('addAwardBtn').click(); } }} className="flex-1 p-2 border rounded shadow-sm focus:ring-2 focus:ring-blue-500" placeholder="Type award name" />
                    <button id="addAwardBtn" type="button" onClick={(e) => { e.preventDefault(); if (newAward.trim()) { const currentAwards = formData.documents?.awards || []; if(!currentAwards.includes(newAward.trim())){ setFormData({...formData, documents: { ...formData.documents, awards: [...currentAwards, newAward.trim()] }}); } setNewAward(''); } }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 font-bold rounded shadow transition">Add</button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.documents?.awards?.map((a, i) => (<span key={i} className="text-xs bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-full flex items-center gap-1">{a} <button type="button" onClick={(e)=> { e.preventDefault(); const newAw = formData.documents.awards.filter((_, idx)=>idx!==i); setFormData({...formData, documents: {...formData.documents, awards: newAw}}) }} className="text-red-500 font-black hover:text-red-700 ml-1 text-sm">×</button></span>))}
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-bold text-gray-800 border-b pb-2">Social Media Links</h4>
                <div><label className="text-xs">Facebook</label><input type="text" placeholder="https://..." value={formData.socialMedia?.facebook || ''} onChange={e=>setFormData({...formData, socialMedia: {...formData.socialMedia, facebook: e.target.value}})} className="w-full p-2 border rounded" /></div>
                <div><label className="text-xs">Instagram</label><input type="text" placeholder="https://..." value={formData.socialMedia?.instagram || ''} onChange={e=>setFormData({...formData, socialMedia: {...formData.socialMedia, instagram: e.target.value}})} className="w-full p-2 border rounded" /></div>
                <div><label className="text-xs">Twitter / X</label><input type="text" placeholder="https://..." value={formData.socialMedia?.twitter || ''} onChange={e=>setFormData({...formData, socialMedia: {...formData.socialMedia, twitter: e.target.value}})} className="w-full p-2 border rounded" /></div>
                <div><label className="text-xs">YouTube</label><input type="text" placeholder="https://..." value={formData.socialMedia?.youtube || ''} onChange={e=>setFormData({...formData, socialMedia: {...formData.socialMedia, youtube: e.target.value}})} className="w-full p-2 border rounded" /></div>
              </div>
            </div>
          </FormSection>

          <FormSection title="Doctors & Departments" icon="🧑‍⚕️">
            <div className="p-4 bg-blue-50 rounded-xl mb-6 border border-blue-100">
              <h4 className="font-bold mb-3 text-blue-800">Add New Doctor</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <input type="text" placeholder="Doctor Name *" value={newDoctor.name} onChange={e=>setNewDoctor({...newDoctor, name: e.target.value})} className="p-2 border rounded shadow-sm" />
                <input type="text" placeholder="Specialization (e.g. Cardiologist) *" value={newDoctor.specialization} onChange={e=>setNewDoctor({...newDoctor, specialization: e.target.value})} className="p-2 border rounded shadow-sm" />
                <input type="text" placeholder="Qualification (e.g. MBBS, MD)" value={newDoctor.qualification} onChange={e=>setNewDoctor({...newDoctor, qualification: e.target.value})} className="p-2 border rounded shadow-sm" />
                <input type="text" placeholder="Experience (e.g. 18 Years)" value={newDoctor.experience} onChange={e=>setNewDoctor({...newDoctor, experience: e.target.value})} className="p-2 border rounded shadow-sm" />
                <input type="number" placeholder="Consultation Fee (₹)" value={newDoctor.consultationFee} onChange={e=>setNewDoctor({...newDoctor, consultationFee: e.target.value})} className="p-2 border rounded shadow-sm" />
                <input type="text" placeholder="Availability / Timings" value={newDoctor.availability} onChange={e=>setNewDoctor({...newDoctor, availability: e.target.value})} className="p-2 border rounded shadow-sm" />
                
                {/* 👇 Doctor Photo Upload - Added before languages input */}
                <div className="md:col-span-3">
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Doctor Photo <span className="text-gray-400">(Optional)</span>
                  </label>
                  <DoctorPhotoUpload
                    value={newDoctor.photo}
                    onChange={(url) => setNewDoctor({ ...newDoctor, photo: url })}
                  />
                </div>

                {/* Existing languages input */}
                <input 
                  type="text" 
                  placeholder="Languages (e.g. English, Hindi)" 
                  value={newDoctor.languages} 
                  onChange={e => setNewDoctor({...newDoctor, languages: e.target.value})} 
                  className="p-2 border rounded shadow-sm md:col-span-3" 
                />
              </div>
              <button type="button" onClick={() => handleAddComplexItem('doctors', {...newDoctor, languages: newDoctor.languages.split(',').map(l=>l.trim())}, setNewDoctor, {name:'', specialization:'', qualification:'', experience:'', consultationFee:'', availability:'', languages:'', photo:''})} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition">Add Doctor</button>
            </div>
            
            <div className="space-y-2 mb-8">
              {formData.doctors?.map((d, i) => (
                <div key={i} className="flex justify-between items-center bg-white p-3 border rounded-lg shadow-sm">
                  <div className="flex items-center gap-3">
                    {d.photo ? <img src={d.photo} alt={d.name} className="w-10 h-10 rounded-full object-cover border-2 border-gray-100" /> : <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 font-bold text-xs border-2 border-blue-100">Dr.</div>}
                    <div><span className="font-bold text-gray-800">{d.name}</span> <span className="text-gray-600">({d.specialization})</span> - <span className="text-green-600 font-semibold">₹{d.consultationFee || 'N/A'}</span></div>
                  </div>
                  <button type="button" onClick={() => handleRemoveArrayItem('doctors', i)} className="text-red-500 font-bold hover:underline">Remove</button>
                </div>
              ))}
            </div>

            <div className="p-4 bg-purple-50 rounded-xl mb-4 border border-purple-100">
              <h4 className="font-bold mb-3 text-purple-800">Add Department</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <input type="text" placeholder="Department Name *" value={newDepartment.name} onChange={e=>setNewDepartment({...newDepartment, name: e.target.value})} className="p-2 border rounded shadow-sm" />
                <input type="text" placeholder="Head Doctor" value={newDepartment.headDoctor} onChange={e=>setNewDepartment({...newDepartment, headDoctor: e.target.value})} className="p-2 border rounded shadow-sm" />
                <input type="text" placeholder="Description" value={newDepartment.description} onChange={e=>setNewDepartment({...newDepartment, description: e.target.value})} className="p-2 border rounded shadow-sm md:col-span-3" />
              </div>
              <button type="button" onClick={() => handleAddComplexItem('departments', newDepartment, setNewDepartment, {name:'', description:'', headDoctor:''})} className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition">Add Department</button>
            </div>
            <div className="space-y-2">
              {formData.departments?.map((d, i) => (
                <div key={i} className="flex justify-between items-center bg-white p-3 border rounded-lg shadow-sm">
                  <div><span className="font-bold text-gray-800">{d.name}</span> {d.headDoctor && <span className="text-gray-600">(Head: {d.headDoctor})</span>}</div>
                  <button type="button" onClick={() => handleRemoveArrayItem('departments', i)} className="text-red-500 font-bold hover:underline">Remove</button>
                </div>
              ))}
            </div>
          </FormSection>

          <FormSection title="Room Types & Packages" icon="🛏️">
            <div className="p-4 bg-orange-50 rounded-xl mb-4 border border-orange-100">
              <h4 className="font-bold mb-3 text-orange-800">Add Room Type</h4>
              <div className="flex flex-wrap gap-3 mb-3">
                <input type="text" placeholder="Room Type (e.g. ICU) *" value={newRoomType.type} onChange={e=>setNewRoomType({...newRoomType, type: e.target.value})} className="flex-1 p-2 border rounded shadow-sm" />
                <input type="number" placeholder="Price/Day (₹)" value={newRoomType.pricePerDay} onChange={e=>setNewRoomType({...newRoomType, pricePerDay: e.target.value})} className="w-32 p-2 border rounded shadow-sm" />
                <input type="text" placeholder="Facilities (comma separated)" value={newRoomType.facilities} onChange={e=>setNewRoomType({...newRoomType, facilities: e.target.value})} className="w-full md:w-auto flex-1 p-2 border rounded shadow-sm" />
                <button type="button" onClick={() => handleAddComplexItem('roomTypes', {...newRoomType, facilities: newRoomType.facilities.split(',').map(f=>f.trim())}, setNewRoomType, {type:'', pricePerDay:'', facilities:''})} className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg transition">Add Room</button>
              </div>
            </div>
            <div className="space-y-2 mb-8">{formData.roomTypes?.map((r, i) => (<div key={i} className="flex justify-between items-center bg-white p-3 border rounded-lg shadow-sm"><div><span className="font-bold text-gray-800">{r.type}</span> - <span className="text-orange-600 font-semibold">₹{r.pricePerDay}</span></div><button type="button" onClick={() => handleRemoveArrayItem('roomTypes', i)} className="text-red-500 font-bold hover:underline">Remove</button></div>))}</div>

            <div className="p-4 bg-green-50 rounded-xl mb-4 border border-green-100">
              <h4 className="font-bold mb-3 text-green-800">Add Health Package</h4>
              <div className="flex flex-wrap gap-3 mb-3">
                <input type="text" placeholder="Package Name *" value={newPackage.name} onChange={e=>setNewPackage({...newPackage, name: e.target.value})} className="flex-1 p-2 border rounded shadow-sm" />
                <input type="number" placeholder="Price (₹)" value={newPackage.price} onChange={e=>setNewPackage({...newPackage, price: e.target.value})} className="w-32 p-2 border rounded shadow-sm" />
                <input type="text" placeholder="Duration" value={newPackage.duration} onChange={e=>setNewPackage({...newPackage, duration: e.target.value})} className="w-32 p-2 border rounded shadow-sm" />
                <input type="text" placeholder="Included Tests (comma separated)" value={newPackage.includedTests} onChange={e=>setNewPackage({...newPackage, includedTests: e.target.value})} className="w-full md:w-auto flex-1 p-2 border rounded shadow-sm" />
                <button type="button" onClick={() => handleAddComplexItem('packages', {...newPackage, includedTests: newPackage.includedTests.split(',').map(t=>t.trim())}, setNewPackage, {name:'', price:'', includedTests:'', duration:''})} className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition">Add Package</button>
              </div>
            </div>
            <div className="space-y-2">{formData.packages?.map((p, i) => (<div key={i} className="flex justify-between items-center bg-white p-3 border rounded-lg shadow-sm"><div><span className="font-bold text-gray-800">{p.name}</span> - <span className="text-green-600 font-semibold">₹{p.price}</span></div><button type="button" onClick={() => handleRemoveArrayItem('packages', i)} className="text-red-500 font-bold hover:underline">Remove</button></div>))}</div>
          </FormSection>

          <FormSection title="Emergency & Diagnostics" icon="🚑">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-bold text-red-600 mb-3">Emergency Services</h4>
                <label className="flex items-center gap-3 cursor-pointer p-3 bg-red-50 rounded-xl mb-4 border border-red-100"><input type="checkbox" checked={formData.emergencyAvailable} onChange={e => setFormData({...formData, emergencyAvailable: e.target.checked})} className="w-5 h-5 text-red-600 rounded" /><span className="font-bold text-red-700">24/7 Emergency Available</span></label>
                <div className="space-y-3">
                  <div><label className="text-sm font-medium">Emergency Contact Number</label><input type="text" value={formData.emergencyDetails?.contactNumber||''} onChange={e => setFormData({...formData, emergencyDetails: {...formData.emergencyDetails, contactNumber: e.target.value}})} className="w-full p-2 border rounded-lg" /></div>
                  <div><label className="text-sm font-medium">Ambulance Count</label><input type="number" value={formData.emergencyDetails?.ambulanceCount||''} onChange={e => setFormData({...formData, emergencyDetails: {...formData.emergencyDetails, ambulanceCount: e.target.value}})} className="w-full p-2 border rounded-lg" /></div>
                  <label className="flex items-center gap-2"><input type="checkbox" checked={formData.emergencyDetails?.traumaCenter||false} onChange={e=> setFormData({...formData, emergencyDetails: {...formData.emergencyDetails, traumaCenter: e.target.checked}})} className="w-4 h-4 text-blue-600 rounded" /> Trauma Center Available</label>
                  <label className="flex items-center gap-2"><input type="checkbox" checked={formData.emergencyDetails?.doctors24x7||false} onChange={e=> setFormData({...formData, emergencyDetails: {...formData.emergencyDetails, doctors24x7: e.target.checked}})} className="w-4 h-4 text-blue-600 rounded" /> 24/7 Doctors Available</label>
                </div>
              </div>
              <div>
                <h4 className="font-bold text-purple-600 mb-3">Diagnostic Center Details</h4>
                <label className="flex items-center gap-3 cursor-pointer p-3 bg-purple-50 rounded-xl mb-4 border border-purple-100"><input type="checkbox" checked={formData.diagnosticCenterDetails?.labAvailable||false} onChange={e => setFormData({...formData, diagnosticCenterDetails: {...formData.diagnosticCenterDetails, labAvailable: e.target.checked}})} className="w-5 h-5 text-purple-600 rounded" /><span className="font-bold text-purple-700">In-house Lab Available</span></label>
                <div className="space-y-3">
                  <div><label className="text-sm font-medium">Average Report Time</label><input type="text" placeholder="e.g. 24 Hours" value={formData.diagnosticCenterDetails?.reportTime||''} onChange={e => setFormData({...formData, diagnosticCenterDetails: {...formData.diagnosticCenterDetails, reportTime: e.target.value}})} className="w-full p-2 border rounded-lg" /></div>
                  <label className="flex items-center gap-2"><input type="checkbox" checked={formData.diagnosticCenterDetails?.nablCertified||false} onChange={e=> setFormData({...formData, diagnosticCenterDetails: {...formData.diagnosticCenterDetails, nablCertified: e.target.checked}})} className="w-4 h-4 text-blue-600 rounded" /> NABL Certified</label>
                  <label className="flex items-center gap-2"><input type="checkbox" checked={formData.diagnosticCenterDetails?.homeSampleCollection||false} onChange={e=> setFormData({...formData, diagnosticCenterDetails: {...formData.diagnosticCenterDetails, homeSampleCollection: e.target.checked}})} className="w-4 h-4 text-blue-600 rounded" /> Home Sample Collection</label>
                </div>
              </div>
            </div>
          </FormSection>

          <FormSection title="Announcements & Campaigns" icon="📢">
            <div className="p-4 bg-yellow-50 rounded-xl mb-4 border border-yellow-200">
              <h4 className="font-bold mb-3 text-yellow-800">Add Announcement (e.g. Free Blood Camp)</h4>
              <div className="flex flex-wrap gap-3 mb-3">
                <input type="text" placeholder="Title *" value={newAnnouncement.title} onChange={e=>setNewAnnouncement({...newAnnouncement, title: e.target.value})} className="w-1/3 p-2 border rounded shadow-sm" />
                <input type="text" placeholder="Description" value={newAnnouncement.description} onChange={e=>setNewAnnouncement({...newAnnouncement, description: e.target.value})} className="flex-1 p-2 border rounded shadow-sm" />
                <button type="button" onClick={() => handleAddComplexItem('announcements', newAnnouncement, setNewAnnouncement, {title:'', description:''})} className="px-5 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-bold rounded-lg transition">Post</button>
              </div>
            </div>
            <div className="space-y-2">{formData.announcements?.map((a, i) => (<div key={i} className="flex justify-between items-center bg-white p-3 border rounded-lg shadow-sm border-l-4 border-l-yellow-400"><div><span className="font-bold text-gray-800">{a.title}</span><p className="text-sm text-gray-600">{a.description}</p></div><button type="button" onClick={() => handleRemoveArrayItem('announcements', i)} className="text-red-500 font-bold hover:underline">Remove</button></div>))}</div>
          </FormSection>

          <FormSection title="General Facilities & Treatments" icon="🩺">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Facilities (Add comma separated)</label>
              <div className="flex gap-2 mb-3">
                <input type="text" value={customFacility} onChange={e => setCustomFacility(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddArrayItem('facilities', customFacility, setCustomFacility)} placeholder="Type facility name and press Enter" className="flex-1 px-4 py-2 border border-gray-300 rounded-lg" />
                <button type="button" onClick={() => handleAddArrayItem('facilities', customFacility, setCustomFacility)} className="px-6 py-2 bg-blue-600 text-white rounded-lg"><FaPlus /></button>
              </div>
              <div className="flex flex-wrap gap-2">{formData.facilities.map((item, i) => (<span key={i} className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-sm font-medium border border-gray-200">{item} <button type="button" onClick={() => handleRemoveArrayItem('facilities', i)} className="text-red-500 font-bold hover:text-red-700">×</button></span>))}</div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tests Available</label>
              <div className="flex gap-2 mb-3">
                <input type="text" value={newTest} onChange={e => setNewTest(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddArrayItem('tests', newTest, setNewTest)} placeholder="e.g., Blood Test, X-Ray" className="flex-1 px-4 py-2 border border-gray-300 rounded-lg" />
                <button type="button" onClick={() => handleAddArrayItem('tests', newTest, setNewTest)} className="px-6 py-2 bg-blue-600 text-white rounded-lg"><FaPlus /></button>
              </div>
              <div className="flex flex-wrap gap-2">{formData.tests.map((item, i) => (<span key={i} className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200">{item} <button type="button" onClick={() => handleRemoveArrayItem('tests', i)} className="text-red-500 font-bold hover:text-red-700">×</button></span>))}</div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Treatments</label>
              <div className="flex gap-2 mb-3">
                <input type="text" value={newTreatment} onChange={e => setNewTreatment(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddArrayItem('treatments', newTreatment, setNewTreatment)} placeholder="e.g., Diabetes Management" className="flex-1 px-4 py-2 border border-gray-300 rounded-lg" />
                <button type="button" onClick={() => handleAddArrayItem('treatments', newTreatment, setNewTreatment)} className="px-6 py-2 bg-green-600 text-white rounded-lg"><FaPlus /></button>
              </div>
              <div className="flex flex-wrap gap-2">{formData.treatments.map((item, i) => (<span key={i} className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-200">{item} <button type="button" onClick={() => handleRemoveArrayItem('treatments', i)} className="text-red-500 font-bold hover:text-red-700">×</button></span>))}</div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Surgeries</label>
              <div className="flex gap-2 mb-3">
                <input type="text" value={newSurgery} onChange={e => setNewSurgery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddArrayItem('surgeries', newSurgery, setNewSurgery)} placeholder="e.g., Cardiac Surgery, Endoscopy" className="flex-1 px-4 py-2 border border-gray-300 rounded-lg" />
                <button type="button" onClick={() => handleAddArrayItem('surgeries', newSurgery, setNewSurgery)} className="px-6 py-2 bg-red-600 text-white rounded-lg"><FaPlus /></button>
              </div>
              <div className="flex flex-wrap gap-2">{formData.surgeries.map((item, i) => (<span key={i} className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-700 rounded-full text-sm font-medium border border-red-200">{item} <button type="button" onClick={() => handleRemoveArrayItem('surgeries', i)} className="text-red-500 font-bold hover:text-red-700">×</button></span>))}</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Procedures</label>
                <div className="flex gap-2 mb-3"><input type="text" value={newProcedure} onChange={e => setNewProcedure(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddArrayItem('procedures', newProcedure, setNewProcedure)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg" /><button type="button" onClick={() => handleAddArrayItem('procedures', newProcedure, setNewProcedure)} className="px-4 py-2 bg-purple-600 text-white rounded-lg"><FaPlus /></button></div>
                <div className="flex flex-wrap gap-2">{formData.procedures.map((item, i) => (<span key={i} className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-xs font-medium border border-purple-200">{item} <button type="button" onClick={() => handleRemoveArrayItem('procedures', i)} className="text-red-500 font-bold">×</button></span>))}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Therapies</label>
                <div className="flex gap-2 mb-3"><input type="text" value={newTherapy} onChange={e => setNewTherapy(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddArrayItem('therapies', newTherapy, setNewTherapy)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg" /><button type="button" onClick={() => handleAddArrayItem('therapies', newTherapy, setNewTherapy)} className="px-4 py-2 bg-teal-600 text-white rounded-lg"><FaPlus /></button></div>
                <div className="flex flex-wrap gap-2">{formData.therapies.map((item, i) => (<span key={i} className="flex items-center gap-2 px-3 py-1.5 bg-teal-50 text-teal-700 rounded-full text-xs font-medium border border-teal-200">{item} <button type="button" onClick={() => handleRemoveArrayItem('therapies', i)} className="text-red-500 font-bold">×</button></span>))}</div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Management Services</label>
                <div className="flex gap-2 mb-3"><input type="text" value={newManagement} onChange={e => setNewManagement(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddArrayItem('managementServices', newManagement, setNewManagement)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg" /><button type="button" onClick={() => handleAddArrayItem('managementServices', newManagement, setNewManagement)} className="px-4 py-2 bg-orange-600 text-white rounded-lg"><FaPlus /></button></div>
                <div className="flex flex-wrap gap-2">{formData.managementServices.map((item, i) => (<span key={i} className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 text-orange-700 rounded-full text-xs font-medium border border-orange-200">{item} <button type="button" onClick={() => handleRemoveArrayItem('managementServices', i)} className="text-red-500 font-bold">×</button></span>))}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Insurance Accepted</label>
                <div className="flex gap-2 mb-3"><input type="text" value={newInsurance} onChange={e => setNewInsurance(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddArrayItem('insuranceAccepted', newInsurance, setNewInsurance)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg" /><button type="button" onClick={() => handleAddArrayItem('insuranceAccepted', newInsurance, setNewInsurance)} className="px-4 py-2 bg-green-600 text-white rounded-lg"><FaPlus /></button></div>
                <div className="flex flex-wrap gap-2">{formData.insuranceAccepted.map((item, i) => (<span key={i} className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-200">{item} <button type="button" onClick={() => handleRemoveArrayItem('insuranceAccepted', i)} className="text-red-500 font-bold">×</button></span>))}</div>
              </div>
            </div>
            <div className="border-t border-gray-200 pt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Number of Beds Available</label>
              <input type="number" value={formData.numberOfBeds || ''} onChange={(e) => setFormData({ ...formData, numberOfBeds: parseInt(e.target.value) || 0 })} min="0" className="w-1/3 px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
          </FormSection>

          <FormSection title="Working Hours" icon="🕐">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].map(day => (
                <div key={day}>
                  <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">{day}</label>
                  <input type="text" value={formData.operatingHours[day] || ''} onChange={e => setFormData({...formData, operatingHours: {...formData.operatingHours, [day]: e.target.value}})} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
              ))}
            </div>
          </FormSection>

          <FormSection title="Custom Services & Master Price List" icon="💰">
            <p className="text-sm text-gray-500 mb-4">Services added here with a price will show in the "Price List" tab.</p>
            <ServiceManager facilityId={id} facilityType="hospital" initialServices={formData.services} onUpdate={(services) => setFormData({...formData, services})} />
          </FormSection>

        </div>

        <div className="mt-8 flex justify-between">
          <button onClick={handleDelete} className="flex gap-2 px-8 py-3 bg-red-600 text-white rounded-xl font-bold shadow-lg"><FaTrash /> Delete Hospital</button>
          <button onClick={handleSave} disabled={saving} className="flex gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg"><FaSave /> {saving ? 'Saving...' : 'Save All Changes'}</button>
        </div>

      </div>
    </div>
  );
};

export default EditHospital;