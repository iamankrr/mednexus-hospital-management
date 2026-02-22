import React from 'react';
import { FaShieldAlt } from 'react-icons/fa';
import Footer from '../components/Footer';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-md p-8">
            
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <FaShieldAlt className="text-4xl text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
            </div>

            <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

            <div className="space-y-6 text-gray-700">
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3">1. Information We Collect</h2>
                <p>We collect information you provide directly to us, including:</p>
                <ul className="list-disc ml-6 mt-2 space-y-1">
                  <li>Name, email address, and phone number</li>
                  <li>Appointment booking details</li>
                  <li>Location data (with your permission)</li>
                  <li>Reviews and ratings you submit</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3">2. How We Use Your Information</h2>
                <p>We use the information we collect to:</p>
                <ul className="list-disc ml-6 mt-2 space-y-1">
                  <li>Provide and improve our services</li>
                  <li>Process appointment bookings</li>
                  <li>Send you updates and notifications</li>
                  <li>Show you relevant hospitals and labs near you</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3">3. Information Sharing</h2>
                <p>We do not sell your personal information. We may share your information with:</p>
                <ul className="list-disc ml-6 mt-2 space-y-1">
                  <li>Hospitals and labs where you book appointments</li>
                  <li>Service providers who help us operate our platform</li>
                  <li>Law enforcement when required by law</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3">4. Data Security</h2>
                <p>We implement appropriate security measures to protect your personal information from unauthorized access, alteration, or disclosure.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3">5. Your Rights</h2>
                <p>You have the right to:</p>
                <ul className="list-disc ml-6 mt-2 space-y-1">
                  <li>Access your personal data</li>
                  <li>Request corrections to your data</li>
                  <li>Delete your account and data</li>
                  <li>Opt-out of marketing communications</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3">6. Contact Us</h2>
                <p>If you have questions about this Privacy Policy, please contact us at:</p>
                <p className="mt-2">Email: privacy@mednexus.com</p>
                <p>Phone: +91 98765 43210</p>
              </section>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;