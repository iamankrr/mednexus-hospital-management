import React, { useState } from 'react';
import { FaUpload, FaTrash, FaImage, FaTimes } from 'react-icons/fa';
import axios from 'axios';

const ImageUploadManager = ({ 
  images = [], 
  onImagesChange, 
  maxImages = 10,
  facilityId,
  facilityType = 'hospital'
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    
    if (images.length + files.length > maxImages) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }
  
    try {
      setUploading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to upload images');
        return;
      }
  
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('image', file);
  
        const response = await axios.post(
          'http://localhost:3000/api/upload/image',
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        return response.data.url;
      });
  
      const uploadedUrls = await Promise.all(uploadPromises);
      const newImages = [...images, ...uploadedUrls];
      
      onImagesChange(newImages);
      alert(`✅ ${uploadedUrls.length} image(s) uploaded successfully!`);
    } catch (error) {
      console.error('Upload error:', error);
      
      if (error.response?.status === 401) {
        alert('Session expired. Please login again.');
      } else {
        alert('Failed to upload images. Please try again.');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = (index) => {
    if (window.confirm('Delete this image?')) {
      const newImages = images.filter((_, i) => i !== index);
      onImagesChange(newImages);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="block text-sm font-medium text-gray-700">
          📸 Photos ({images.length}/{maxImages})
        </label>
        {images.length < maxImages && (
          <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition text-sm font-medium">
            <FaUpload />
            Upload Images
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        )}
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-700">Uploading...</span>
            {/* Kept progress for UI consistency, though Promise.all fetches it simultaneously now */}
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2 animate-pulse">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300 w-full"
            />
          </div>
        </div>
      )}

      {/* Image Grid */}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((url, index) => (
            <div key={index} className="relative group rounded-lg overflow-hidden border border-gray-200">
              <img
                src={url}
                alt={`Upload ${index + 1}`}
                className="w-full h-32 object-cover"
              />
              {/* Delete Button */}
              <button
                onClick={() => handleDeleteImage(index)}
                className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-red-600"
                title="Delete image"
              >
                <FaTrash className="text-xs" />
              </button>
              {/* Index Badge */}
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white px-2 py-0.5 rounded text-xs font-medium">
                #{index + 1}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
          <FaImage className="text-5xl text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-2">No images uploaded yet</p>
          <p className="text-sm text-gray-400">Click "Upload Images" to add photos</p>
        </div>
      )}
    </div>
  );
};

export default ImageUploadManager;