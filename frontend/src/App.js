import React, { useState } from 'react';
import TriageChatbot from './components/TriageChatbot';
import TriageResult from './components/TriageResult';
import HospitalMap from './components/HospitalMap';
import HospitalList from './components/HospitalList';
import HospitalDashboard from './components/HospitalDashboard';
import SignIn from './components/SignIn';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('user');
  const [currentUser, setCurrentUser] = useState({
    name: 'Hackathon Tester',
    email: 'tester@lifeline.org',
    phone: '+1 555 0199',
    location: { lat: 40.7128, lng: -74.0060 }
  });
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [triageResult, setTriageResult] = useState(null);

  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [loadingSelection, setLoadingSelection] = useState(false);

  const [userLocation, setUserLocation] = useState(null);

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.error(err),
        { enableHighAccuracy: true }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const handlePredict = async (data) => {
    setLoading(true);
    setTriageResult(null);
    setHospitals([]);
    setSelectedHospital(null);

    try {
      const location = userLocation || { lat: 40.7128, lng: -74.0060 };
      const bpRaw = data.bloodPressure || 'normal';
      
      const payload = {
        SpO2: 95, 
        Temperature: 98.6,
        ChestPain: data.injuryType?.toLowerCase().includes('chest') ? 1 : 0,
        InjuryType: data.injuryType || "General",
        Unconscious: 0,
        Diabetes: 0,
        bp: bpRaw === 'low' ? 90 : bpRaw === 'high' ? 140 : 120,
        BP_Risk: bpRaw.charAt(0).toUpperCase() + bpRaw.slice(1),
        age: parseInt(data.age) || 30,
        heartRate: parseInt(data.heartRate) || 80,
        location: location,
        scene_image: data.scene_image || null // Trigger Twist 1 Feature
      };

      const response = await fetch("http://localhost:5000/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();
      
      if (result.success) {
        setTriageResult({
          level: result.decision.severity,
          explanation: result.decision.reasoning,
          action: `Assigned to ${result.decision.best_hospital}`
        });

        // Use actual routing arrays generated from maps & AI algorithms
        setHospitals(result.hospitals.map((h, i) => ({
          ...h,
          id: h._id || String(i),
          type: h.specialists?.includes("Trauma") ? "Level 1 Trauma" : "General Hospital",
          distance: h.eta_minutes ? h.eta_minutes + " mins" : "? mins",
          reasons: ["Computed ETA: " + (h.eta_minutes || '?') + " mins"]
        })));
      } else {
        throw new Error(result.error || "Triage failed");
      }
    } catch (error) {
      console.error("Error predicting:", error);
      setTriageResult({ level: 'Error', explanation: 'Network Error: Make sure node server.js is running on Port 5000', action: 'Retry' });
    } finally {
      setLoading(false);
    }
  };

  const fetchHospitals = async (level) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      // MOCK DATA for hospitals - Enhanced with "Why?" Engine
      const mockHospitals = [
        {
          id: 1, name: "City General Hospital", lat: 40.7128, lng: -74.0060, distance: "1.2 km", type: "General Hospital",
          reasons: ["Closest distance (1.2 km)", "Moderate wait time (15 mins)"]
        },
        {
          id: 2, name: "Metro Trauma Center", lat: 40.7200, lng: -74.0100, distance: "2.5 km", type: "Level 1 Trauma",
          reasons: ["Specialized ICU Available", "Equipped for High Priority trauma", "ETA: 8 mins via ambulance"]
        },
        {
          id: 3, name: "Westside Clinic", lat: 40.7050, lng: -74.0150, distance: "0.8 km", type: "Walk-in Clinic",
          reasons: ["Immediate zero-wait availability", "Closest distance (0.8 km)"]
        },
      ];
      setHospitals(mockHospitals);
    } catch (error) {
      console.error("Error fetching hospitals:", error);
    }
  };

  const handleSelectHospital = async (hospitalId) => {
    setLoadingSelection(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const hospital = hospitals.find(h => h.id === hospitalId);
      if (hospital) {
        setSelectedHospital({
          ...hospital,
          details: "Ambulance dispatched. Patient records and AI reasoning forwarded to the facility."
        });
      }
    } catch (error) {
      console.error("Error selecting hospital:", error);
    } finally {
      setLoadingSelection(false);
    }
  };

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
          <div style={{ fontSize: '1.8rem' }}>🩸</div>
          <h1 className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
            LifeLine App
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '6px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
          <button
            className={`btn-nav ${activeTab === 'user' ? 'active' : ''}`}
            onClick={() => setActiveTab('user')}
          >
            User
          </button>
          <button
            className={`btn-nav ${activeTab === 'hospital' ? 'active' : ''}`}
            onClick={() => setActiveTab('hospital')}
          >
            Hospital
          </button>
          <button
            className={`btn-nav ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            About
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={handleGetLocation}
            className="btn-secondary"
            style={{
              borderColor: userLocation ? 'var(--status-low-color)' : 'var(--glass-border)',
              color: userLocation ? 'var(--status-low-color)' : 'white',
              padding: '10px 16px',
              fontSize: '0.85rem'
            }}
          >
            {userLocation ? '📍 GPS Active' : '📍 Find Location'}
          </button>

          {!currentUser ? (
            <button
              className="btn-primary"
              style={{ padding: '10px 24px', fontSize: '0.95rem', width: 'auto' }}
              onClick={() => setActiveTab('signin')}
            >
              Sign In
            </button>
          ) : (
            <div style={{ position: 'relative' }}>
              <div
                style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6 0%, #2dd4bf 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem', cursor: 'pointer', border: '2px solid rgba(255,255,255,0.2)' }}
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
              </div>

              {showProfileMenu && (
                <div className="glass-panel animate-fade-in" style={{ position: 'absolute', top: '55px', right: '0', width: '250px', padding: '20px', zIndex: 100, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                  <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6 0%, #2dd4bf 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '2rem', margin: '0 auto 8px auto' }}>
                      {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <strong style={{ fontSize: '1.1rem' }}>{currentUser.name || 'User'}</strong>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>{currentUser.email}</p>
                  </div>
                  <div style={{ borderTop: '1px solid var(--glass-border)', margin: '16px 0' }}></div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                    <p style={{ margin: '6px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>📞 {currentUser.phone || 'N/A'}</p>
                    <p style={{ margin: '6px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>📍 {currentUser.location?.lat ? 'GPS Synced' : 'No Location set'}</p>
                  </div>
                  <button
                    className="btn-secondary"
                    style={{ width: '100%', fontSize: '0.85rem', padding: '10px' }}
                    onClick={() => { setCurrentUser(null); setShowProfileMenu(false); }}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* USER TAB */}
      {activeTab === 'user' && (
        <div className="animate-fade-in">
          <header style={{ marginBottom: '32px', textAlign: 'center' }}>
            <h2 className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>
              AI Triage Chatbot
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
              Conversational Assistant, Medical Decision Engine & Real-Time Routing.
            </p>
          </header>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '24px' }}>
            <div style={{ maxWidth: '650px', margin: '0 auto', width: '100%' }}>
              <TriageChatbot onSubmit={handlePredict} loading={loading} predictionResult={triageResult} />
              <TriageResult result={triageResult} />
            </div>

            {hospitals.length > 0 && (
              <div>
                <HospitalMap hospitals={hospitals} selectedHospital={selectedHospital} userLocation={userLocation} />
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

      {/* HOSPITAL PORTAL TAB */}
      {activeTab === 'hospital' && (
        <HospitalDashboard />
      )}

      {/* ABOUT TAB */}
      {activeTab === 'about' && (
        <div className="glass-panel animate-slide-up" style={{ padding: '64px 32px', minHeight: '50vh' }}>
          <h2 className="text-gradient" style={{ fontSize: '2rem', marginBottom: '24px', textAlign: 'center' }}>About LifeLine AI</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '24px', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
              <h3 style={{ color: 'var(--accent-blue)', marginBottom: '12px' }}>Intelligent Extraction</h3>
              <p style={{ color: 'var(--text-primary)', opacity: 0.9, lineHeight: 1.6 }}>
                We replaced clunky patient intake forms with conversational bots that utilize Natural Language Processing to extract vital indicators instantly.
              </p>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '24px', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
              <h3 style={{ color: '#fbbf24', marginBottom: '12px' }}>Deterministic Medical Engine</h3>
              <p style={{ color: 'var(--text-primary)', opacity: 0.9, lineHeight: 1.6 }}>
                Triage requires Explainable AI (XAI). Outputs clearly define exactly which parameters triggered high-risk alerts before proposing admission actions.
              </p>
            </div>
            <div style={{ gridColumn: '1 / -1', background: 'rgba(0,0,0,0.2)', padding: '24px', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
              <h3 style={{ color: '#34d399', marginBottom: '12px', textAlign: 'center' }}>Dynamic Optimization Routing</h3>
              <p style={{ color: 'var(--text-primary)', opacity: 0.9, lineHeight: 1.6, textAlign: 'center' }}>
                We draw polygons and map logic to coordinate live geolocation data against facility endpoints—finding you the exact hospital that matches your priority load requirement and transit parameters.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SIGN IN TAB */}
      {activeTab === 'signin' && (
        <SignIn onSignIn={(user) => {
          setCurrentUser(user);
          setActiveTab('user');
        }} />
      )}

    </div>
  );
}

export default App;
