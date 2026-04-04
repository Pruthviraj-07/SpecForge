import React, { useState } from 'react'
import { massCasualtyTriage } from '../services/api'

const emptyPatient = () => ({
  age: '', heartRate: '', spo2: '', bloodPressure: '',
  symptoms: '', location: { lat: 18.5204, lng: 73.8567 }
})

const MassCasualty = ({ userLocation }) => {
  const [patients, setPatients] = useState([emptyPatient(), emptyPatient()])
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  const addPatient = () => setPatients(prev => [...prev, emptyPatient()])

  const removePatient = (idx) => {
    if (patients.length <= 2) return
    setPatients(prev => prev.filter((_, i) => i !== idx))
  }

  const updatePatient = (idx, field, value) => {
    setPatients(prev => prev.map((p, i) => i === idx ? { ...p, [field]: value } : p))
  }

  const handleSubmit = async () => {
    setLoading(true)
    setResults([])
    try {
      const loc = userLocation || { lat: 18.5204, lng: 73.8567 }
      const payload = patients.map(p => ({
        age: Number(p.age) || 30,
        heartRate: Number(p.heartRate) || 80,
        spo2: Number(p.spo2) || 95,
        bloodPressure: p.bloodPressure || '120/80',
        symptoms: p.symptoms ? p.symptoms.split(',').map(s => s.trim()) : ['general'],
        location: loc
      }))
      const response = await massCasualtyTriage(payload)
      if (response.success) setResults(response.results)
    } catch (err) {
      alert('Error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const severityColor = (s) =>
    s === 'Critical' ? '#ef4444' : s === 'Moderate' ? '#f97316' : '#10b981'

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h2 style={{
          fontFamily: 'Rajdhani, sans-serif',
          fontSize: '1.8rem',
          fontWeight: 700,
          letterSpacing: '2px',
          textTransform: 'uppercase',
          marginBottom: '8px'
        }}>
          <span className="gradient-red">⚠️ Mass Casualty Mode</span>
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Route multiple patients simultaneously without overloading any single hospital
        </p>
      </div>

      {/* Patient Forms */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
        {patients.map((patient, idx) => (
          <div key={idx} className="glass" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{
                fontFamily: 'Rajdhani, sans-serif',
                fontWeight: 700,
                fontSize: '1rem',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                color: 'var(--accent-blue)'
              }}>
                Patient #{idx + 1}
              </span>
              {patients.length > 2 && (
                <button
                  className="btn-secondary"
                  style={{ padding: '4px 12px', fontSize: '0.8rem', color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}
                  onClick={() => removePatient(idx)}
                >
                  Remove
                </button>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
              {[
                { key: 'age', label: 'Age', placeholder: '45' },
                { key: 'heartRate', label: 'Heart Rate', placeholder: '120' },
                { key: 'spo2', label: 'SpO2 %', placeholder: '92' },
                { key: 'bloodPressure', label: 'Blood Pressure', placeholder: '140/90' },
              ].map(field => (
                <div key={field.key}>
                  <label className="field-label">{field.label}</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder={field.placeholder}
                    value={patient[field.key]}
                    onChange={e => updatePatient(idx, field.key, e.target.value)}
                  />
                </div>
              ))}
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="field-label">Symptoms (comma separated)</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="chest pain, breathlessness"
                  value={patient.symptoms}
                  onChange={e => updatePatient(idx, 'symptoms', e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button className="btn-secondary" onClick={addPatient} style={{ flex: 1 }}>
          + Add Patient
        </button>
        <button
          className="btn-danger"
          onClick={handleSubmit}
          disabled={loading}
          style={{ flex: 2 }}
        >
          {loading ? '⏳ Routing All Patients...' : '🚨 Route All Patients Now'}
        </button>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div>
          <div style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
            marginBottom: '12px'
          }}>
            Routing Results — {results.length} Patients Assigned
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {results.map((result, idx) => (
              <div key={idx} className="glass" style={{
                padding: '16px',
                borderLeft: `3px solid ${severityColor(result.decision?.severity)}`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 700 }}>Patient #{idx + 1}</span>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: severityColor(result.decision?.severity),
                    background: `${severityColor(result.decision?.severity)}15`,
                    padding: '3px 10px',
                    borderRadius: '12px',
                    border: `1px solid ${severityColor(result.decision?.severity)}30`
                  }}>
                    {result.decision?.severity}
                  </span>
                </div>
                <div style={{ fontSize: '0.9rem', color: '#60a5fa', fontWeight: 600, marginBottom: '4px' }}>
                  🏥 → {result.decision?.best_hospital}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace' }}>
                  ETA: {result.decision?.eta_minutes} min
                </div>
                <div style={{ fontSize: '0.83rem', color: 'var(--text-primary)', opacity: 0.8, marginTop: '8px', lineHeight: 1.5 }}>
                  {result.decision?.reasoning}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default MassCasualty
