import React from 'react';
import { FaFileContract } from 'react-icons/fa';
import Footer from '../components/Footer';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-md p-8">
            
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <FaFileContract className="text-4xl text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
            </div>

            <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

            <div className="space-y-6 text-gray-700">
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3">1. Acceptance of Terms</h2>
                <p>By accessing and using MedNexus, you accept and agree to be bound by these Terms of Service. If you do not agree, please do not use our services.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3">2. Service Description</h2>
                <p>MedNexus provides a platform to:</p>
                <ul className="list-disc ml-6 mt-2 space-y-1">
                  <li>Search for hospitals and diagnostic labs</li>
                  <li>Book appointments online</li>
                  <li>Read and write reviews</li>
                  <li>Submit facility suggestions</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3">3. User Responsibilities</h2>
                <p>You agree to:</p>
                <ul className="list-disc ml-6 mt-2 space-y-1">
                  <li>Provide accurate and complete information</li>
                  <li>Keep your account credentials secure</li>
                  <li>Not misuse the platform or post false information</li>
                  <li>Respect the rights of others</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3">4. Appointment Bookings</h2>
                <p>Appointments booked through MedNexus are subject to confirmation by the respective facility. We are not responsible for:</p>
                <ul className="list-disc ml-6 mt-2 space-y-1">
                  <li>Appointment cancellations by facilities</li>
                  <li>Quality of medical services provided</li>
                  <li>Disputes between users and facilities</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3">5. User-Generated Content</h2>
                <p>By posting reviews or submitting facilities, you grant MedNexus a license to use, display, and distribute your content on our platform.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3">6. Disclaimer</h2>
                <p>MedNexus is a platform connecting users with healthcare facilities. We do not provide medical advice or guarantee the quality of services provided by facilities.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3">7. Limitation of Liability</h2>
                <p>MedNexus shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3">8. Changes to Terms</h2>
                <p>We reserve the right to modify these terms at any time. Continued use of the platform constitutes acceptance of updated terms.</p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-3">9. Contact</h2>
                <p>For questions about these Terms, contact us at:</p>
                <p className="mt-2">Email: legal@mednexus.com</p>
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

export default TermsOfService;