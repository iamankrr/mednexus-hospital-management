import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaHome, FaSearch, FaHeart, FaUser, FaExchangeAlt, 
  FaTachometerAlt, FaHospital, FaFlask, FaCalendarAlt, FaClinicMedical 
} from 'react-icons/fa';

const BottomNav = () => {
  const location = useLocation();
  const path = location.pathname;

  const [compareCount, setCompareCount] = useState(0);

  // Get user from local storage
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const role = user?.role || 'user'; // default to user if not logged in

  useEffect(() => {
    const updateCompareCount = () => {
      const comparisonList = JSON.parse(localStorage.getItem('compareList')) || [];
      setCompareCount(comparisonList.length);
    };

    updateCompareCount();
    
    window.addEventListener('storage', updateCompareCount);
    return () => window.removeEventListener('storage', updateCompareCount);
  }, []);

  // ✅ DYNAMIC NAV ITEMS BASED ON ROLE
  let navItems = [];

  if (role === 'admin') {
    navItems = [
      { name: 'Home', icon: FaHome, path: '/' },
      { name: 'Dashboard', icon: FaTachometerAlt, path: '/admin/dashboard' },
      { name: 'Hospitals', icon: FaHospital, path: '/admin/hospitals' },
      { name: 'Labs', icon: FaFlask, path: '/admin/labs' },
      { name: 'Profile', icon: FaUser, path: '/profile' }
    ];
  } else if (role === 'owner') {
    navItems = [
      { name: 'Home', icon: FaHome, path: '/' },
      { name: 'Dashboard', icon: FaTachometerAlt, path: '/owner/dashboard' },
      { name: 'Facility', icon: FaClinicMedical, path: '/owner/facility' },
      { name: 'Bookings', icon: FaCalendarAlt, path: '/owner/appointments' },
      { name: 'Profile', icon: FaUser, path: '/profile' }
    ];
  } else {
    // Default User/Guest
    navItems = [
      { name: 'Home', icon: FaHome, path: '/' },
      { name: 'Search', icon: FaSearch, path: '/search' },
      { name: 'Compare', icon: FaExchangeAlt, path: '/compare', badgeCount: compareCount },
      { name: 'Saved', icon: FaHeart, path: '/favorites' },
      { name: 'Profile', icon: FaUser, path: '/profile' }
    ];
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 flex justify-around items-center py-2 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = path === item.path || (path === '/login' && item.path === '/profile');

        return (
          <Link 
            key={item.name} 
            to={item.path} 
            className="flex flex-col items-center w-full py-1 relative"
          >
            <div className={`p-1.5 rounded-full relative transition-all duration-300 ${isActive ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:text-blue-500'}`}>
              <Icon className="text-xl" />
              
              {item.badgeCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {item.badgeCount}
                </span>
              )}
            </div>
            
            <span className={`text-[10px] mt-1 font-semibold transition-all duration-300 ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
              {item.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
};

export default BottomNav;