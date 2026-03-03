import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaSearch, FaHeart, FaUser } from 'react-icons/fa';

const BottomNav = () => {
  const location = useLocation();
  const path = location.pathname;

  // Bottom Nav ke items ki list
  const navItems = [
    { name: 'Home', icon: FaHome, path: '/' },
    { name: 'Search', icon: FaSearch, path: '/search' },
    { name: 'Saved', icon: FaHeart, path: '/favorites' },
    { name: 'Profile', icon: FaUser, path: '/profile' }
  ];

  return (
    // md:hidden ensures it ONLY shows on Mobile and Tablets, hiding on Desktop
    <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 flex justify-around items-center py-2 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = path === item.path || (path === '/login' && item.path === '/profile');

        return (
          <Link 
            key={item.name} 
            to={item.path} 
            className="flex flex-col items-center w-full py-1"
          >
            <div className={`p-1.5 rounded-full transition-all duration-300 ${isActive ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:text-blue-500'}`}>
              <Icon className="text-xl" />
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