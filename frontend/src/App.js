import React, { useState, useEffect } from 'react'
import TriageChatbot from './components/TriageChatbot'
import TriageResult from './components/TriageResult'
import HospitalMap from './components/HospitalMap'
import HospitalList from './components/HospitalList'
import HospitalDashboard from './components/HospitalDashboard'
import { triagePatient, getHospitals } from './services/api'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('user')
  const [loading, setLoading] = useState(false)
  const [triageResult, setTriageResult] = useState(null)
  const [hospitals, setHospitals] = useState([])
  const [selectedHospital, setSelectedHospital] = useState(null)
  const [loadingSelection, setLoadingSelection] = useState(false)
  const [userLocation, setUserLocation] = useState(null)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [currentUser] = useState({
    name: 'Dispatcher',
    email: 'dispatcher@specforge.org',
    phone: '+91 98765 43210',
  })

  // Auto get location on load
  useEffect(() => {
    handleGetLocation()
  }, [])

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        }),
        (err) => {
          console.error(err)
          // Fallback to Pune center
          setUserLocation({ lat: 18.5204, lng: 73.8567 })
        },
        { enableHighAccuracy: true }
      )
    } else {
      setUserLocation({ lat: 18.5204, lng: 73.8567 })
    }
  }

  // Main triage function — connects to backend
  const handlePredict = async (data) => {
    setLoading(true)
    setTriageResult(null)
    setHospitals([])
    setSelectedHospital(null)

    try {
      // Make sure we have location
      const location = userLocation || { lat: 18.5204, lng: 73.8567 }

      // Build patient payload for backend
      const patientPayload = {
        age: Number(data.age) || 30,
        heartRate: Number(data.heartRate),
        spo2: Number(data.spo2) || 95,
        bloodPressure: data.bloodPressure || '120/80',
        symptoms: Array.isArray(data.symptoms)
          ? data.symptoms
          : [data.injuryType || 'general'],
        scene_image: data.scene_image,
        language: data.language || 'English',
        context: data.context || '',
        location
      }

      // Call backend
      const response = await triagePatient(patientPayload)

      if (response.success) {
        const decision = response.decision

        // Format result for TriageResult component
        setTriageResult({
          level: decision.severity === 'Critical'
            ? 'High'
            : decision.severity === 'Moderate'
            ? 'Medium'
            : 'Low',
          explanation: decision.reasoning,
          first_aid: decision.first_aid || [],
          action: `Go to ${decision.best_hospital} — ETA ${decision.eta_minutes} mins`,
          decision,
          rejected: decision.rejected_hospitals
        })

        // Format hospitals for HospitalMap + HospitalList
        const formattedHospitals = response.hospitals.map((h, index) => ({
          id: h._id || index,
          name: h.name,
          lat: h.location.lat,
          lng: h.location.lng,
          distance: `${h.distance_km} km`,
          type: h.specialists?.join(', ') || 'General',
          icu: h.icu,
          ventilator: h.ventilator,
          eta: h.eta_minutes,
          isSelected: h.name === decision.best_hospital,
          reasons: h.name === decision.best_hospital
            ? [
                `✅ Best match for patient needs`,
                `📍 Distance: ${h.distance_km} km`,
                `⏱️ ETA: ${h.eta_minutes} minutes`,
                `🏥 ICU beds: ${h.icu}`,
                `💨 Ventilators: ${h.ventilator}`
              ]
            : decision.rejected_hospitals
                ?.find(r => r.name === h.name)
                ? [`❌ ${decision.rejected_hospitals.find(r => r.name === h.name).reason}`]
                : [`📍 Distance: ${h.distance_km} km`]
        }))

        setHospitals(formattedHospitals)

        // Auto select best hospital
        const best = formattedHospitals.find(
          h => h.name === decision.best_hospital
        )
        if (best) setSelectedHospital(best)
      }

    } catch (error) {
      console.error('Triage error:', error)
      alert('Error connecting to backend. Make sure server is running on port 5000.')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectHospital = async (hospitalId) => {
    setLoadingSelection(true)
    try {
      const hospital = hospitals.find(h => h.id === hospitalId)
      if (hospital) {
        setSelectedHospital({
          ...hospital,
          details: `Ambulance dispatched to ${hospital.name}. ETA: ${hospital.eta} minutes.`
        })
      }
    } finally {
      setLoadingSelection(false)
    }
  }

  return (
    <div style={{ padding: '0 24px 24px', maxWidth: '1200px', margin: '0 auto' }}>

      {/* Navigation Bar */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 0',
        marginBottom: '32px',
        borderBottom: '1px solid var(--glass-border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '1.8rem' }}>🚑</div>
          <h1 className="text-gradient" style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            margin: 0
          }}>
            SpecForge Triage
          </h1>
        </div>

        <div style={{
          display: 'flex',
          gap: '8px',
          background: 'rgba(0,0,0,0.2)',
          padding: '6px',
          borderRadius: '12px',
          border: '1px solid var(--glass-border)'
        }}>
          <button
            className={`btn-nav ${activeTab === 'user' ? 'active' : ''}`}
            onClick={() => setActiveTab('user')}
          >
            🚨 Dispatch
          </button>
          <button
            className={`btn-nav ${activeTab === 'hospital' ? 'active' : ''}`}
            onClick={() => setActiveTab('hospital')}
          >
            🏥 Hospital
          </button>
          <button
            className={`btn-nav ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            ℹ️ About
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={handleGetLocation}
            className="btn-secondary"
            style={{
              borderColor: userLocation
                ? 'var(--status-low-color)'
                : 'var(--glass-border)',
              color: userLocation
                ? 'var(--status-low-color)'
                : 'white',
              padding: '10px 16px',
              fontSize: '0.85rem'
            }}
          >
            {userLocation ? '📍 GPS Active' : '📍 Find Location'}
          </button>

          <div style={{ position: 'relative' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2dd4bf 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '1.2rem',
                cursor: 'pointer',
                border: '2px solid rgba(255,255,255,0.2)'
              }}
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              {currentUser.name.charAt(0)}
            </div>

            {showProfileMenu && (
              <div className="glass-panel animate-fade-in" style={{
                position: 'absolute',
                top: '55px',
                right: '0',
                width: '250px',
                padding: '20px',
                zIndex: 100,
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
              }}>
                <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                  <strong>{currentUser.name}</strong>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    {currentUser.email}
                  </p>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <p>📞 {currentUser.phone}</p>
                  <p>📍 {userLocation ? 'GPS Active' : 'No location'}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* DISPATCH TAB */}
      {activeTab === 'user' && (
        <div className="animate-fade-in">
          <header style={{ marginBottom: '32px', textAlign: 'center' }}>
            <h2 className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>
              AI Emergency Triage
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
              Real-time AI routing to the right hospital — not just the nearest one.
            </p>
          </header>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
            gap: '24px'
          }}>
            <div style={{ maxWidth: '650px', margin: '0 auto', width: '100%' }}>
              <TriageChatbot
                onSubmit={handlePredict}
                loading={loading}
                predictionResult={triageResult}
              />
              <TriageResult result={triageResult} />
            </div>

            {hospitals.length > 0 && (
              <div>
                <HospitalMap
                  hospitals={hospitals}
                  selectedHospital={selectedHospital}
                  userLocation={userLocation}
                />
                <HospitalList
                  hospitals={hospitals}
                  selectedHospital={selectedHospital}
                  onSelectHospital={handleSelectHospital}
                  loadingSelection={loadingSelection}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* HOSPITAL TAB */}
      {activeTab === 'hospital' && (
        <HospitalDashboard />
      )}

      {/* ABOUT TAB */}
      {activeTab === 'about' && (
        <div className="glass-panel animate-slide-up" style={{
          padding: '64px 32px',
          minHeight: '50vh'
        }}>
          <h2 className="text-gradient" style={{
            fontSize: '2rem',
            marginBottom: '24px',
            textAlign: 'center'
          }}>
            About SpecForge
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '32px',
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            <div style={{
              background: 'rgba(0,0,0,0.2)',
              padding: '24px',
              borderRadius: '16px',
              border: '1px solid var(--glass-border)'
            }}>
              <h3 style={{ color: 'var(--accent-blue)', marginBottom: '12px' }}>
                🤖 Groq + LLaMA 3.3 70B
              </h3>
              <p style={{ color: 'var(--text-primary)', opacity: 0.9, lineHeight: 1.6 }}>
                AI triage engine powered by LLaMA 3.3 70B running on Groq's
                ultra-fast inference. Makes medical routing decisions in under
                2 seconds with full explainability.
              </p>
            </div>
            <div style={{
              background: 'rgba(0,0,0,0.2)',
              padding: '24px',
              borderRadius: '16px',
              border: '1px solid var(--glass-border)'
            }}>
              <h3 style={{ color: '#fbbf24', marginBottom: '12px' }}>
                🗺️ OSRM + OpenStreetMap
              </h3>
              <p style={{ color: 'var(--text-primary)', opacity: 0.9, lineHeight: 1.6 }}>
                Real road distances and ETAs using OSRM — completely free,
                no API keys needed. Route visualization via Leaflet maps.
              </p>
            </div>
            <div style={{
              gridColumn: '1 / -1',
              background: 'rgba(0,0,0,0.2)',
              padding: '24px',
              borderRadius: '16px',
              border: '1px solid var(--glass-border)'
            }}>
              <h3 style={{
                color: '#34d399',
                marginBottom: '12px',
                textAlign: 'center'
              }}>
                ⚡ Real-Time Socket.io Updates
              </h3>
              <p style={{
                color: 'var(--text-primary)',
                opacity: 0.9,
                lineHeight: 1.6,
                textAlign: 'center'
              }}>
                Hospital bed counts update every 30 seconds automatically
                via Socket.io — no page refresh needed. If a hospital fills
                up, the system recalculates instantly.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App