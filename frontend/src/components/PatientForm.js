import React, { useState } from 'react';

const PatientForm = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    heartRate: '',
    bloodPressure: 'normal',
    injuryType: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      heartRate: Number(formData.heartRate)
    });
  };

  return (
    <div className="glass-panel animate-slide-up" style={{ padding: '24px', marginBottom: '24px' }}>
      <h2 style={{ marginBottom: '16px', fontSize: '1.5rem', fontWeight: 600 }}>
        Patient Intake
      </h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>
            Heart Rate (bpm)
          </label>
          <input
            type="number"
            name="heartRate"
            className="input-glass"
            value={formData.heartRate}
            onChange={handleChange}
            placeholder="e.g. 85"
            required
            min="0"
          />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>
            Blood Pressure
          </label>
          <select
            name="bloodPressure"
            className="input-glass"
            value={formData.bloodPressure}
            onChange={handleChange}
            required
          >
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>
            Injury / Condition Description
          </label>
          <textarea
            name="injuryType"
            className="input-glass"
            value={formData.injuryType}
            onChange={handleChange}
            placeholder="Describe the injury or symptoms..."
            rows="3"
            required
            style={{ resize: 'vertical' }}
          ></textarea>
        </div>

        <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '8px' }}>
          {loading ? 'Evaluating...' : 'Evaluate Emergency Level'}
        </button>
      </form>
    </div>
  );
};

export default PatientForm;
