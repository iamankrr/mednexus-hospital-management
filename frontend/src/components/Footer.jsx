import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaFacebook, 
  FaTwitter, 
  FaInstagram, 
  FaLinkedin, 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt,
  FaHospital,
  FaFlask,
  FaShieldAlt,
  FaFileContract,
  FaInfoCircle
} from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img 
                src="/logo.png" 
                alt="MedNexus" 
                className="h-10 w-10"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                }}
              />
              <div>
                <h3 className="text-xl font-bold">MedNexus</h3>
                <p className="text-xs text-gray-400">The smarter way to choose your care</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your trusted platform to find and book appointments at hospitals and diagnostic labs across India.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-4 mt-4">
              <a href="#" className="text-gray-400 hover:text-white transition text-xl">
                <FaFacebook />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition text-xl">
                <FaTwitter />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition text-xl">
                <FaInstagram />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition text-xl">
                <FaLinkedin />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4 text-lg">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition flex items-center gap-2">
                  <span className="text-blue-500">▸</span> Home
                </Link>
              </li>
              <li>
                <Link to="/hospitals" className="text-gray-400 hover:text-white transition flex items-center gap-2">
                  <FaHospital className="text-blue-500" /> Find Hospitals
                </Link>
              </li>
              <li>
                <Link to="/labs" className="text-gray-400 hover:text-white transition flex items-center gap-2">
                  <FaFlask className="text-purple-500" /> Find Labs
                </Link>
              </li>
              <li>
                <Link to="/submit-facility" className="text-gray-400 hover:text-white transition flex items-center gap-2">
                  <span className="text-green-500">▸</span> Submit Facility
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white transition flex items-center gap-2">
                  <span className="text-yellow-500">▸</span> Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* For Users */}
          <div>
            <h4 className="font-bold mb-4 text-lg">For Users</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/appointments" className="text-gray-400 hover:text-white transition">
                  Book Appointments
                </Link>
              </li>
              <li>
                <Link to="/favorites" className="text-gray-400 hover:text-white transition">
                  My Favorites
                </Link>
              </li>
              <li>
                <Link to="/my-submissions" className="text-gray-400 hover:text-white transition">
                  My Submissions
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-400 hover:text-white transition">
                  Sign Up
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-400 hover:text-white transition">
                  Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-4 text-lg">Contact Us</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start gap-3">
                <FaEnvelope className="text-blue-500 mt-1" />
                <div>
                  <p className="text-white font-medium">Email</p>
                  <a href="mailto:amankrr.info@gmail.com" className="hover:text-white transition">
                    amankrr.info@gmail.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <FaPhone className="text-green-500 mt-1" />
                <div>
                  <p className="text-white font-medium">Phone</p>
                  <a href="tel:+919876543210" className="hover:text-white transition">
                    +91 98765 43210
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <FaMapMarkerAlt className="text-red-500 mt-1" />
                <div>
                  <p className="text-white font-medium">Address</p>
                  <p>Faridabad, Haryana</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} MedNexus. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <Link to="/privacy" className="text-gray-400 hover:text-white transition flex items-center gap-2">
                <FaShieldAlt className="text-blue-400" /> Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-white transition flex items-center gap-2">
                <FaFileContract className="text-green-400" /> Terms of Service
              </Link>
              <Link to="/about" className="text-gray-400 hover:text-white transition flex items-center gap-2">
                <FaInfoCircle className="text-purple-400" /> About Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;