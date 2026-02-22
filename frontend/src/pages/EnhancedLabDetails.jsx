// Copy EnhancedHospitalDetails.jsx and modify:
// 1. Change API endpoint to labs
// 2. Change FaHospital to FaFlask
// 3. Change colors from blue to purple
// 4. Remove surgery/procedures tabs (keep only relevant for labs)

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaFlask, 
  FaMapMarkerAlt, 
  FaPhone, 
  FaStar,
  FaSearch,
  FaUserMd,
  FaPills,
  FaSpa,
  FaClipboardList,
  FaShieldAlt,
  FaCalendarCheck
} from 'react-icons/fa';
import Footer from '../components/Footer';

const EnhancedLabDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lab, setLab] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tests');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLabDetails();
  }, [id]);

  const fetchLabDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/labs/${id}`);
      setLab(response.data.data);
    } catch (error) {
      console.error('Error fetching lab:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500"></div>
      </div>
    );
  }

  if (!lab) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Lab not found</p>
      </div>
    );
  }

  // Lab-specific categories (no surgery)
  const categories = [
    { id: 'tests', name: 'Tests', icon: FaFlask, count: lab.tests?.length || 0 },
    { id: 'treatments', name: 'Treatment', icon: FaPills, count: lab.treatments?.length || 0 },
    { id: 'procedures', name: 'Procedures', icon: FaClipboardList, count: lab.procedures?.length || 0 },
    { id: 'management', name: 'Management', icon: FaClipboardList, count: lab.managementServices?.length || 0 },
    { id: 'facilities', name: 'Facilities', icon: FaFlask, count: lab.facilities?.length || 0 },
    { id: 'technicians', name: 'Technicians', icon: FaUserMd, count: lab.doctors?.length || 0 }, // Reuse doctors field for technicians
    { id: 'insurance', name: 'Insurance', icon: FaShieldAlt, count: lab.insuranceAccepted?.length || 0 }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'tests':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6">Laboratory Tests</h2>
            {lab.tests && lab.tests.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {lab.tests.map((test, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <span className="text-purple-600 text-xl">✓</span>
                    <span className="text-gray-900">{test.name || test}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No tests available</p>
            )}
          </div>
        );

      case 'treatments':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6">Treatment Services</h2>
            {lab.treatments && lab.treatments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {lab.treatments.map((treatment, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                    <span className="text-green-600 text-xl">✓</span>
                    <span className="text-gray-900">{treatment}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No treatments available</p>
            )}
          </div>
        );

      case 'procedures':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6">Procedures</h2>
            {lab.procedures && lab.procedures.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {lab.procedures.map((procedure, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                    <span className="text-blue-600 text-xl">✓</span>
                    <span className="text-gray-900">{procedure}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No procedures available</p>
            )}
          </div>
        );

      case 'management':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6">Management Services</h2>
            {lab.managementServices && lab.managementServices.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lab.managementServices.map((service, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
                    <span className="text-orange-600 text-xl">✓</span>
                    <span className="text-gray-900">{service}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No management services available</p>
            )}
          </div>
        );

      case 'facilities':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6">Lab Facilities</h2>
            {lab.facilities && lab.facilities.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {lab.facilities.map((facility, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <span className="text-purple-600 text-xl">✓</span>
                    <span className="text-gray-900">{facility}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No facilities available</p>
            )}
          </div>
        );

      case 'technicians':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6">Lab Technicians in {lab.name}</h2>
            {lab.doctors && lab.doctors.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {lab.doctors.map((tech, idx) => (
                  <div key={idx} className="bg-white rounded-xl shadow-md overflow-hidden border border-purple-200 hover:shadow-lg transition">
                    <div className="h-48 bg-gradient-to-br from-purple-100 to-purple-200">
                      {tech.photo ? (
                        <img src={tech.photo} alt={tech.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FaUserMd className="text-6xl text-purple-400" />
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 mb-1">{tech.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{tech.specialization}</p>
                      
                      {tech.rating > 0 && (
                        <div className="flex items-center gap-1 mb-2">
                          <span className="font-bold text-gray-900">{tech.rating}</span>
                          <FaStar className="text-yellow-500 text-sm" />
                        </div>
                      )}

                      {tech.experience && (
                        <p className="text-xs text-gray-500 mb-3">Experience: {tech.experience}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No technicians available</p>
            )}
          </div>
        );

      case 'insurance':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6">Insurance Accepted</h2>
            {lab.insuranceAccepted && lab.insuranceAccepted.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {lab.insuranceAccepted.map((insurance, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-4 bg-green-50 rounded-lg border border-green-200">
                    <FaShieldAlt className="text-green-600 text-xl" />
                    <span className="text-gray-900 font-medium">{insurance}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No insurance information available</p>
            )}
          </div>
        );

      default:
        return <p className="text-gray-500">Select a category</p>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <button
              onClick={() => navigate(-1)}
              className="text-purple-600 hover:text-purple-700 mb-4 flex items-center gap-2"
            >
              ← Back
            </button>
            
            <div className="flex items-start gap-4">
              <FaFlask className="text-4xl text-purple-600 mt-1" />
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{lab.name}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <FaMapMarkerAlt className="text-purple-500" />
                    <span>{lab.address?.city}, {lab.address?.state}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaPhone className="text-green-500" />
                    <span>{lab.phone}</span>
                  </div>
                  {lab.googleRating > 0 && (
                    <div className="flex items-center gap-2">
                      <FaStar className="text-yellow-500" />
                      <span className="font-semibold">{lab.googleRating}</span>
                    </div>
                  )}
                </div>
              </div>

              {lab.owner && lab.appointmentsEnabled && (
                <button
                  onClick={() => navigate(`/appointments/book?lab=${lab._id}`)}
                  className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition flex items-center gap-2"
                >
                  <FaCalendarCheck /> Book Test
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content - Same layout as hospital */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Left Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-md p-4 sticky top-4">
                <div className="relative mb-4">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search Services"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="space-y-1">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setActiveTab(category.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition ${
                        activeTab === category.id
                          ? 'bg-purple-100 text-purple-700 font-semibold'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <category.icon className="text-lg" />
                        <span>{category.name}</span>
                      </div>
                      <span className="text-sm">({category.count})</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl shadow-md p-6">
                {renderContent()}
              </div>
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default EnhancedLabDetails;