import React, { useState } from 'react';

const HospitalDashboard = () => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    icu: 0,
    ventilator: 0,
    ECG: 0,
    cardiac: 0,
    oxygen_cylinder: 0,
    bipap: 0,
    specialists: '', // will be split into an array on submit
    emergencyAvailable: true,
    lat: '',
    lng: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Structure payload exactly as Mongoose Schema expects
    const payload = {
      name: formData.name,
      address: formData.address,
      icu: Number(formData.icu) || 0,
      ventilator: Number(formData.ventilator) || 0,
      ECG: Number(formData.ECG) || 0,
      cardiac: Number(formData.cardiac) || 0,
      oxygen_cylinder: Number(formData.oxygen_cylinder) || 0,
      bipap: Number(formData.bipap) || 0,
      specialists: formData.specialists.split(',').map(s => s.trim()).filter(s => s),
      emergencyAvailable: formData.emergencyAvailable,
      location: {
        lat: Number(formData.lat),
        lng: Number(formData.lng)
      }
    };

    console.log("Mongoose Payload Model:", payload);
    alert("Hospital profile updated successfully! Output structure logged to standard console.");
  };

  return (
    <div className="glass-panel animate-slide-up" style={{ padding: '40px', maxWidth: '800px', margin: '0 auto 40px auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h2 className="text-gradient" style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '8px' }}>
          Hospital Resource Dashboard
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>Update your live medical inventory for the AI Dispatch Routing Engine</p>
      </div>

      <form onSubmit={handleSubmit}>
        
        {/* Core Info */}
        <h3 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px', marginBottom: '20px', color: 'var(--accent-blue)' }}>Core Details</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500 }}>Hospital Name *</label>
            <input type="text" name="name" required className="input-glass" value={formData.name} onChange={handleChange} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500 }}>Global Address</label>
            <input type="text" name="address" className="input-glass" value={formData.address} onChange={handleChange} />
          </div>
        </div>

        {/* Location */}
        <h3 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px', marginBottom: '20px', color: 'var(--accent-blue)' }}>GPS Coordinates</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500 }}>Latitude *</label>
            <input type="number" step="any" name="lat" required placeholder="e.g. 40.7128" className="input-glass" value={formData.lat} onChange={handleChange} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500 }}>Longitude *</label>
            <input type="number" step="any" name="lng" required placeholder="e.g. -74.0060" className="input-glass" value={formData.lng} onChange={handleChange} />
          </div>
        </div>

        {/* Inventory - Numbers */}
        <h3 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px', marginBottom: '20px', color: 'var(--accent-blue)' }}>Live Resource Inventory</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500 }}>Active ICU Beds</label>
            <input type="number" min="0" name="icu" className="input-glass" value={formData.icu} onChange={handleChange} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500 }}>Available Ventilators</label>
            <input type="number" min="0" name="ventilator" className="input-glass" value={formData.ventilator} onChange={handleChange} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500 }}>ECG Machines</label>
            <input type="number" min="0" name="ECG" className="input-glass" value={formData.ECG} onChange={handleChange} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500 }}>Cardiac Units</label>
            <input type="number" min="0" name="cardiac" className="input-glass" value={formData.cardiac} onChange={handleChange} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500 }}>Oxygen Cylinders</label>
            <input type="number" min="0" name="oxygen_cylinder" className="input-glass" value={formData.oxygen_cylinder} onChange={handleChange} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500 }}>BiPAP Support</label>
            <input type="number" min="0" name="bipap" className="input-glass" value={formData.bipap} onChange={handleChange} />
          </div>
        </div>

        {/* Specialists & Flags */}
        <h3 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px', marginBottom: '20px', color: 'var(--accent-blue)' }}>Specialized Operations</h3>
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500 }}>On-Call Specialists (comma separated)</label>
          <input type="text" name="specialists" placeholder="Cardiologist, Neurologist, Trauma Surgeon" className="input-glass" value={formData.specialists} onChange={handleChange} />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
          <input type="checkbox" name="emergencyAvailable" id="er-avail" checked={formData.emergencyAvailable} onChange={handleChange} style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
          <label htmlFor="er-avail" style={{ fontSize: '1rem', cursor: 'pointer', fontWeight: 600 }}>Emergency Room Status (Available & Accepting Patients)</label>
        </div>

        <button type="submit" className="btn-primary" style={{ width: '100%', padding: '16px', fontSize: '1.1rem', letterSpacing: '0.5px' }}>
          Sync Resources to Live Global Triage Database
        </button>

      </form>
    </div>
  );
};

export default HospitalDashboard;
