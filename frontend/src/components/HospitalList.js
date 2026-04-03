import React from 'react';

const HospitalList = ({ hospitals, selectedHospital, onSelectHospital, loadingSelection }) => {
  if (!hospitals || hospitals.length === 0) return null;

  return (
    <div className="glass-panel animate-slide-up-delay-2" style={{ padding: '24px' }}>
      <h2 style={{ marginBottom: '16px', fontSize: '1.5rem', fontWeight: 600 }}>
        Hospital Optimization Engine
      </h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {hospitals.map(hospital => {
          const isSelected = selectedHospital && selectedHospital.id === hospital.id;
          return (
            <div 
              key={hospital.id}
              style={{
                padding: '16px',
                borderRadius: '12px',
                background: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'var(--glass-bg)',
                border: `1px solid ${isSelected ? 'var(--accent-blue)' : 'var(--glass-border)'}`,
                display: 'flex',
                justifyContent: 'space-between',
                flexDirection: 'column',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '4px', color: isSelected ? 'var(--accent-blue)' : 'var(--text-primary)' }}>
                    {hospital.name}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '8px' }}>
                    {hospital.distance} • {hospital.type}
                  </p>
                </div>
                <div>
                  {isSelected ? (
                    <span style={{
                      background: 'var(--accent-blue)',
                      color: 'white',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      whiteSpace: 'nowrap',
                      boxShadow: '0 0 8px var(--accent-blue)'
                    }}>
                      🚑 Dispatching Route...
                    </span>
                  ) : (
                    <button 
                      className="btn-secondary"
                      disabled={loadingSelection}
                      onClick={() => onSelectHospital(hospital.id)}
                    >
                      Route Here
                    </button>
                  )}
                </div>
              </div>

              {/* Engine Reasons Display */}
              <div style={{
                background: 'rgba(0,0,0,0.2)',
                padding: '12px',
                borderRadius: '8px',
                marginTop: '8px'
              }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Optimization Features:
                </span>
                <ul style={{ margin: '6px 0 0 20px', fontSize: '0.85rem', color: 'var(--text-primary)', opacity: 0.9 }}>
                  {hospital.reasons.map((reason, idx) => (
                    <li key={idx} style={{ marginBottom: '4px' }}>{reason}</li>
                  ))}
                </ul>
              </div>

              {isSelected && hospital.details && (
                <p style={{ color: 'var(--accent-blue)', fontSize: '0.9rem', marginTop: '12px', paddingLeft: '8px', borderLeft: '3px solid var(--accent-blue)' }}>
                  ✅ {hospital.details}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HospitalList;
