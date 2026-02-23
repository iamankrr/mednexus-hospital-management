import React from 'react';
import { Routes, Route } from 'react-router-dom'; // ✅ No BrowserRouter here
import Navbar from './components/Navbar'; 
import Home from './pages/Home';
import SearchResults from './pages/SearchResults';
import HospitalDetails from './pages/HospitalDetails';
import Login from './pages/auth/Login';

// ✅ Added Imports for Hospitals and Labs Pages
import Hospitals from './pages/Hospitals';
import Labs from './pages/Labs';

// ✅ Enhanced Details Imports (Make sure these files exist in your pages folder)
import EnhancedHospitalDetails from './pages/EnhancedHospitalDetails';
import EnhancedLabDetails from './pages/EnhancedLabDetails';

// ✅ New Registration Flow Imports
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

// ✅ Facility Submissions Imports
import SubmitFacility from './pages/SubmitFacility';
import MySubmissions from './pages/MySubmissions';
import ReviewSubmissions from './pages/admin/ReviewSubmissions';
import ViewContacts from './pages/admin/ViewContacts';

// ✅ Footer Pages Imports
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import AboutUs from './pages/AboutUs';

// ✅ Owner & Admin Services Management Imports
import ManageServices from './pages/owner/ManageServices';
import AdminManageServices from './pages/admin/AdminManageServices'; 

// ✅ Added User Profile Import
import UserProfile from './pages/UserProfile'; 

// ✅ Added Change Password Import
import ChangePassword from './pages/ChangePassword'; 

function App() {
  return (
    <div className="App">
      {/* ✅ Navbar is perfectly placed. It will use the Router from main.jsx */}
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