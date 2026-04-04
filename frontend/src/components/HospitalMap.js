import React, { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix default icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
})

const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
})

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
})

const blueIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
})

function ChangeView({ center, zoom }) {
  const map = useMap()
  useEffect(() => {
    if (center) map.setView(center, zoom, { animate: true })
  }, [center, zoom, map])
  return null
}

const HospitalMap = ({ hospitals, selectedHospital, userLocation }) => {
  const defaultCenter = [18.5204, 73.8567] // Pune center

  const center = selectedHospital
    ? [selectedHospital.lat, selectedHospital.lng]
    : userLocation
    ? [userLocation.lat, userLocation.lng]
    : hospitals?.length > 0
    ? [hospitals[0].lat, hospitals[0].lng]
    : defaultCenter

  return (
    <div className="glass fade-up-1" style={{ overflow: 'hidden', height: '380px', marginBottom: '20px' }}>

      {/* Map Header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid var(--glass-border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span style={{
          fontFamily: 'Rajdhani, sans-serif',
          fontWeight: 700,
          fontSize: '0.95rem',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          color: 'var(--text-secondary)'
        }}>
          🗺️ Live Routing Map
        </span>
        <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          <span>🟢 Selected</span>
          <span>🔴 Rejected</span>
          <span>🔵 Ambulance</span>
        </div>
      </div>

      <MapContainer
        center={center}
        zoom={13}
        style={{ height: 'calc(100% - 45px)', width: '100%', zIndex: 1 }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ChangeView center={center} zoom={selectedHospital ? 14 : 13} />

        {/* Ambulance / User Location */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={blueIcon}>
            <Popup>
              <div style={{ color: '#000', fontWeight: 600 }}>🚑 Ambulance Location</div>
            </Popup>
          </Marker>
        )}

        {/* Hospital Markers */}
        {hospitals?.map((hospital, idx) => {
          const isSelected = selectedHospital && selectedHospital.name === hospital.name
          return (
            <React.Fragment key={idx}>
              <Marker
                position={[hospital.lat, hospital.lng]}
                icon={isSelected ? greenIcon : redIcon}
              >
                <Popup>
                  <div style={{ color: '#000', minWidth: '180px' }}>
                    <div style={{ fontWeight: 700, marginBottom: '4px' }}>{hospital.name}</div>
                    <div>📍 {hospital.distance}</div>
                    <div>⏱️ ETA: {hospital.eta} mins</div>
                    <div>🏥 ICU: {hospital.icu} beds</div>
                    <div>💨 Ventilators: {hospital.ventilator}</div>
                    {isSelected && (
                      <div style={{ color: 'green', fontWeight: 700, marginTop: '6px' }}>
                        ✅ SELECTED
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>

              {/* Route line from ambulance to selected hospital */}
              {userLocation && isSelected && (
                <Polyline
                  positions={[
                    [userLocation.lat, userLocation.lng],
                    [hospital.lat, hospital.lng]
                  ]}
                  pathOptions={{
                    color: '#3b82f6',
                    weight: 4,
                    dashArray: '8, 12',
                    opacity: 0.8
                  }}
                />
              )}
            </React.Fragment>
          )
        })}
      </MapContainer>
    </div>
  )
}

export default HospitalMap