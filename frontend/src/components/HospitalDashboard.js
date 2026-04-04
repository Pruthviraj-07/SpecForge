import React, { useState, useEffect } from 'react';
import { getHospitals } from '../services/api';
import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

const HospitalDashboard = () => {
  const [admin, setAdmin] = useState(() => {
    const saved = localStorage.getItem('admin');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('adminToken') || '');
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({
    name: '', email: '', password: '', hospitalCode: '', hospitalAffiliation: ''
  });
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '', address: '', icu: 0, ventilator: 0,
    ECG: 0, cardiac: 0, oxygen_cylinder: 0, bipap: 0,
    specialists: '', emergencyAvailable: true, lat: '', lng: ''
  });
  const [hospitals, setHospitals] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (admin) loadHospitals();
  }, [admin]);

  const loadHospitals = async () => {
    const data = await getHospitals();
    const all = data.hospitals || [];
    const own = all.filter(h => h.name === admin?.hospitalAffiliation);
    setHospitals(own);
    if (own.length > 0) {
      setSelectedId(own[0]._id);
      const h = own[0];
      setFormData({
        name: h.name || '',
        address: h.address || '',
        icu: h.icu ?? 0,
        ventilator: h.ventilator ?? 0,
        ECG: h.ECG ?? 0,
        cardiac: h.cardiac ?? 0,
        oxygen_cylinder: h.oxygen_cylinder ?? 0,
        bipap: h.bipap ?? 0,
        specialists: Array.isArray(h.specialists) ? h.specialists.join(', ') : '',
        emergencyAvailable: h.emergencyAvailable ?? true,
        lat: h.location?.lat || '',
        lng: h.location?.lng || ''
      });
    }
  };

  const handleAuthChange = (e) => {
    setAuthForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setAuthError('');
    setAuthSuccess('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    setAuthSuccess('');
    try {
      const res = await API.post('/auth/login', {
        email: authForm.email,
        password: authForm.password,
      });
      if (res.data.success) {
        localStorage.setItem('adminToken', res.data.token);
        localStorage.setItem('admin', JSON.stringify(res.data.admin));
        setToken(res.data.token);
        setAdmin(res.data.admin);
      }
    } catch (err) {
      setAuthError(err.response?.data?.message || 'Login failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    setAuthSuccess('');
    try {
      const res = await API.post('/auth/register', authForm);
      if (res.data.success) {
        // Show the server's message (different for verified vs pending-approval)
        setAuthSuccess(res.data.message);
        setAuthMode('login');
        setAuthForm({ name: '', email: '', password: '', hospitalCode: '', hospitalAffiliation: '' });
      }
    } catch (err) {
      setAuthError(err.response?.data?.message || 'Registration failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
    setAdmin(null);
    setToken('');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      name: formData.name,
      address: formData.address,
      icu: Number(formData.icu),
      ventilator: Number(formData.ventilator),
      ECG: Number(formData.ECG),
      cardiac: Number(formData.cardiac),
      oxygen_cylinder: Number(formData.oxygen_cylinder),
      bipap: Number(formData.bipap),
      specialists: formData.specialists.split(',').map(s => s.trim()).filter(s => s),
      emergencyAvailable: formData.emergencyAvailable,
      location: { lat: Number(formData.lat), lng: Number(formData.lng) }
    };

    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
      if (selectedId) {
        await API.put(`/hospitals/${selectedId}`, payload, config);
        alert('Hospital updated successfully! ✅');
      } else {
        await API.post('/hospitals', payload, config);
        alert('Hospital added successfully! ✅');
      }
      await loadHospitals();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // ── AUTH SCREEN ────────────────────────────────────────────

  if (!admin) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
        <div className="glass-panel animate-slide-up" style={{ padding: '48px', width: '100%', maxWidth: '480px' }}>

          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🏥</div>
            <h2 className="text-gradient" style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '8px' }}>
              Hospital Admin Portal
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {authMode === 'login' ? 'Sign in to manage your hospital' : 'Register with your hospital code'}
            </p>
          </div>

          {/* Tab switcher */}
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.2)', borderRadius: '10px', padding: '4px', marginBottom: '28px', border: '1px solid var(--glass-border)' }}>
            {['login', 'register'].map(mode => (
              <button
                key={mode}
                type="button"
                onClick={() => { setAuthMode(mode); setAuthError(''); setAuthSuccess(''); }}
                style={{
                  flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
                  cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s',
                  background: authMode === mode ? 'var(--accent-blue)' : 'transparent',
                  color: authMode === mode ? '#fff' : 'var(--text-secondary)'
                }}
              >
                {mode === 'login' ? '🔐 Login' : '📝 Register'}
              </button>
            ))}
          </div>

          {/* Error banner */}
          {authError && (
            <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', borderRadius: '8px', padding: '12px', marginBottom: '20px', color: '#ef4444', fontSize: '0.875rem' }}>
              ⚠️ {authError}
            </div>
          )}

          {/* Success / info banner (e.g. pending approval) */}
          {authSuccess && (
            <div style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid #34d399', borderRadius: '8px', padding: '12px', marginBottom: '20px', color: '#34d399', fontSize: '0.875rem' }}>
              ✅ {authSuccess}
            </div>
          )}

          {/* Login Form */}
          {authMode === 'login' && (
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 500 }}>Email</label>
                <input type="email" name="email" required className="input-glass" placeholder="admin@hospital.gov.in" value={authForm.email} onChange={handleAuthChange} />
              </div>
              <div style={{ marginBottom: '28px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 500 }}>Password</label>
                <input type="password" name="password" required className="input-glass" placeholder="••••••••" value={authForm.password} onChange={handleAuthChange} />
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: '1rem' }} disabled={authLoading}>
                {authLoading ? 'Verifying...' : '🔐 Sign In'}
              </button>
            </form>
          )}

          {/* Register Form */}
          {authMode === 'register' && (
            <form onSubmit={handleRegister}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 500 }}>Full Name</label>
                <input type="text" name="name" required className="input-glass" placeholder="Dr. Rajesh Kumar" value={authForm.name} onChange={handleAuthChange} />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 500 }}>Email</label>
                <input type="email" name="email" required className="input-glass" placeholder="admin@hospital.gov.in" value={authForm.email} onChange={handleAuthChange} />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 500 }}>Password</label>
                <input type="password" name="password" required className="input-glass" placeholder="••••••••" value={authForm.password} onChange={handleAuthChange} />
              </div>
              <div style={{ marginBottom: authForm.hospitalCode === 'HOSP-NEW-000' ? '16px' : '28px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 500 }}>Hospital Code *</label>
                <input type="text" name="hospitalCode" required className="input-glass" placeholder="e.g. HOSP-RUBY-001" value={authForm.hospitalCode} onChange={handleAuthChange} />
              </div>

              {authForm.hospitalCode === 'HOSP-NEW-000' && (
                <div style={{ marginBottom: '28px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 500 }}>Hospital Name *</label>
                  <input type="text" name="hospitalAffiliation" required className="input-glass" placeholder="e.g. City Hospital, Pune" value={authForm.hospitalAffiliation} onChange={handleAuthChange} />
                </div>
              )}

              <button type="submit" className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: '1rem' }} disabled={authLoading}>
                {authLoading ? 'Registering...' : '📝 Register'}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // ── DASHBOARD ──────────────────────────────────────────────

  const isNewHospitalAdmin = admin.hospitalCode === 'HOSP-NEW-000' && hospitals.length === 0;

  return (
    <div className="glass-panel animate-slide-up" style={{ padding: '40px', maxWidth: '800px', margin: '0 auto 40px auto' }}>

      {/* Admin info bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
        <div>
          <p style={{ fontWeight: 600, marginBottom: '2px' }}>👤 {admin.name}</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>🏥 {admin.hospitalAffiliation}</p>
        </div>
        <button onClick={handleLogout} style={{ padding: '8px 16px', borderRadius: '8px', background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid #ef4444', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
          Logout
        </button>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h2 className="text-gradient" style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '8px' }}>
          Hospital Resource Dashboard
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          {isNewHospitalAdmin ? 'Add your hospital to the system' : 'Update your live medical inventory'}
        </p>
      </div>

      {isNewHospitalAdmin && (
        <div style={{ marginBottom: '32px', padding: '16px', background: 'rgba(52,211,153,0.1)', borderRadius: '12px', border: '1px solid #34d399', color: '#34d399', fontSize: '0.9rem' }}>
          ➕ Fill in your hospital details below to register it in the system.
        </div>
      )}

      {!isNewHospitalAdmin && hospitals.length > 0 && (
        <div style={{ marginBottom: '24px', padding: '12px 16px', background: 'rgba(251,191,36,0.1)', borderRadius: '10px', border: '1px solid #fbbf24' }}>
          <span style={{ color: '#fbbf24', fontWeight: 600, fontSize: '0.9rem' }}>✏️ Editing: {hospitals[0].name}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <h3 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px', marginBottom: '20px', color: 'var(--accent-blue)' }}>Core Details</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500 }}>Hospital Name *</label>
            <input type="text" name="name" required className="input-glass" value={formData.name} onChange={handleChange} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500 }}>Address</label>
            <input type="text" name="address" className="input-glass" value={formData.address} onChange={handleChange} />
          </div>
        </div>

        <h3 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px', marginBottom: '20px', color: 'var(--accent-blue)' }}>GPS Coordinates</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500 }}>Latitude *</label>
            <input type="number" step="any" name="lat" required placeholder="e.g. 18.5314" className="input-glass" value={formData.lat} onChange={handleChange} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500 }}>Longitude *</label>
            <input type="number" step="any" name="lng" required placeholder="e.g. 73.8446" className="input-glass" value={formData.lng} onChange={handleChange} />
          </div>
        </div>

        <h3 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px', marginBottom: '20px', color: 'var(--accent-blue)' }}>Live Resource Inventory</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          {[['icu', 'Active ICU Beds'], ['ventilator', 'Available Ventilators'], ['ECG', 'ECG Machines'], ['cardiac', 'Cardiac Units'], ['oxygen_cylinder', 'Oxygen Cylinders'], ['bipap', 'BiPAP Support']].map(([field, label]) => (
            <div key={field}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500 }}>{label}</label>
              <input type="number" min="0" name={field} className="input-glass" value={formData[field]} onChange={handleChange} />
            </div>
          ))}
        </div>

        <h3 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px', marginBottom: '20px', color: 'var(--accent-blue)' }}>Specialized Operations</h3>
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500 }}>On-Call Specialists (comma separated)</label>
          <input type="text" name="specialists" placeholder="cardiologist, neurologist, orthopedic" className="input-glass" value={formData.specialists} onChange={handleChange} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
          <input type="checkbox" name="emergencyAvailable" id="er-avail" checked={formData.emergencyAvailable} onChange={handleChange} style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
          <label htmlFor="er-avail" style={{ fontSize: '1rem', cursor: 'pointer', fontWeight: 600 }}>Emergency Room Status (Available & Accepting Patients)</label>
        </div>

        <button type="submit" className="btn-primary" style={{ width: '100%', padding: '16px', fontSize: '1.1rem', letterSpacing: '0.5px', opacity: loading ? 0.7 : 1 }} disabled={loading}>
          {loading ? 'Processing...' : isNewHospitalAdmin ? '➕ Add Hospital' : '✏️ Update Hospital'}
        </button>
      </form>
    </div>
  );
};

export default HospitalDashboard;