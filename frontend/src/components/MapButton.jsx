import React from 'react';
import { FaMapMarkerAlt, FaDirections } from 'react-icons/fa';

const MapButton = ({ hospital }) => {
  const openRoute = () => {
    if (!hospital) return;

    // If Google Maps URL already saved
    if (hospital.googleMapsUrl) {
      window.open(hospital.googleMapsUrl, '_blank');
      return;
    }

    // Build from coordinates
    if (hospital.location?.coordinates) {
      const lng = hospital.location.coordinates[0];
      const lat = hospital.location.coordinates[1];
      const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      window.open(url, '_blank');
      return;
    }

    // Fallback - search by name + address
    const query = encodeURIComponent(
      `${hospital.name} ${hospital.address?.city || ''} ${hospital.address?.state || ''}`
    );
    window.open(`https://www.google.com/maps/search/${query}`, '_blank');
  };

  return (
    <button
      onClick={openRoute}
      className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-white transition hover:opacity-90 active:scale-95"
      style={{ backgroundColor: hospital?.themeColor || '#059669' }}
    >
      <FaMapMarkerAlt />
      Get Directions
    </button>
  );
};

export default MapButton;