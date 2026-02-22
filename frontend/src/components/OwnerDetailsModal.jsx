import React from 'react';
import { FaUser, FaEnvelope, FaPhone, FaHospital, FaFlask, FaTimes, FaCheckCircle } from 'react-icons/fa';

const OwnerDetailsModal = ({ owner, onClose }) => {
  if (!owner) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <FaUser className="text-2xl text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Owner Details</h2>
              <p className="text-blue-100 text-sm">Complete profile information</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-blue-700 rounded-full transition"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Owner Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Personal Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1 flex items-center gap-2">
                  <FaUser className="text-blue-500" /> Full Name
                </p>
                <p className="text-sm font-bold text-gray-900">{owner.name}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1 flex items-center gap-2">
                  <FaEnvelope className="text-blue-500" /> Email
                </p>
                <p className="text-sm font-medium text-gray-900 break-all">{owner.email}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1 flex items-center gap-2">
                  <FaPhone className="text-blue-500" /> Phone
                </p>
                <p className="text-sm font-medium text-gray-900">{owner.phone || 'Not provided'}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Account Status</p>
                <div className="flex items-center gap-2">
                  {owner.isActive ? (
                    <span className="flex items-center gap-1 text-green-700 font-bold text-sm">
                      <FaCheckCircle /> Active
                    </span>
                  ) : (
                    <span className="text-red-700 font-bold text-sm">Inactive</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Owner Profile */}
          {owner.ownerProfile && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Owner Profile</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-xs text-blue-700 uppercase font-semibold mb-1">Facility Type</p>
                  <div className="flex items-center gap-2">
                    {owner.ownerProfile.facilityType === 'hospital' ? (
                      <>
                        <FaHospital className="text-xl text-blue-600" />
                        <span className="text-sm font-bold text-gray-900 capitalize">Hospital</span>
                      </>
                    ) : (
                      <>
                        <FaFlask className="text-xl text-purple-600" />
                        <span className="text-sm font-bold text-gray-900 capitalize">Laboratory</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <p className="text-xs text-green-700 uppercase font-semibold mb-1">Verification Status</p>
                  <div className="flex items-center gap-2">
                    {owner.ownerProfile.isVerified ? (
                      <>
                        <FaCheckCircle className="text-green-600" />
                        <span className="text-sm font-bold text-green-700">Verified</span>
                      </>
                    ) : (
                      <span className="text-sm font-bold text-yellow-700">Pending Verification</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Business Details */}
              {(owner.ownerProfile.businessLicense || owner.ownerProfile.registrationNumber) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {owner.ownerProfile.businessLicense && (
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Business License</p>
                      <p className="text-sm font-medium text-gray-900">{owner.ownerProfile.businessLicense}</p>
                    </div>
                  )}
                  {owner.ownerProfile.registrationNumber && (
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Registration Number</p>
                      <p className="text-sm font-medium text-gray-900">{owner.ownerProfile.registrationNumber}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Facility Details */}
          {owner.ownerProfile?.facilityId && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Assigned Facility</h3>
              
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                <div className="flex items-start gap-3 mb-3">
                  {owner.ownerProfile.facilityType === 'hospital' ? (
                    <FaHospital className="text-2xl text-blue-600 mt-1" />
                  ) : (
                    <FaFlask className="text-2xl text-purple-600 mt-1" />
                  )}
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 text-lg">{owner.ownerProfile.facilityId.name}</h4>
                    {owner.ownerProfile.facilityId.type && (
                      <p className="text-sm text-gray-600 capitalize">Type: {owner.ownerProfile.facilityId.type}</p>
                    )}
                    {owner.ownerProfile.facilityId.category && (
                      <p className="text-sm text-gray-600 capitalize">Category: {owner.ownerProfile.facilityId.category}</p>
                    )}
                  </div>
                </div>

                {owner.ownerProfile.facilityId.address && (
                  <div className="mt-3 p-3 bg-white rounded-lg">
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Address</p>
                    <p className="text-sm text-gray-900">
                      {owner.ownerProfile.facilityId.address.street}
                      {owner.ownerProfile.facilityId.address.area && `, ${owner.ownerProfile.facilityId.address.area}`}
                      <br />
                      {owner.ownerProfile.facilityId.address.city}, {owner.ownerProfile.facilityId.address.state}
                      {owner.ownerProfile.facilityId.address.pincode && ` - ${owner.ownerProfile.facilityId.address.pincode}`}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 mt-3">
                  {owner.ownerProfile.facilityId.phone && (
                    <div className="p-3 bg-white rounded-lg">
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Phone</p>
                      <p className="text-sm font-medium text-gray-900">{owner.ownerProfile.facilityId.phone}</p>
                    </div>
                  )}
                  {owner.ownerProfile.facilityId.email && (
                    <div className="p-3 bg-white rounded-lg">
                      <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Email</p>
                      <p className="text-sm font-medium text-gray-900 break-all">{owner.ownerProfile.facilityId.email}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Registration Date */}
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Registered On</p>
            <p className="text-sm font-medium text-gray-900">
              {new Date(owner.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 p-4 rounded-b-2xl border-t">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

export default OwnerDetailsModal;