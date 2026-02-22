import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaHospital } from 'react-icons/fa';

const RegistrationChoice = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-4xl w-full">
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Create Account</h1>
          <p className="text-gray-600 text-lg">Choose how you want to register</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          
          <div 
            onClick={() => navigate('/register/user')}
            className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition cursor-pointer transform hover:scale-105 border-2 border-transparent hover:border-blue-500"
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaUser className="text-4xl text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Register as User</h2>
              <p className="text-gray-600 mb-6">
                Book appointments, compare hospitals & labs, leave reviews
              </p>
              <button className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition">
                Continue as User
              </button>
            </div>
          </div>

          <div 
            onClick={() => navigate('/register/owner')}
            className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition cursor-pointer transform hover:scale-105 border-2 border-transparent hover:border-green-500"
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaHospital className="text-4xl text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Register as Owner</h2>
              <p className="text-gray-600 mb-6">
                Manage your hospital or laboratory, update services & prices
              </p>
              <button className="w-full px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition">
                Continue as Owner
              </button>
            </div>
          </div>

        </div>

        <div className="text-center mt-8">
          <p className="text-gray-600">
            Already have an account?{' '}
            <button 
              onClick={() => navigate('/login')}
              className="text-blue-600 font-semibold hover:underline"
            >
              Sign In
            </button>
          </p>
        </div>

      </div>
    </div>
  );
};

export default RegistrationChoice;