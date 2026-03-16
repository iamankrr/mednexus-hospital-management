import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaHospital, FaMapMarkerAlt, FaPhone, FaStar, FaSearch,
  FaUserMd, FaFlask, FaCut, FaPills, FaProcedures, FaSpa,
  FaClipboardList, FaBed, FaShieldAlt, FaCalendarCheck
} from 'react-icons/fa';
import Footer from '../components/Footer';
import API_URL from '../config/api';

const EnhancedHospitalDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tests');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchHospitalDetails();
  }, [id]);

  const fetchHospitalDetails = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/hospitals/${id}`);
      setHospital(response.data.data);
    } catch (error) {
      console.error('Error fetching hospital:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = (doctorId = null) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in to book an appointment!');
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      navigate('/login');
      return;
    }
    
    // Direct to booking page with specific doctor ID if clicked from Doctor Card
    const url = `/appointments/book?hospital=${hospital._id}${doctorId ? `&doctor=${doctorId}` : ''}`;
    navigate(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Hospital not found</p>
      </div>
    );
  }

  const categories = [
    { id: 'tests', name: 'Tests', icon: FaFlask, count: hospital.tests?.length || 0 },
    { id: 'treatments', name: 'Treatment', icon: FaPills, count: hospital.treatments?.length || 0 },
    { id: 'surgeries', name: 'Surgery', icon: FaCut, count: hospital.surgeries?.length || 0 },
    { id: 'procedures', name: 'Procedures', icon: FaProcedures, count: hospital.procedures?.length || 0 },
    { id: 'therapies', name: 'Therapy', icon: FaSpa, count: hospital.therapies?.length || 0 },
    { id: 'management', name: 'Management', icon: FaClipboardList, count: hospital.managementServices?.length || 0 },
    { id: 'facilities', name: 'Facilities', icon: FaHospital, count: hospital.facilities?.length || 0 },
    { id: 'doctors', name: 'Doctors', icon: FaUserMd, count: hospital.doctors?.length || 0 },
    { id: 'insurance', name: 'Insurance', icon: FaShieldAlt, count: hospital.insuranceAccepted?.length || 0 },
    { id: 'beds', name: 'No of Beds', icon: FaBed, count: hospital.numberOfBeds || 0 }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'tests':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6">Tests</h2>
            {hospital.tests && hospital.tests.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {hospital.tests.map((test, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <span className="text-green-600 text-xl">✓</span>
                    <span className="text-gray-900">{test.name || test}</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-gray-500">No tests available</p>}
          </div>
        );

      case 'treatments':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6">Treatment</h2>
            {hospital.treatments && hospital.treatments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {hospital.treatments.map((treatment, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <span className="text-green-600 text-xl">✓</span>
                    <span className="text-gray-900">{treatment}</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-gray-500">No treatments available</p>}
          </div>
        );

      case 'surgeries':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6">Surgery</h2>
            {hospital.surgeries && hospital.surgeries.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {hospital.surgeries.map((surgery, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <span className="text-green-600 text-xl">✓</span>
                    <span className="text-gray-900">{surgery}</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-gray-500">No surgeries available</p>}
          </div>
        );

      case 'procedures':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6">Procedures</h2>
            {hospital.procedures && hospital.procedures.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {hospital.procedures.map((procedure, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <span className="text-green-600 text-xl">✓</span>
                    <span className="text-gray-900">{procedure}</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-gray-500">No procedures available</p>}
          </div>
        );

      case 'therapies':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6">Therapy</h2>
            {hospital.therapies && hospital.therapies.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {hospital.therapies.map((therapy, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <span className="text-green-600 text-xl">✓</span>
                    <span className="text-gray-900">{therapy}</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-gray-500">No therapies available</p>}
          </div>
        );

      case 'management':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6">Management</h2>
            {hospital.managementServices && hospital.managementServices.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {hospital.managementServices.map((service, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <span className="text-green-600 text-xl">✓</span>
                    <span className="text-gray-900">{service}</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-gray-500">No management services available</p>}
          </div>
        );

      case 'facilities':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6">Facilities</h2>
            {hospital.facilities && hospital.facilities.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {hospital.facilities.map((facility, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                    <span className="text-blue-600 text-xl">✓</span>
                    <span className="text-gray-900">{facility}</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-gray-500">No facilities available</p>}
          </div>
        );

      case 'doctors':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6">Our Specialists</h2>
            {hospital.doctors && hospital.doctors.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hospital.doctors.map((doctor, idx) => (
                  <div key={idx} className="bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-all overflow-hidden flex flex-col h-full">
                    
                    {/* Doctor Photo Section */}
                    <div className="h-32 flex items-end justify-center relative bg-gradient-to-b from-blue-50 to-blue-100">
                       {doctor.photo ? (
                         <img src={doctor.photo} alt={doctor.name} className="w-24 h-24 rounded-full object-cover border-4 border-white absolute -bottom-12 shadow-sm" />
                       ) : (
                         <div className="w-24 h-24 rounded-full bg-white border-4 border-gray-100 flex items-center justify-center absolute -bottom-12 shadow-sm">
                           <FaUserMd className="text-4xl text-gray-300" />
                         </div>
                       )}
                    </div>
                    
                    {/* Doctor Info */}
                    <div className="pt-16 p-5 flex-1 flex flex-col text-center">
                      <h3 className="text-xl font-bold text-gray-900">{doctor.name}</h3>
                      <p className="text-sm font-bold text-blue-600 mb-2">{doctor.specialization}</p>
                      
                      <div className="text-sm text-gray-600 space-y-1 mb-4">
                        {doctor.qualification && <p>🎓 {doctor.qualification}</p>}
                        {doctor.experience && <p>⭐ {doctor.experience} Experience</p>}
                        {doctor.languages?.length > 0 && <p>🗣️ {doctor.languages.join(', ')}</p>}
                      </div>
                      
                      {/* Fees & Timing (Fallback included for old data) */}
                      <div className="mt-auto border-t border-gray-100 pt-4 flex justify-between items-center px-2 pb-4">
                         <div className="text-left">
                           <p className="text-[10px] text-gray-500 uppercase font-bold">OPD Timing</p>
                           <p className="text-sm font-semibold text-gray-800">{doctor.availability || doctor.opdTiming || 'Contact Hospital'}</p>
                         </div>
                         <div className="text-right">
                           <p className="text-[10px] text-gray-500 uppercase font-bold">Consultation</p>
                           <p className="text-lg font-black text-green-600">
                             {doctor.consultationFee || doctor.fees ? `₹${doctor.consultationFee || doctor.fees}` : 'N/A'}
                           </p>
                         </div>
                      </div>

                      {/* Direct Book Appointment Button */}
                      <button 
                        onClick={() => handleBookAppointment(doctor._id)} 
                        disabled={!hospital.appointmentsEnabled}
                        className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {hospital.appointmentsEnabled ? 'Book Appointment' : 'Booking Unavailable'}
                      </button>

                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-gray-500">No doctors available</p>}
          </div>
        );

      case 'insurance':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6">Insurance Accepted</h2>
            {hospital.insuranceAccepted && hospital.insuranceAccepted.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {hospital.insuranceAccepted.map((insurance, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-4 bg-green-50 rounded-lg border border-green-200">
                    <FaShieldAlt className="text-green-600 text-xl" />
                    <span className="text-gray-900 font-medium">{insurance}</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-gray-500">No insurance information available</p>}
          </div>
        );

      case 'beds':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6">No of Beds</h2>
            <div className="p-6 bg-blue-50 rounded-xl border border-blue-200 inline-block">
              <div className="flex items-center gap-4">
                <FaBed className="text-4xl text-blue-600" />
                <div>
                  <p className="text-4xl font-bold text-blue-900">{hospital.numberOfBeds || 0}</p>
                  <p className="text-gray-600">Total Beds</p>
                </div>
              </div>
            </div>
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
            <button onClick={() => navigate(-1)} className="text-blue-600 hover:text-blue-700 mb-4 flex items-center gap-2">← Back</button>
            
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <FaHospital className="text-4xl text-blue-600 mt-1" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{hospital.name}</h1>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2"><FaMapMarkerAlt className="text-blue-500" /><span>{hospital.address?.city}, {hospital.address?.state}</span></div>
                    <div className="flex items-center gap-2"><FaPhone className="text-green-500" /><span>{hospital.phone}</span></div>
                    {hospital.googleRating > 0 && (
                      <div className="flex items-center gap-2"><FaStar className="text-yellow-500" /><span className="font-semibold">{hospital.googleRating}</span></div>
                    )}
                  </div>
                </div>
              </div>

              {hospital.owner && hospital.appointmentsEnabled && (
                <button
                  onClick={() => handleBookAppointment()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition flex items-center gap-2 whitespace-nowrap"
                >
                  <FaCalendarCheck /> Book General Appointment
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
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
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setActiveTab(category.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition ${
                        activeTab === category.id ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-2"><category.icon className="text-lg" /><span>{category.name}</span></div>
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

export default EnhancedHospitalDetails;