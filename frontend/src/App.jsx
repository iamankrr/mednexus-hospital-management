import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom'; // ✅ Added useLocation
import Navbar from './components/Navbar'; 
import Home from './pages/Home';
import SearchResults from './pages/SearchResults';
import HospitalDetails from './pages/HospitalDetails';
import Login from './pages/auth/Login';

import Hospitals from './pages/Hospitals';
import Labs from './pages/Labs';

import EnhancedHospitalDetails from './pages/EnhancedHospitalDetails';
import EnhancedLabDetails from './pages/EnhancedLabDetails';

import RegistrationChoice from './pages/RegistrationChoice';
import RegisterUser from './pages/RegisterUser';
import BookAppointment from './pages/BookAppointment';

import ContactUs from './pages/ContactUs';
import LabDetails from './pages/LabDetails';
import AdminDashboard from './pages/admin/Dashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageHospitals from './pages/admin/ManageHospitals';
import ManageLabs from './pages/admin/ManageLabs';
import ManageReviews from './pages/admin/ManageReviews';
import ContactRequests from './pages/admin/ContactRequests';
import AddHospital from './pages/admin/AddHospital';
import EditHospital from './pages/admin/EditHospital';
import AddLab from './pages/admin/AddLab';
import EditLab from './pages/admin/EditLab';
import Compare from './pages/Compare'; 
import CompareBar from './components/CompareBar';
import Favorites from './pages/Favorites';
import OwnerRegister from './pages/owner/OwnerRegister';
import OwnerPending from './pages/owner/OwnerPending'; 
import OwnerDashboard from './pages/owner/OwnerDashboard';
import OwnerFacility from './pages/owner/OwnerFacility';
import ManageOwners from './pages/admin/ManageOwners';
import Appointments from './pages/Appointments';
import OwnerAppointments from './pages/owner/OwnerAppointments';

import SubmitFacility from './pages/SubmitFacility';
import MySubmissions from './pages/MySubmissions';
import ReviewSubmissions from './pages/admin/ReviewSubmissions';
import ViewContacts from './pages/admin/ViewContacts';

import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import AboutUs from './pages/AboutUs';

import ManageServices from './pages/owner/ManageServices';
import AdminManageServices from './pages/admin/AdminManageServices'; 

import UserProfile from './pages/UserProfile'; 
import ChangePassword from './pages/ChangePassword'; 

// ✅ FIX: SCROLL MANAGER - Browser aur React ki ladai khatam!
const ScrollManager = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // 1. Browser ke native scroll memory ko disable karo
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // 2. Har naye page ko TOP se kholo (Lekin list pages ko ignore karo)
    if (pathname !== '/hospitals' && pathname !== '/labs') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [pathname]);

  return null;
};

function App() {
  return (
    <div className="App">
      {/* ✅ Add ScrollManager Here */}
      <ScrollManager />
      
      <Navbar />
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<SearchResults />} />
        
        <Route path="/hospitals" element={<Hospitals />} />
        <Route path="/labs" element={<Labs />} />
        
        <Route path="/hospital/:id" element={<HospitalDetails />} /> 
        <Route path="/lab/:id" element={<LabDetails />} /> 

        <Route path="/hospital/:id/services" element={<EnhancedHospitalDetails />} />
        <Route path="/lab/:id/services" element={<EnhancedLabDetails />} />
        
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/login" element={<Login />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/appointments/book" element={<BookAppointment />} />

        <Route path="/profile" element={<UserProfile />} />
        <Route path="/change-password" element={<ChangePassword />} />

        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/about" element={<AboutUs />} />

        <Route path="/submit-facility" element={<SubmitFacility />} />
        <Route path="/my-submissions" element={<MySubmissions />} />

        <Route path="/register" element={<RegistrationChoice />} />
        <Route path="/register/user" element={<RegisterUser />} />
        <Route path="/register/owner" element={<OwnerRegister />} />
        <Route path="/register-owner" element={<OwnerRegister />} />

        <Route path="/owner/register" element={<OwnerRegister />} /> 
        <Route path="/owner/pending" element={<OwnerPending />} />
        <Route path="/owner/dashboard" element={<OwnerDashboard />} />
        <Route path="/owner/facility" element={<OwnerFacility />} />
        <Route path="/owner/appointments" element={<OwnerAppointments />} />
        <Route path="/owner/manage-services" element={<ManageServices />} /> 

        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/owners" element={<ManageOwners />} />
        <Route path="/admin/users" element={<ManageUsers />} />
        <Route path="/admin/hospitals" element={<ManageHospitals />} />
        <Route path="/admin/hospitals/add" element={<AddHospital />} />
        <Route path="/admin/hospitals/edit/:id" element={<EditHospital />} />
        <Route path="/admin/labs" element={<ManageLabs />} />
        <Route path="/admin/labs/add" element={<AddLab />} />
        <Route path="/admin/labs/edit/:id" element={<EditLab />} />
        <Route path="/admin/reviews" element={<ManageReviews />} />
        <Route path="/admin/contacts" element={<ContactRequests />} />
        <Route path="/admin/submissions" element={<ReviewSubmissions />} />
        <Route path="/admin/contacts" element={<ViewContacts />} />
        <Route path="/admin/:type/:id/manage-services" element={<AdminManageServices />} /> 
      </Routes>
      
      <CompareBar />
    </div>
  );
}

export default App;