import React from 'react'

const HospitalList = ({ hospitals, selectedHospital, onSelectHospital, loadingSelection }) => {
  if (!hospitals || hospitals.length === 0) return null

  return (
    <div className="glass fade-up-2" style={{ padding: '20px' }}>

      {/* Header */}
      <div style={{
        marginBottom: '16px',
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
          🏥 Hospital Routing Engine
        </span>
        <span style={{
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
          fontFamily: 'JetBrains Mono, monospace'
        }}>
          {hospitals.length} facilities evaluated
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {hospitals.map((hospital, idx) => {
          const isSelected = selectedHospital && selectedHospital.name === hospital.name
          const isDispatched = selectedHospital && selectedHospital.name === hospital.name && selectedHospital.details

          return (
            <div
              key={idx}
              style={{
                padding: '16px',
                borderRadius: '12px',
                background: isSelected
                  ? 'rgba(59,130,246,0.08)'
                  : 'rgba(255,255,255,0.02)',
                border: `1px solid ${isSelected ? 'rgba(59,130,246,0.35)' : 'var(--glass-border)'}`,
                transition: 'all 0.3s ease'
              }}
            >
              {/* Hospital Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div>
                  <div style={{
                    fontWeight: 700,
                    fontSize: '1rem',
                    color: isSelected ? '#60a5fa' : 'var(--text-primary)',
                    marginBottom: '4px'
                  }}>
                    {isSelected && '✅ '}{hospital.name}
                  </div>
                  <div style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    fontFamily: 'JetBrains Mono, monospace'
                  }}>
                    {hospital.distance} • ETA {hospital.eta} min
                  </div>
                </div>

                {isSelected ? (
                  <span style={{
                    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                    color: 'white',
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    boxShadow: '0 0 12px rgba(59,130,246,0.4)'
                  }}>
                    🚑 {isDispatched ? 'Dispatched' : 'Selected'}
                  </span>
                ) : (
                  <button
                    className="btn-secondary"
                    style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                    disabled={loadingSelection}
                    onClick={() => onSelectHospital(hospital.id)}
                  >
                    Route Here
                  </button>
                )}
              </div>

              {/* Resource Stats */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '6px',
                marginBottom: '10px'
              }}>
                {[
                  { label: 'ICU', value: hospital.icu, warn: hospital.icu === 0 },
                  { label: 'Vent', value: hospital.ventilator, warn: hospital.ventilator === 0 },
                  { label: 'ECG', value: hospital.ECG || '—' },
                  { label: 'BiPAP', value: hospital.bipap || '—' },
                ].map((stat, i) => (
                  <div key={i} style={{
                    background: stat.warn ? 'rgba(239,68,68,0.08)' : 'rgba(0,0,0,0.2)',
                    border: `1px solid ${stat.warn ? 'rgba(239,68,68,0.2)' : 'var(--glass-border)'}`,
                    borderRadius: '8px',
                    padding: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      fontFamily: 'JetBrains Mono, monospace',
                      color: stat.warn ? '#ef4444' : 'var(--text-primary)'
                    }}>
                      {stat.value}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Reasons */}
              <div style={{
                background: 'rgba(0,0,0,0.2)',
                borderRadius: '8px',
                padding: '10px 12px'
              }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', fontWeight: 600 }}>
                  Optimization Notes
                </div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  {hospital.reasons?.map((reason, i) => (
                    <li key={i} style={{ fontSize: '0.83rem', color: 'var(--text-primary)', opacity: 0.85 }}>
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Dispatched confirmation */}
              {isDispatched && hospital.details && (
                <div style={{
                  marginTop: '10px',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: 'rgba(59,130,246,0.08)',
                  borderLeft: '3px solid #3b82f6',
                  fontSize: '0.85rem',
                  color: '#60a5fa'
                }}>
                  ✅ {hospital.details}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default HospitalList