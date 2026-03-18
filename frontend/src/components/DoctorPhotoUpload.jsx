import React, { useState } from 'react';
import { FaUpload, FaTrash, FaUserMd } from 'react-icons/fa';
import axios from 'axios';
import API_URL from '../config/api';

const DoctorPhotoUpload = ({ value, onChange }) => {
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate
    if (!file.type.startsWith('image/')) {
      alert('Only image files allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Max file size is 5MB');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) { alert('Please login first'); return; }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file); // 'image' — matches backend's upload.single('image')

      const res = await axios.post(`${API_URL}/api/upload/image`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data.success) {
        onChange(res.data.url); // parent ko Cloudinary URL dedo
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    if (window.confirm('Remove doctor photo?')) onChange('');
  };

  return (
    <div className="flex items-center gap-3">
      
      {/* Preview */}
      <div className="w-16 h-16 rounded-full border-2 border-gray-200 overflow-hidden flex items-center justify-center bg-gray-50 shrink-0">
        {value 
          ? <img src={value} alt="Doctor" className="w-full h-full object-cover" />
          : <FaUserMd className="text-2xl text-gray-300" />
        }
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-1.5">
        <label className={`cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition ${uploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>
          <FaUpload className="text-[10px]" />
          {uploading ? 'Uploading...' : value ? 'Change Photo' : 'Upload Photo'}
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            className="hidden"
            disabled={uploading}
            onChange={handleFileSelect}
          />
        </label>

        {value && (
          <button
            type="button"
            onClick={handleRemove}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition"
          >
            <FaTrash className="text-[10px]" /> Remove
          </button>
        )}

        <p className="text-[10px] text-gray-400">JPG, PNG, WEBP • Max 5MB • Optional</p>
      </div>

    </div>
  );
};

export default DoctorPhotoUpload;