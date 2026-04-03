import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom, { animate: true });
    }
  }, [center, zoom, map]);
  return null;
}

const customUserIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const HospitalMap = ({ hospitals, selectedHospital, userLocation }) => {
  const defaultCenter = [40.7128, -74.0060]; 
  
  // Try to center correctly based on selection or location
  const center = selectedHospital
    ? [selectedHospital.lat, selectedHospital.lng]
    : userLocation ? [userLocation.lat, userLocation.lng]
    : hospitals.length > 0
    ? [hospitals[0].lat, hospitals[0].lng]
    : defaultCenter;

  return (
    <div className="glass-panel animate-slide-up-delay-1" style={{ overflow: 'hidden', height: '350px', marginBottom: '24px' }}>
      <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%', zIndex: 1 }}>
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ChangeView center={center} zoom={ selectedHospital ? 14 : 12 } />
        
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={customUserIcon}>
            <Popup><strong>📍 Patient Location</strong></Popup>
          </Marker>
        )}

        {hospitals.map(hospital => {
          const isSelected = selectedHospital && selectedHospital.id === hospital.id;
          
          return (
            <React.Fragment key={hospital.id}>
              <Marker position={[hospital.lat, hospital.lng]}>
                <Popup>
                  <div style={{ color: '#000' }}>
                    <strong>{hospital.name}</strong><br/>
                    {hospital.type}<br/>
                    {isSelected && <div style={{ color: 'var(--accent-blue)', fontWeight: 'bold' }}>★ Dispatched Target</div>}
                  </div>
                </Popup>
              </Marker>
              
              {/* Draw animated polyline route from user to recommended hospital */}
              {userLocation && isSelected && (
                <Polyline 
                  positions={[
                    [userLocation.lat, userLocation.lng],
                    [hospital.lat, hospital.lng]
                  ]} 
                  pathOptions={{ color: 'var(--accent-blue)', weight: 4, dashArray: '5, 10' }} 
                />
              )}
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default HospitalMap;
