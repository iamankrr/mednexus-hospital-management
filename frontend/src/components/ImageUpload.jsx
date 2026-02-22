import React, { useState } from 'react';
import { FaUpload, FaTrash, FaImage } from 'react-icons/fa';
import axios from 'axios';

const ImageUpload = ({ facilityType, facilityId, existingImages = [], onImagesUpdate }) => {
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState(existingImages);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = async (files) => {
    if (!files || files.length === 0) return;

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to upload images');
      return;
    }

    // Validate files
    const validFiles = Array.from(files).filter(file => {
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is too large (max 5MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setUploading(true);
    try {
      const formData = new FormData();
      validFiles.forEach(file => {
        formData.append('images', file);
      });

      const endpoint = facilityType === 'hospital'
        ? `http://localhost:3000/api/upload/hospital/${facilityId}`
        : `http://localhost:3000/api/upload/lab/${facilityId}`;

      const response = await axios.post(endpoint, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setImages(response.data.data.images);
        if (onImagesUpdate) {
          onImagesUpdate(response.data.data.images);
        }
        alert(`✅ ${validFiles.length} image(s) uploaded successfully!`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(error.response?.data?.message || 'Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imageUrl) => {
    if (!window.confirm('Delete this image?')) return;

    try {
      const token = localStorage.getItem('token');

      await axios.delete(
        `http://localhost:3000/api/upload/${facilityType}/${facilityId}/image`,
        {
          headers: { Authorization: `Bearer ${token}` },
          data: { imageUrl }
        }
      );

      const updatedImages = images.filter(img => img !== imageUrl);
      setImages(updatedImages);
      if (onImagesUpdate) onImagesUpdate(updatedImages);
      alert('Image deleted');
    } catch (error) {
      alert('Failed to delete image');
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Upload Area */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFileSelect(e.dataTransfer.files);
        }}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition ${
          dragOver
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-blue-400'
        }`}
      >
        <FaUpload className="text-4xl text-gray-400 mx-auto mb-3" />
        <p className="text-gray-700 font-semibold mb-2">
          Drag & drop images here
        </p>
        <p className="text-gray-500 text-sm mb-4">or</p>

        <label className="cursor-pointer">
          <span className={`px-6 py-3 rounded-lg font-semibold text-white transition ${
            uploading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}>
            {uploading ? '⏳ Uploading...' : '📁 Choose Images'}
          </span>
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={(e) => handleFileSelect(e.target.files)}
          />
        </label>

        <p className="text-xs text-gray-500 mt-3">
          Max 5 images • Max 5MB each • JPG, PNG, WEBP
        </p>
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-800 mb-3">
            Uploaded Images ({images.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((imageUrl, index) => (
              <div key={index} className="relative group rounded-lg overflow-hidden">
                <img
                  src={imageUrl}
                  alt={`Image ${index + 1}`}
                  className="w-full h-32 object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <button
                    onClick={() => handleDelete(imageUrl)}
                    className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                  >
                    <FaTrash />
                  </button>
                </div>
                {index === 0 && (
                  <span className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                    Main
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {images.length === 0 && (
        <div className="text-center py-6 text-gray-500">
          <FaImage className="text-4xl mx-auto mb-2 text-gray-300" />
          <p>No images uploaded yet</p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;