import React from 'react';

const TriageResult = ({ result }) => {
  if (!result) return null;

  const levelStyles = {
    High: {
      color: 'var(--status-high-color)',
      bg: 'var(--status-high-bg)',
      border: 'var(--status-high-border)',
      icon: '🚨',
      actionColor: '#f87171'
    },
    Medium: {
      color: 'var(--status-medium-color)',
      bg: 'var(--status-medium-bg)',
      border: 'var(--status-medium-border)',
      icon: '⚠️',
      actionColor: '#fbbf24'
    },
    Low: {
      color: 'var(--status-low-color)',
      bg: 'var(--status-low-bg)',
      border: 'var(--status-low-border)',
      icon: '✅',
      actionColor: '#34d399'
    }
  };

  const currentStyle = levelStyles[result.level] || levelStyles.Low;

  return (
    <div className="glass-panel animate-fade-in" style={{
      padding: '24px',
      marginBottom: '24px',
      border: `2px solid ${currentStyle.border}`,
      background: currentStyle.bg,
      textAlign: 'center',
      animation: result.level === 'High' ? 'pulseRedRing 2s infinite' : 'none'
    }}>
      <div style={{ fontSize: '3rem', marginBottom: '8px' }}>{currentStyle.icon}</div>
      <h2 style={{ 
        color: currentStyle.color, 
        fontSize: '2.5rem', 
        fontWeight: 800,
        marginBottom: '12px',
        textTransform: 'uppercase',
        letterSpacing: '1px'
      }}>
        {result.level} PRIORITY
      </h2>
      
      <div style={{ 
        background: 'rgba(0,0,0,0.4)', 
        padding: '16px', 
        borderRadius: '8px',
        marginBottom: '16px',
        textAlign: 'left'
      }}>
        <h4 style={{ color: 'var(--text-secondary)', marginBottom: '6px', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          🧠 AI Engine Reasoning
        </h4>
        <p style={{ color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: 1.5 }}>
          {result.explanation}
        </p>
      </div>

      {result.first_aid && result.first_aid.length > 0 && (
        <div style={{ 
          background: 'rgba(234, 179, 8, 0.1)', 
          borderLeft: '4px solid #eab308',
          padding: '16px', 
          borderRadius: '4px',
          marginBottom: '16px',
          textAlign: 'left'
        }}>
          <h4 style={{ color: '#eab308', marginBottom: '8px', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            ⚕️ Immediate First Aid Steps
          </h4>
          <ul style={{ color: 'var(--text-primary)', fontSize: '0.90rem', lineHeight: 1.5, margin: 0, paddingLeft: '20px' }}>
            {result.first_aid.map((step, i) => (
              <li key={i} style={{ marginBottom: '4px' }}>{step}</li>
            ))}
          </ul>
        </div>
      )}

      <div style={{
         display: 'inline-block',
         background: 'rgba(0,0,0,0.3)',
         border: `1px solid ${currentStyle.actionColor}`,
         padding: '10px 20px',
         borderRadius: '24px',
         color: currentStyle.actionColor,
         fontWeight: 'bold',
         fontSize: '0.95rem',
         boxShadow: `0 0 10px ${currentStyle.bg}`
      }}>
        Recommended Action: {result.action}
      </div>
    </div>
  );
};

export default TriageResult;
