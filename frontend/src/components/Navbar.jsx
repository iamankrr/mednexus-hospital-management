import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { 
  FaBars, FaTimes, FaUser, FaSignOutAlt, FaHeart, 
  FaCalendarCheck, FaEnvelope, FaUserCircle, FaPlus, FaUserShield 
} from 'react-icons/fa';
import axios from 'axios';
import API_URL from '../config/api'; 

const Navbar = () => {
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  // ✅ Admin Modal State
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);

  const [newAdminData, setNewAdminData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });

  const DEFAULT_ADMIN_EMAIL = 'admin@hospital.com';

  useEffect(() => {
    if (user && user.role === 'user') {
      fetchUnreadAppointments();
    }
  }, [user]);

  const fetchUnreadAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/api/appointments/my-appointments`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const unread = response.data.data.filter(
        apt => apt.status === 'confirmed' || apt.status === 'pending'
      ).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('adminLoginTime'); // ✅ Clear timer on logout
    window.location.href = '/';
  };

  // ✅ NEW: ADMIN 1-HOUR AUTO LOGOUT LOGIC
  useEffect(() => {
    if (user && user.role === 'admin') {
      const loginTime = localStorage.getItem('adminLoginTime');
      const ONE_HOUR = 60 * 60 * 1000; // 1 Hour in milliseconds (60 min * 60 sec * 1000 ms)

      if (!loginTime) {
        // Agar first time load ho raha hai, toh current time save kar lo
        localStorage.setItem('adminLoginTime', Date.now().toString());
      } else {
        const timePassed = Date.now() - parseInt(loginTime);
        
        if (timePassed >= ONE_HOUR) {
          // Agar 1 ghanta ho chuka hai toh turant logout karo
          alert('Admin session expired for security reasons. Please login again.');
          handleLogout();
        } else {
          // Agar kuch time bacha hai, toh utne bache hue time ka timer laga do
          const timeLeft = ONE_HOUR - timePassed;
          const timer = setTimeout(() => {
            alert('Admin session expired for security reasons. Please login again.');
            handleLogout();
          }, timeLeft);
          
          return () => clearTimeout(timer); // Cleanup timer on unmount
        }
      }
    }
  }, [user]);

  // ✅ CREATE ADMIN
  const handleAddAdminSubmit = async (e) => {
    e.preventDefault();
    setAdminLoading(true);

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/admin/create-admin`,
        newAdminData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('✅ New Admin Created Successfully');
      setShowAddAdminModal(false);
      setNewAdminData({ name: '', email: '', phone: '', password: '' });
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create admin');
    } finally {
      setAdminLoading(false);
    }
  };

  return (
    <>
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <img src="/logo.png" alt="MedNexus" className="h-10 w-10 object-contain" />
              <div>
                <h1 className="text-2xl font-bold text-blue-600">MedNexus</h1>
                <p className="text-xs text-gray-500">The smarter way to choose your care</p>
              </div>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-gray-700 hover:text-blue-600">Home</Link>
              <Link to="/hospitals" className="text-gray-700 hover:text-blue-600">Hospitals</Link>
              <Link to="/labs" className="text-gray-700 hover:text-blue-600">Labs</Link>

              {(!user || user.role !== 'admin') && (
                <Link to="/contact" className="text-gray-700 hover:text-blue-600">Contact</Link>
              )}

              {user ? (
                <div className="flex items-center gap-4">

                  {/* USER ROLE BUTTONS */}
                  {user.role === 'user' && (
                    <div className="flex items-center gap-2">
                      <button onClick={() => navigate('/favorites')} className="p-2 hover:text-red-600 text-gray-700" title="Favorites">
                        <FaHeart className="text-xl" />
                      </button>
                      <button onClick={() => navigate('/appointments')} className="relative p-2 hover:text-blue-600 text-gray-700" title="My Appointments">
                        <FaCalendarCheck className="text-xl" />
                        {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {unreadCount}
                          </span>
                        )}
                      </button>
                      <button onClick={() => navigate('/submit-facility')} className="p-2 hover:text-blue-600 text-gray-700" title="Submit Facility">
                        <FaPlus className="text-xl" />
                      </button>
                    </div>
                  )}

                  {/* ADMIN DASHBOARD LINK */}
                  {user.role === 'admin' && (
                    <Link to="/admin/dashboard" className="text-gray-700 font-medium hover:text-blue-600">
                      Admin Panel
                    </Link>
                  )}

                  {/* OWNER DASHBOARD LINK */}
                  {user.role === 'owner' && (
                    <Link to="/owner/dashboard" className="text-gray-700 font-medium hover:text-blue-600">
                      Dashboard
                    </Link>
                  )}

                  {/* USER DROPDOWN */}
                  <div className="relative pl-4 border-l border-gray-300" ref={dropdownRef}>
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded transition-colors"
                    >
                      <FaUserCircle className="text-2xl text-gray-600" />
                      <span className="text-sm font-medium">{user.name}</span>
                    </button>

                    {showUserMenu && (
                      <div className="absolute right-0 mt-3 w-56 bg-white rounded-lg shadow-xl border py-2 z-50">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-bold text-gray-800">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                            {user.role.toUpperCase()}
                          </span>
                        </div>

                        <div className="py-1">
                          <button
                            onClick={() => { navigate('/profile'); setShowUserMenu(false); }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                          >
                            <FaUser className="text-gray-400" /> Profile
                          </button>

                          {/* DEFAULT ADMIN ONLY - ADD ADMIN OPTION */}
                          {user.email === DEFAULT_ADMIN_EMAIL && (
                            <button
                              onClick={() => { setShowAddAdminModal(true); setShowUserMenu(false); }}
                              className="w-full text-left px-4 py-2 text-sm text-purple-700 font-medium hover:bg-purple-50 flex items-center gap-3"
                            >
                              <FaUserShield className="text-purple-500" /> Add Admin
                            </button>
                          )}
                        </div>

                        <div className="border-t border-gray-100 mt-1 pt-1">
                          <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 font-medium"
                          >
                            <FaSignOutAlt className="text-red-500" /> Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              ) : (
                <div className="flex gap-3">
                  <Link to="/login" className="px-4 py-2 text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors">Login</Link>
                  <Link to="/register" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">Sign Up</Link>
                </div>
              )}
            </div>

            {/* Mobile Button */}
            <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 text-gray-600">
              {isOpen ? <FaTimes className="text-2xl" /> : <FaBars className="text-2xl" />}
            </button>

          </div>
        </div>

        {/* Mobile Menu Content */}
        {isOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3 shadow-inner">
            <Link to="/" onClick={() => setIsOpen(false)} className="block py-2 text-gray-700 font-medium">Home</Link>
            <Link to="/hospitals" onClick={() => setIsOpen(false)} className="block py-2 text-gray-700 font-medium">Hospitals</Link>
            <Link to="/labs" onClick={() => setIsOpen(false)} className="block py-2 text-gray-700 font-medium">Labs</Link>

            {user && user.email === DEFAULT_ADMIN_EMAIL && (
              <button
                onClick={() => { setShowAddAdminModal(true); setIsOpen(false); }}
                className="block w-full text-left py-2 text-purple-700 font-bold"
              >
                <FaUserShield className="inline mr-3" /> Add Admin
              </button>
            )}

            {user ? (
              <button onClick={handleLogout} className="w-full mt-4 bg-red-500 text-white py-3 rounded-lg font-bold shadow-sm">
                Logout
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-3 mt-4">
                <Link to="/login" className="text-center py-2 border border-blue-600 text-blue-600 rounded-lg font-medium">Login</Link>
                <Link to="/register" className="text-center py-2 bg-blue-600 text-white rounded-lg font-medium">Sign Up</Link>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* ADMIN MODAL */}
      {showAddAdminModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center z-[100] px-4 backdrop-blur-sm transition-opacity">
          <div className="bg-white p-6 md:p-8 rounded-2xl w-full max-w-md shadow-2xl transform transition-all">
            
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-extrabold text-gray-800 flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FaUserShield className="text-purple-600 text-xl" />
                </div>
                Create Admin
              </h2>
              <button 
                onClick={() => setShowAddAdminModal(false)}
                className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleAddAdminSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={newAdminData.name}
                  onChange={(e) => setNewAdminData({ ...newAdminData, name: e.target.value })}
                  className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                  placeholder="Enter admin's full name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={newAdminData.email}
                  onChange={(e) => setNewAdminData({ ...newAdminData, email: e.target.value })}
                  className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                  placeholder="admin@mednexus.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={newAdminData.phone}
                  onChange={(e) => setNewAdminData({ ...newAdminData, phone: e.target.value })}
                  className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                  placeholder="Enter 10-digit phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Temporary Password</label>
                <input
                  type="password"
                  required
                  value={newAdminData.password}
                  onChange={(e) => setNewAdminData({ ...newAdminData, password: e.target.value })}
                  className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                  placeholder="••••••••"
                />
                <p className="text-xs text-gray-500 mt-2">The new admin can change this password later from their profile.</p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={adminLoading}
                  className="w-full bg-purple-600 text-white py-3.5 rounded-xl font-bold text-lg hover:bg-purple-700 focus:ring-4 focus:ring-purple-200 transition-all disabled:opacity-70 flex justify-center items-center gap-2 shadow-md"
                >
                  {adminLoading ? (
                    <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Creating...</>
                  ) : (
                    "Create Admin Account"
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;