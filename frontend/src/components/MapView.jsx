import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css'; // ✅ REQUIRED FOR MAP STYLING
import L from 'leaflet';

// 🎨 Custom Modern Icons for Map
const createCustomIcon = (type) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: ${type === 'hospital' ? '#2563eb' : '#9333ea'}; 
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
      ${type === 'hospital' ? '🏥' : '🔬'}
    </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18]
  });
};

// 📍 Component to auto-center map when user location changes
const ChangeView = ({ center, zoom }) => {
  const map = useMap();
  map.setView(center, zoom);
  return null;
};

const MapView = ({ items, type, userLocation }) => {
  const navigate = useNavigate();

  // Default center: User location OR Center of India
  const defaultCenter = userLocation 
    ? [userLocation.lat, userLocation.lng] 
    : [20.5937, 78.9629]; 
    
  const defaultZoom = userLocation ? 12 : 5;

  return (
    <div className="w-full h-[600px] rounded-2xl overflow-hidden shadow-inner border border-gray-200 relative z-0">
      <MapContainer 
        center={defaultCenter} 
        zoom={defaultZoom} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <ChangeView center={defaultCenter} zoom={defaultZoom} />

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

        {/* 🏥/🔬 Markers for Hospitals/Labs */}
        {items.map((item) => {
          // Check if coordinates exist (assuming backend sends [lng, lat] or similar)
          const coords = item.location?.coordinates || item.coordinates;
          if (!coords || coords.length !== 2) return null;

          // Leaflet expects [lat, lng]. Backend usually stores [lng, lat]. Let's handle both.
          // Adjust this based on your backend. Usually GeoJSON is [lng, lat].
          const lat = coords[1];
          const lng = coords[0];

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
                    className={`w-full py-1.5 text-white text-xs font-bold rounded-lg transition ${type === 'hospital' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'}`}
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