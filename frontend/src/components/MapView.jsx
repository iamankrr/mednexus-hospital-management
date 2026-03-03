import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// 🎨 Custom Modern Icons for Map
const createCustomIcon = (type) => {
  const isHospital = type === 'hospital' || type === 'Hospitals';
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: ${isHospital ? '#2563eb' : '#9333ea'}; 
      color: white; 
      padding: 5px; 
      border-radius: 50%; 
      width: 36px; 
      height: 36px; 
      display: flex; 
      justify-content: center; 
      align-items: center; 
      border: 3px solid white; 
      box-shadow: 0 4px 6px rgba(0,0,0,0.3); 
      font-size: 16px;">
      ${isHospital ? '🏥' : '🔬'}
    </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18]
  });
};

// 📍 Component to auto-center map
const ChangeView = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

const MapView = ({ items, type, userLocation }) => {
  const navigate = useNavigate();

  // Default center: User location OR Center of India
  let mapCenter = [20.5937, 78.9629];
  let mapZoom = 5;

  if (userLocation) {
    mapCenter = [userLocation.lat, userLocation.lng];
    mapZoom = 12;
  } else if (items && items.length > 0) {
    const firstItem = items[0];
    const coords = firstItem.location?.coordinates || firstItem.coordinates;
    if (coords && coords.length === 2) {
      mapCenter = [coords[1], coords[0]]; 
      mapZoom = 11;
    } else if (firstItem.lat && firstItem.lng) {
      mapCenter = [firstItem.lat, firstItem.lng];
      mapZoom = 11;
    }
  }

  return (
    // ✅ FIX: Adjusted Size! Phone me 50vh, Desktop me fixed 600px.
    <div className="w-full h-[50vh] md:h-[600px] rounded-2xl overflow-hidden shadow-md border border-gray-200 relative z-0">
      <MapContainer 
        center={mapCenter} 
        zoom={mapZoom} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <ChangeView center={mapCenter} zoom={mapZoom} />

        {/* 🔵 Blue Dot for User Location */}
        {userLocation && (
          <Marker 
            position={[userLocation.lat, userLocation.lng]}
            icon={L.divIcon({
              className: 'user-marker',
              html: `<div style="background-color: #3b82f6; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(59,130,246,0.8);"></div>`,
              iconSize: [16, 16]
            })}
          >
            <Popup>You are here 📍</Popup>
          </Marker>
        )}

        {/* 🏥/🔬 Markers for Facilities */}
        {items.map((item) => {
          let lat, lng;
          
          if (item.location?.coordinates?.length === 2) {
            lng = item.location.coordinates[0];
            lat = item.location.coordinates[1];
          } else if (item.coordinates?.length === 2) {
            lng = item.coordinates[0];
            lat = item.coordinates[1];
          } else if (item.lat && item.lng) {
            lat = item.lat;
            lng = item.lng;
          } else if (item.latitude && item.longitude) {
            lat = item.latitude;
            lng = item.longitude;
          }

          if (!lat || !lng) return null; 

          return (
            <Marker 
              key={item._id || item.id} 
              position={[lat, lng]}
              icon={createCustomIcon(type)}
            >
              <Popup className="custom-popup">
                <div className="p-1 min-w-[200px]">
                  <h3 className="font-bold text-gray-900 text-sm mb-1">{item.name}</h3>
                  <p className="text-xs text-gray-600 mb-2">
                    {item.address?.city}, {item.address?.state}
                  </p>
                  <button 
                    onClick={() => navigate(`/${type}/${item._id || item.id}`, { state: { facilityData: item } })}
                    className={`w-full py-1.5 text-white text-xs font-bold rounded-lg transition ${type === 'hospital' || type === 'Hospitals' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'}`}
                  >
                    View Details
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapView;