import React, { useState } from 'react';

const SignIn = ({ onSignIn }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    lat: '',
    lng: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleGetLocation = (e) => {
    e.preventDefault();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFormData(prev => ({
            ...prev,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          }));
        },
        (err) => {
          console.error(err);
          alert("Error getting location. Ensure permissions are granted.");
        },
        { enableHighAccuracy: true }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Build payload matching Mongoose Schema exactly
    const payload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      location: {
        lat: formData.lat !== '' ? Number(formData.lat) : undefined,
        lng: formData.lng !== '' ? Number(formData.lng) : undefined
      }
    };

    console.log("Mongoose User Payload:", payload);
    alert("User Registered Successfully! Output logged to console.");
    
    // Navigate back to user tab with user datav
    onSignIn(payload);
  };

  return (
    <div className="glass-panel animate-slide-up" style={{ maxWidth: '600px', margin: '64px auto', padding: '40px 32px' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>👤</div>
        <h2 className="text-gradient" style={{ fontSize: '2rem', marginBottom: '8px', fontWeight: 'bold' }}>User Registration</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Create an account to access emergency triage.</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 500 }}>
            Full Name *
          </label>
          <input 
            type="text" 
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="input-glass" 
            placeholder="John Doe" 
            required 
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 500 }}>
            Email Address *
          </label>
          <input 
            type="email" 
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="input-glass" 
            placeholder="john@example.com" 
            required 
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 500 }}>
              Phone Number
            </label>
            <input 
              type="tel" 
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="input-glass" 
              placeholder="+1 234 567 8900" 
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 500 }}>
              Secure Password *
            </label>
            <input 
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="input-glass" 
              placeholder="••••••••" 
              required
            />
          </div>
        </div>

        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px', border: '1px solid var(--glass-border)', marginTop: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
             <label style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 500, margin: 0 }}>
              Home/Default GPS Coordinates
            </label>
            <button className="btn-secondary" onClick={handleGetLocation} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
              📍 Auto-Fill Location
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <input 
              type="number" 
              step="any"
              name="lat"
              value={formData.lat}
              onChange={handleChange}
              className="input-glass" 
              placeholder="Latitude" 
            />
            <input 
              type="number" 
              step="any"
              name="lng"
              value={formData.lng}
              onChange={handleChange}
              className="input-glass" 
              placeholder="Longitude" 
            />
          </div>
        </div>
        
        <button type="submit" className="btn-primary" style={{ marginTop: '16px', padding: '14px' }}>
          Create Account
        </button>
      </form>
    </div>
  );
};

export default SignIn;
