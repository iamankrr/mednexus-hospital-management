import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  FaBars, 
  FaTimes, 
  FaUser, 
  FaSignOutAlt, 
  FaHeart, 
  FaCalendarCheck,
  FaEnvelope,
  FaUserCircle,
  FaBell,
  FaPlus // ✅ Added FaPlus
} from 'react-icons/fa';
import axios from 'axios';

const Navbar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user && user.role === 'user') {
      fetchUnreadAppointments();
    }
  }, [user]);

  const fetchUnreadAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/appointments/my-appointments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const unread = response.data.data.filter(apt => 
        apt.status === 'confirmed' || apt.status === 'pending'
      ).length;
      
      setUnreadCount(unread);
    } catch (error) {
      console.error('Fetch appointments error:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition">
            <img 
              src="/logo.png" 
              alt="MedNexus Logo" 
              className="h-10 w-10 object-contain"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%232563EB" width="100" height="100"/><text x="50" y="55" font-size="40" fill="white" text-anchor="middle" font-family="Arial">M</text></svg>';
              }}
            />
            <div>
              <h1 className="text-2xl font-bold text-blue-600">MedNexus</h1>
              <p className="text-xs text-gray-500 -mt-1">The smarter way to choose your care</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium transition">
              Home
            </Link>
            <Link to="/hospitals" className="text-gray-700 hover:text-blue-600 font-medium transition">
              Hospitals
            </Link>
            <Link to="/labs" className="text-gray-700 hover:text-blue-600 font-medium transition">
              Labs
            </Link>
            
            {/* Contact - Hidden for Admin */}
            {(!user || user.role !== 'admin') && (
              <Link to="/contact" className="text-gray-700 hover:text-blue-600 font-medium transition">
                Contact
              </Link>
            )}

            {user ? (
              <>
                {/* User Role Links with buttons and + Icon */}
                {user.role === 'user' && (
                  <>
                    {/* Favorites */}
                    <button
                      onClick={() => navigate('/favorites')}
                      className="relative p-2 text-gray-700 hover:text-red-600 transition"
                      title="Favorites"
                    >
                      <FaHeart className="text-xl" />
                    </button>

                    {/* Appointments */}
                    <button
                      onClick={() => navigate('/appointments')}
                      className="relative p-2 text-gray-700 hover:text-blue-600 transition"
                      title="My Appointments"
                    >
                      <FaCalendarCheck className="text-xl" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </button>

                    {/* + Submit Facility */}
                    <button
                      onClick={() => navigate('/submit-facility')}
                      className="p-2 text-gray-700 hover:text-blue-600 transition"
                      title="Submit Hospital/Lab"
                    >
                      <FaPlus className="text-xl" />
                    </button>
                  </>
                )}

                {/* Admin Link */}
                {user.role === 'admin' && (
                  <Link to="/admin/dashboard" className="text-gray-700 hover:text-blue-600 font-medium transition">
                    Admin Panel
                  </Link>
                )}

                {/* Owner Link */}
                {user.role === 'owner' && (
                  <Link to="/owner/dashboard" className="text-gray-700 hover:text-blue-600 font-medium transition">
                    Dashboard
                  </Link>
                )}
                
                {/* User Menu */}
                <div className="relative ml-4 pl-4 border-l">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 rounded-lg transition"
                  >
                    <FaUserCircle className="text-2xl text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">{user.name}</span>
                  </button>

                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border py-2">
                      <div className="px-4 py-2 border-b">
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                        <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                          {user.role.toUpperCase()}
                        </span>
                      </div>

                      {/* ✅ Profile Button (Accessible to ALL logged in users) */}
                      <button
                        onClick={() => {
                          navigate('/profile');
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <FaUser /> Profile
                      </button>

                      {user.role === 'user' && (
                        <>
                          <Link
                            to="/appointments"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <FaCalendarCheck /> My Appointments
                          </Link>
                          <Link
                            to="/favorites"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <FaHeart /> Favorites
                          </Link>
                          <Link
                            to="/submit-facility"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <FaPlus /> Submit Facility
                          </Link>
                          <Link
                            to="/my-submissions"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <FaEnvelope /> My Submissions
                          </Link>
                        </>
                      )}

                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 border-t mt-2"
                      >
                        <FaSignOutAlt /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {isOpen ? <FaTimes className="text-2xl" /> : <FaBars className="text-2xl" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 border-t mt-2 pt-4">
            <div className="flex flex-col gap-3">
              <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium px-2 py-1">
                Home
              </Link>
              <Link to="/hospitals" className="text-gray-700 hover:text-blue-600 font-medium px-2 py-1">
                Hospitals
              </Link>
              <Link to="/labs" className="text-gray-700 hover:text-blue-600 font-medium px-2 py-1">
                Labs
              </Link>
              
              {/* Contact - Hidden for Admin (Mobile) */}
              {(!user || user.role !== 'admin') && (
                <Link to="/contact" className="text-gray-700 hover:text-blue-600 font-medium px-2 py-1">
                  Contact
                </Link>
              )}

              {user ? (
                <>
                  <div className="border-t pt-3 mt-2">
                    <p className="text-sm text-gray-600 mb-2 px-2">
                      <FaUserCircle className="inline mr-2" />
                      {user.name}
                    </p>
                  </div>

                  {/* ✅ Profile link (Accessible to ALL logged in users on mobile) */}
                  <button 
                    onClick={() => {
                      navigate('/profile');
                      setIsOpen(false);
                    }} 
                    className="text-left text-gray-700 hover:text-blue-600 font-medium px-2 py-1"
                  >
                    <FaUser className="inline mr-2" /> Profile
                  </button>

                  {user.role === 'admin' && (
                    <Link to="/admin/dashboard" className="text-gray-700 hover:text-blue-600 font-medium px-2 py-1">
                      Admin Dashboard
                    </Link>
                  )}
                  
                  {user.role === 'owner' && (
                    <Link to="/owner/dashboard" className="text-gray-700 hover:text-blue-600 font-medium px-2 py-1">
                      Owner Dashboard
                    </Link>
                  )}

                  {user.role === 'user' && (
                    <>
                      <Link to="/appointments" className="text-gray-700 hover:text-blue-600 font-medium px-2 py-1 flex items-center justify-between">
                        <span><FaCalendarCheck className="inline mr-2" /> My Appointments</span>
                        {unreadCount > 0 && (
                          <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                            {unreadCount}
                          </span>
                        )}
                      </Link>
                      <Link to="/favorites" className="text-gray-700 hover:text-blue-600 font-medium px-2 py-1">
                        <FaHeart className="inline mr-2" /> Favorites
                      </Link>
                      <Link to="/submit-facility" className="text-gray-700 hover:text-blue-600 font-medium px-2 py-1">
                        <FaPlus className="inline mr-2" /> Submit Facility
                      </Link>
                      <Link to="/my-submissions" className="text-gray-700 hover:text-blue-600 font-medium px-2 py-1">
                        <FaEnvelope className="inline mr-2" /> My Submissions
                      </Link>
                    </>
                  )}
                  
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 mt-3"
                  >
                    <FaSignOutAlt className="inline mr-2" /> Logout
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2 pt-3 border-t">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-center text-blue-600 border border-blue-600 rounded-lg font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 text-center bg-blue-600 text-white rounded-lg font-medium"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;