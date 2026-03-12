import React from 'react';
import { FaMapMarkerAlt } from 'react-icons/fa';

const MapButton = ({ hospital, fullWidth }) => {
  const handleMapClick = (e) => {
    if (e) e.stopPropagation();
    
    // ✅ FIX: Safe URL construction for Google Maps Directions
    const baseUrl = "https://www" + ".google." + "com/maps/dir/?api=1";
    let finalUrl = baseUrl;

    if (hospital?.googlePlaceId) {
      finalUrl += "&destination=" + encodeURIComponent(hospital.name) + "&destination_place_id=" + hospital.googlePlaceId;
    } else if (hospital?.location?.coordinates) {
      const [lng, lat] = hospital.location.coordinates;
      finalUrl += "&destination=" + lat + "," + lng;
    } else if (hospital?.address) {
      const addressString = [hospital.address.area, hospital.address.city, hospital.address.state].filter(Boolean).join(', ');
      finalUrl += "&destination=" + encodeURIComponent(`${hospital.name}, ${addressString}`);
    } else {
      finalUrl += "&destination=" + encodeURIComponent(hospital?.name || "Hospital");
    }

    window.open(finalUrl, '_blank');
  };

  return (
    <button
      onClick={handleMapClick}
      className={`flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-sm ${fullWidth ? 'w-full' : ''}`}
    >
      <FaMapMarkerAlt /> Get Directions
    </button>
  );
};

export default MapButton;