import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaHeart, FaArrowLeft } from 'react-icons/fa';
// ✅ Navbar ka import hata diya gaya hai kyuki wo App.jsx me pehle se hai
import Footer from '../components/Footer';
import HospitalCard from '../components/HospitalCard';
import LabCard from '../components/LabCard';

const Favorites = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState({
    hospitals: [],
    laboratories: []
  });
  const [activeTab, setActiveTab] = useState('hospitals');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get('http://localhost:3000/api/favorites', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      console.log('Favorites response:', response.data);
      setFavorites(response.data.data);
    } catch (error) {
      console.error('Fetch favorites error:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (facilityId, facilityType) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:3000/api/favorites/remove',
        { facilityId, facilityType },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      // Update local state
      setFavorites(prev => ({
        ...prev,
        [facilityType === 'hospital' ? 'hospitals' : 'laboratories']: 
          prev[facilityType === 'hospital' ? 'hospitals' : 'laboratories']
            .filter(item => item._id !== facilityId)
      }));

      alert('✅ Removed from favorites');
    } catch (error) {
      console.error('Remove favorite error:', error);
      alert('Failed to remove from favorites');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ✅ Navbar tag yahan se completely hata diya gaya hai */}

      <div className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium"
        >
          <FaArrowLeft /> Back to Home
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <FaHeart className="text-red-500" /> My Favorites
          </h1>
          <p className="text-gray-600">Your saved hospitals and laboratories</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('hospitals')}
            className={`px-6 py-3 rounded-lg font-bold transition ${
              activeTab === 'hospitals'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Hospitals ({favorites.hospitals?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('laboratories')}
            className={`px-6 py-3 rounded-lg font-bold transition ${
              activeTab === 'laboratories'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Laboratories ({favorites.laboratories?.length || 0})
          </button>
        </div>

        {/* Content */}
        {activeTab === 'hospitals' && (
          <div>
            {favorites.hospitals && favorites.hospitals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.hospitals.map((hospital) => (
                  <div key={hospital._id} className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFavorite(hospital._id, 'hospital');
                      }}
                      className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                    >
                      <FaHeart className="text-xl text-red-500 fill-current" />
                    </button>
                    <HospitalCard hospital={hospital} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                <FaHeart className="text-6xl text-gray-300 mx-auto mb-4" />
                <p className="text-xl text-gray-500 mb-4">No favorite hospitals yet</p>
                <button
                  onClick={() => navigate('/hospitals')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition"
                >
                  Browse Hospitals
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'laboratories' && (
          <div>
            {favorites.laboratories && favorites.laboratories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.laboratories.map((lab) => (
                  <div key={lab._id} className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFavorite(lab._id, 'laboratory');
                      }}
                      className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                    >
                      <FaHeart className="text-xl text-red-500 fill-current" />
                    </button>
                    <LabCard lab={lab} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                <FaHeart className="text-6xl text-gray-300 mx-auto mb-4" />
                <p className="text-xl text-gray-500 mb-4">No favorite laboratories yet</p>
                <button
                  onClick={() => navigate('/labs')}
                  className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition"
                >
                  Browse Labs
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Favorites;