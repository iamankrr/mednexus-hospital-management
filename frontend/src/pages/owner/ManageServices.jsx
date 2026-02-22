import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaPlus, 
  FaTrash, 
  FaSave,
  FaFlask,
  FaPills,
  FaCut,
  FaSpa,
  FaUserMd,
  FaShieldAlt,
  FaBed
} from 'react-icons/fa';

const ManageServices = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [facility, setFacility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [tests, setTests] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [surgeries, setSurgeries] = useState([]);
  const [procedures, setProcedures] = useState([]);
  const [therapies, setTherapies] = useState([]);
  const [managementServices, setManagementServices] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [insuranceAccepted, setInsuranceAccepted] = useState([]);
  const [numberOfBeds, setNumberOfBeds] = useState(0);

  // Input states
  const [newTest, setNewTest] = useState('');
  const [newTreatment, setNewTreatment] = useState('');
  const [newSurgery, setNewSurgery] = useState('');
  const [newProcedure, setNewProcedure] = useState('');
  const [newTherapy, setNewTherapy] = useState('');
  const [newManagement, setNewManagement] = useState('');
  const [newInsurance, setNewInsurance] = useState('');

  // Doctor form
  const [showDoctorForm, setShowDoctorForm] = useState(false);
  const [doctorForm, setDoctorForm] = useState({
    name: '',
    photo: '',
    specialization: '',
    rating: 0,
    experience: '',
    qualification: '',
    availability: '',
    consultationFee: 0
  });

  useEffect(() => {
    fetchFacility();
  }, []);

  const fetchFacility = async () => {
    try {
      const token = localStorage.getItem('token');
      const facilityType = user.ownerProfile.facilityType;
      const facilityId = user.ownerProfile.facilityId;

      const endpoint = facilityType === 'hospital' 
        ? `http://localhost:3000/api/hospitals/${facilityId}`
        : `http://localhost:3000/api/labs/${facilityId}`;

      const response = await axios.get(endpoint, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = response.data.data;
      setFacility(data);

      // Set existing data
      setTests(data.tests || []);
      setTreatments(data.treatments || []);
      setSurgeries(data.surgeries || []);
      setProcedures(data.procedures || []);
      setTherapies(data.therapies || []);
      setManagementServices(data.managementServices || []);
      setDoctors(data.doctors || []);
      setInsuranceAccepted(data.insuranceAccepted || []);
      setNumberOfBeds(data.numberOfBeds || 0);

    } catch (error) {
      console.error('Fetch facility error:', error);
      alert('Failed to load facility data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const facilityType = user.ownerProfile.facilityType;
      const facilityId = user.ownerProfile.facilityId;

      const endpoint = facilityType === 'hospital'
        ? `http://localhost:3000/api/hospitals/${facilityId}`
        : `http://localhost:3000/api/labs/${facilityId}`;

      const updateData = {
        tests,
        treatments,
        surgeries,
        procedures,
        therapies,
        managementServices,
        doctors,
        insuranceAccepted,
        numberOfBeds
      };

      await axios.put(endpoint, updateData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      alert('✅ Services updated successfully!');
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update services');
    } finally {
      setSaving(false);
    }
  };

  // Add functions
  const addTest = () => {
    if (newTest.trim()) {
      setTests([...tests, newTest.trim()]);
      setNewTest('');
    }
  };

  const addTreatment = () => {
    if (newTreatment.trim()) {
      setTreatments([...treatments, newTreatment.trim()]);
      setNewTreatment('');
    }
  };

  const addSurgery = () => {
    if (newSurgery.trim()) {
      setSurgeries([...surgeries, newSurgery.trim()]);
      setNewSurgery('');
    }
  };

  const addProcedure = () => {
    if (newProcedure.trim()) {
      setProcedures([...procedures, newProcedure.trim()]);
      setNewProcedure('');
    }
  };

  const addTherapy = () => {
    if (newTherapy.trim()) {
      setTherapies([...therapies, newTherapy.trim()]);
      setNewTherapy('');
    }
  };

  const addManagement = () => {
    if (newManagement.trim()) {
      setManagementServices([...managementServices, newManagement.trim()]);
      setNewManagement('');
    }
  };

  const addInsurance = () => {
    if (newInsurance.trim()) {
      setInsuranceAccepted([...insuranceAccepted, newInsurance.trim()]);
      setNewInsurance('');
    }
  };

  const addDoctor = () => {
    if (doctorForm.name && doctorForm.specialization) {
      setDoctors([...doctors, { ...doctorForm }]);
      setDoctorForm({
        name: '',
        photo: '',
        specialization: '',
        rating: 0,
        experience: '',
        qualification: '',
        availability: '',
        consultationFee: 0
      });
      setShowDoctorForm(false);
    }
  };

  // Remove functions
  const removeTest = (index) => setTests(tests.filter((_, i) => i !== index));
  const removeTreatment = (index) => setTreatments(treatments.filter((_, i) => i !== index));
  const removeSurgery = (index) => setSurgeries(surgeries.filter((_, i) => i !== index));
  const removeProcedure = (index) => setProcedures(procedures.filter((_, i) => i !== index));
  const removeTherapy = (index) => setTherapies(therapies.filter((_, i) => i !== index));
  const removeManagement = (index) => setManagementServices(managementServices.filter((_, i) => i !== index));
  const removeInsurance = (index) => setInsuranceAccepted(insuranceAccepted.filter((_, i) => i !== index));
  const removeDoctor = (index) => setDoctors(doctors.filter((_, i) => i !== index));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Services</h1>
            <p className="text-gray-600">{facility?.name}</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 disabled:opacity-50"
          >
            <FaSave /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        <div className="space-y-6">
          
          {/* Tests */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <FaFlask className="text-2xl text-blue-600" />
              <h2 className="text-xl font-bold">Tests ({tests.length})</h2>
            </div>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newTest}
                onChange={(e) => setNewTest(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTest()}
                placeholder="Add new test (e.g., Blood Test, X-Ray)"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              />
              <button
                onClick={addTest}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
              >
                <FaPlus />
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {tests.map((test, idx) => (
                <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
                  <span>{test}</span>
                  <button
                    onClick={() => removeTest(idx)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTrash className="text-sm" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Treatments */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <FaPills className="text-2xl text-green-600" />
              <h2 className="text-xl font-bold">Treatments ({treatments.length})</h2>
            </div>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newTreatment}
                onChange={(e) => setNewTreatment(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTreatment()}
                placeholder="Add new treatment"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              />
              <button
                onClick={addTreatment}
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700"
              >
                <FaPlus />
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {treatments.map((treatment, idx) => (
                <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg">
                  <span>{treatment}</span>
                  <button
                    onClick={() => removeTreatment(idx)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTrash className="text-sm" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Surgeries */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <FaCut className="text-2xl text-red-600" />
              <h2 className="text-xl font-bold">Surgeries ({surgeries.length})</h2>
            </div>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newSurgery}
                onChange={(e) => setNewSurgery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addSurgery()}
                placeholder="Add new surgery"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              />
              <button
                onClick={addSurgery}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700"
              >
                <FaPlus />
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {surgeries.map((surgery, idx) => (
                <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-lg">
                  <span>{surgery}</span>
                  <button
                    onClick={() => removeSurgery(idx)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTrash className="text-sm" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Procedures */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <FaCut className="text-2xl text-purple-600" />
              <h2 className="text-xl font-bold">Procedures ({procedures.length})</h2>
            </div>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newProcedure}
                onChange={(e) => setNewProcedure(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addProcedure()}
                placeholder="Add new procedure"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              />
              <button
                onClick={addProcedure}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700"
              >
                <FaPlus />
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {procedures.map((procedure, idx) => (
                <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-purple-50 rounded-lg">
                  <span>{procedure}</span>
                  <button
                    onClick={() => removeProcedure(idx)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTrash className="text-sm" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Therapies */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <FaSpa className="text-2xl text-teal-600" />
              <h2 className="text-xl font-bold">Therapies ({therapies.length})</h2>
            </div>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newTherapy}
                onChange={(e) => setNewTherapy(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTherapy()}
                placeholder="Add new therapy"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              />
              <button
                onClick={addTherapy}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700"
              >
                <FaPlus />
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {therapies.map((therapy, idx) => (
                <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-teal-50 rounded-lg">
                  <span>{therapy}</span>
                  <button
                    onClick={() => removeTherapy(idx)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTrash className="text-sm" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Management */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <FaSpa className="text-2xl text-orange-600" />
              <h2 className="text-xl font-bold">Management Services ({managementServices.length})</h2>
            </div>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newManagement}
                onChange={(e) => setNewManagement(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addManagement()}
                placeholder="Add management service"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              />
              <button
                onClick={addManagement}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg font-bold hover:bg-orange-700"
              >
                <FaPlus />
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {managementServices.map((service, idx) => (
                <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-orange-50 rounded-lg">
                  <span>{service}</span>
                  <button
                    onClick={() => removeManagement(idx)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTrash className="text-sm" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Insurance */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <FaShieldAlt className="text-2xl text-green-600" />
              <h2 className="text-xl font-bold">Insurance Accepted ({insuranceAccepted.length})</h2>
            </div>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newInsurance}
                onChange={(e) => setNewInsurance(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addInsurance()}
                placeholder="Add insurance provider"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              />
              <button
                onClick={addInsurance}
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700"
              >
                <FaPlus />
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {insuranceAccepted.map((insurance, idx) => (
                <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg">
                  <span>{insurance}</span>
                  <button
                    onClick={() => removeInsurance(idx)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTrash className="text-sm" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Number of Beds */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <FaBed className="text-2xl text-blue-600" />
              <h2 className="text-xl font-bold">Number of Beds</h2>
            </div>

            <input
              type="number"
              value={numberOfBeds}
              onChange={(e) => setNumberOfBeds(parseInt(e.target.value) || 0)}
              min="0"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg font-semibold"
            />
          </div>

          {/* Doctors */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <FaUserMd className="text-2xl text-blue-600" />
                <h2 className="text-xl font-bold">Doctors ({doctors.length})</h2>
              </div>
              <button
                onClick={() => setShowDoctorForm(!showDoctorForm)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 flex items-center gap-2"
              >
                <FaPlus /> Add Doctor
              </button>
            </div>

            {/* Doctor Form */}
            {showDoctorForm && (
              <div className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <h3 className="font-bold mb-3">Add New Doctor</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Doctor Name *"
                    value={doctorForm.name}
                    onChange={(e) => setDoctorForm({ ...doctorForm, name: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Specialization *"
                    value={doctorForm.specialization}
                    onChange={(e) => setDoctorForm({ ...doctorForm, specialization: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Photo URL"
                    value={doctorForm.photo}
                    onChange={(e) => setDoctorForm({ ...doctorForm, photo: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Experience (e.g., 10 years)"
                    value={doctorForm.experience}
                    onChange={(e) => setDoctorForm({ ...doctorForm, experience: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="number"
                    placeholder="Rating (0-5)"
                    value={doctorForm.rating}
                    onChange={(e) => setDoctorForm({ ...doctorForm, rating: parseFloat(e.target.value) })}
                    min="0"
                    max="5"
                    step="0.1"
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="number"
                    placeholder="Consultation Fee (₹)"
                    value={doctorForm.consultationFee}
                    onChange={(e) => setDoctorForm({ ...doctorForm, consultationFee: parseInt(e.target.value) })}
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Qualification"
                    value={doctorForm.qualification}
                    onChange={(e) => setDoctorForm({ ...doctorForm, qualification: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Availability (e.g., Mon-Fri: 9AM-5PM)"
                    value={doctorForm.availability}
                    onChange={(e) => setDoctorForm({ ...doctorForm, availability: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={addDoctor}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
                  >
                    Add Doctor
                  </button>
                  <button
                    onClick={() => setShowDoctorForm(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Doctors List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {doctors.map((doctor, idx) => (
                <div key={idx} className="p-4 border border-gray-200 rounded-xl relative">
                  <button
                    onClick={() => removeDoctor(idx)}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  >
                    <FaTrash />
                  </button>
                  <h4 className="font-bold text-gray-900">{doctor.name}</h4>
                  <p className="text-sm text-gray-600">{doctor.specialization}</p>
                  {doctor.rating > 0 && (
                    <p className="text-sm text-gray-700">Rating: {doctor.rating} ⭐</p>
                  )}
                  {doctor.experience && (
                    <p className="text-xs text-gray-500">{doctor.experience}</p>
                  )}
                  {doctor.consultationFee > 0 && (
                    <p className="text-sm font-semibold text-blue-600">₹{doctor.consultationFee}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Save Button (Bottom) */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-8 py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 disabled:opacity-50 text-lg"
          >
            <FaSave /> {saving ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ManageServices;