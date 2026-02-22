import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHospital, FaFlask } from 'react-icons/fa';

const SubmitFacility = () => {
  const navigate = useNavigate();
  const [facilityType, setFacilityType] = useState('');

  const handleSelect = (type) => {
    if (type === 'hospital') {
      navigate('/submit-hospital');
    } else {
      navigate('/submit-lab');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Submit a Facility</h1>
          <p className="text-gray-600 mb-8">
            Help others find great healthcare facilities by submitting a hospital or lab
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => handleSelect('hospital')}
              className="p-8 border-2 border-gray-300 rounded-2xl hover:border-blue-600 hover:bg-blue-50 transition"
            >
              <FaHospital className="text-6xl text-blue-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Hospital</h2>
              <p className="text-sm text-gray-600">Submit a hospital for review</p>
            </button>

            <button
              onClick={() => handleSelect('laboratory')}
              className="p-8 border-2 border-gray-300 rounded-2xl hover:border-purple-600 hover:bg-purple-50 transition"
            >
              <FaFlask className="text-6xl text-purple-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Laboratory</h2>
              <p className="text-sm text-gray-600">Submit a diagnostic lab for review</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmitFacility;