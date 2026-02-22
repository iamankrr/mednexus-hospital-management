import React from 'react';
import { FaInfoCircle, FaUsers, FaBullseye, FaHeart } from 'react-icons/fa';
import Footer from '../components/Footer';

const AboutUs = () => {
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
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-bold text-gray-900 mb-2">🔍 Smart Search</h3>
                    <p className="text-sm text-gray-700">Find facilities based on location, specialization, and ratings</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h3 className="font-bold text-gray-900 mb-2">✅ Verified Information</h3>
                    <p className="text-sm text-gray-700">All facilities are verified with accurate contact details</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h3 className="font-bold text-gray-900 mb-2">📱 Easy Booking</h3>
                    <p className="text-sm text-gray-700">Book appointments instantly without phone calls</p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <h3 className="font-bold text-gray-900 mb-2">🌍 Pan-India Coverage</h3>
                    <p className="text-sm text-gray-700">Access to facilities across all states and major cities</p>
                  </div>
                </div>
              </section>

              {/* Stats */}
              <section className="border-t pt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Our Impact</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-blue-600 mb-2">12+</p>
                    <p className="text-gray-600">Hospitals</p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-purple-600 mb-2">5+</p>
                    <p className="text-gray-600">Diagnostic Labs</p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-green-600 mb-2">All India</p>
                    <p className="text-gray-600">Coverage</p>
                  </div>
                </div>
              </section>

              {/* Contact */}
              <section className="border-t pt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Get in Touch</h2>
                <p className="text-gray-700 mb-4">
                  Have questions or suggestions? We'd love to hear from you!
                </p>
                <div className="space-y-2 text-gray-700">
                  <p><strong>Email:</strong> support@mednexus.com</p>
                  <p><strong>Phone:</strong> +91 98765 43210</p>
                  <p><strong>Address:</strong> New Delhi, India</p>
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