import React, { useState, useEffect } from 'react';
import { FaInfoCircle, FaUsers, FaBullseye, FaHeart } from 'react-icons/fa';
import axios from 'axios';
import Footer from '../components/Footer';
import API_URL from '../config/api';

const AboutUs = () => {
  // ✅ State to store the dynamic counts
  const [stats, setStats] = useState({
    hospitals: 0,
    labs: 0,
    loading: true
  });

  // ✅ Fetch data on component mount
  useEffect(() => {
    // Scroll to top when page opens
    window.scrollTo(0, 0);
    fetchCounts();
  }, []);

  const fetchCounts = async () => {
    try {
      // Running both API calls in parallel for faster loading
      const [hospitalsRes, labsRes] = await Promise.all([
        axios.get(`${API_URL}/api/hospitals`),
        axios.get(`${API_URL}/api/labs`)
      ]);

      // Handle both standard response and nested 'data' response structure
      const hospitalData = hospitalsRes.data?.data || hospitalsRes.data || [];
      const labData = labsRes.data?.data || labsRes.data || [];

      setStats({
        hospitals: hospitalData.length || 0,
        labs: labData.length || 0,
        loading: false
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Fallback to static numbers if API fails
      setStats({
        hospitals: '12+',
        labs: '5+',
        loading: false
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-md p-8">
            
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <FaInfoCircle className="text-4xl text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">About MedNexus</h1>
            </div>

            <div className="space-y-8">
              {/* Mission */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <FaBullseye className="text-2xl text-blue-600" />
                  <h2 className="text-2xl font-bold text-gray-900">Our Mission</h2>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  MedNexus is dedicated to making healthcare more accessible and transparent across India. 
                  We believe that finding quality healthcare should be simple, fast, and reliable. Our platform 
                  connects patients with hospitals and diagnostic labs, making it easier to find the right care 
                  at the right time.
                </p>
              </section>

              {/* What We Do */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <FaUsers className="text-2xl text-blue-600" />
                  <h2 className="text-2xl font-bold text-gray-900">What We Do</h2>
                </div>
                <p className="text-gray-700 leading-relaxed mb-4">
                  MedNexus provides a comprehensive platform where you can:
                </p>
                <ul className="list-disc ml-6 space-y-2 text-gray-700">
                  <li>Search for hospitals and diagnostic labs across India</li>
                  <li>View detailed information including facilities, ratings, and reviews</li>
                  <li>Book appointments online with verified facilities</li>
                  <li>Find healthcare providers near you using location-based search</li>
                  <li>Submit new facilities to help grow our database</li>
                  <li>Read authentic reviews from other patients</li>
                </ul>
              </section>

              {/* Why Choose Us */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <FaHeart className="text-2xl text-red-500" />
                  <h2 className="text-2xl font-bold text-gray-900">Why Choose MedNexus</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">🔍 Smart Search</h3>
                    <p className="text-sm text-gray-700">Find facilities based on location, specialization, and ratings</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                    <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">✅ Verified Info</h3>
                    <p className="text-sm text-gray-700">All facilities are verified with accurate contact details</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                    <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">📱 Easy Booking</h3>
                    <p className="text-sm text-gray-700">Book appointments instantly without phone calls</p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
                    <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">🌍 Pan-India</h3>
                    <p className="text-sm text-gray-700">Access to facilities across all states and major cities</p>
                  </div>
                </div>
              </section>

              {/* ✅ Dynamic Stats Section */}
              <section className="border-t pt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Our Impact</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-blue-50 rounded-2xl border border-blue-100">
                    {stats.loading ? (
                      <div className="animate-pulse h-10 w-16 bg-blue-200 rounded mx-auto mb-2"></div>
                    ) : (
                      <p className="text-4xl font-bold text-blue-600 mb-2">{stats.hospitals}+</p>
                    )}
                    <p className="text-gray-700 font-semibold">Registered Hospitals</p>
                  </div>
                  <div className="text-center p-6 bg-purple-50 rounded-2xl border border-purple-100">
                    {stats.loading ? (
                      <div className="animate-pulse h-10 w-16 bg-purple-200 rounded mx-auto mb-2"></div>
                    ) : (
                      <p className="text-4xl font-bold text-purple-600 mb-2">{stats.labs}+</p>
                    )}
                    <p className="text-gray-700 font-semibold">Diagnostic Labs</p>
                  </div>
                  <div className="text-center p-6 bg-green-50 rounded-2xl border border-green-100">
                    <p className="text-4xl font-bold text-green-600 mb-2">100%</p>
                    <p className="text-gray-700 font-semibold">Verified Details</p>
                  </div>
                </div>
              </section>

              {/* Contact */}
              <section className="border-t pt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Get in Touch</h2>
                <p className="text-gray-700 mb-4">
                  Have questions or suggestions? We'd love to hear from you!
                </p>
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-3 text-gray-700">
                  <p className="flex items-center gap-3">
                    <span className="bg-white p-2 rounded-full shadow-sm"><FaInfoCircle className="text-blue-500" /></span>
                    <strong>Email:</strong> 
                    <a href="mailto:support@mednexus.com" className="text-blue-600 hover:underline">amankrr.info@gmail.com</a>
                  </p>
                  <p className="flex items-center gap-3">
                    <span className="bg-white p-2 rounded-full shadow-sm"><FaInfoCircle className="text-green-500" /></span>
                    <strong>Phone:</strong> 
                    <a href="tel:+919876543210" className="text-blue-600 hover:underline">+91 98765 43210</a>
                  </p>
                  <p className="flex items-center gap-3">
                    <span className="bg-white p-2 rounded-full shadow-sm"><FaInfoCircle className="text-red-500" /></span>
                    <strong>Address:</strong> Faridabad, Haryana, India
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AboutUs;