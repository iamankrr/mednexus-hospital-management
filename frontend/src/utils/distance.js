// utils/distance.js - Distance Calculation using Haversine Formula

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/**
 * Format distance for display
 */
export const formatDistance = (distance) => {
  if (!distance && distance !== 0) return '';
  if (distance < 1) {
    return `${Math.round(distance * 1000)} m`;
  }
  return `${distance.toFixed(1)} km`;
};

/**
 * Sort facilities by distance
 */
export const sortByDistance = (facilities, userLat, userLng) => {
  if (!facilities) return [];
  
  return facilities.map(facility => ({
    ...facility,
    distance: calculateDistance(
      userLat,
      userLng,
      facility.location.coordinates[1], // latitude
      facility.location.coordinates[0]  // longitude
    )
  })).sort((a, b) => a.distance - b.distance);
};

export default {
  calculateDistance,
  formatDistance,
  sortByDistance
};