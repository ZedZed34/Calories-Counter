import React, { useState } from 'react';
import { useUser } from '../hooks/useUser';
import { ACTIVITY_LEVELS } from '../utils/calories';
import './UserForm.css';

export default function UserForm({ showAdvanced = true, showButton = true, onCalculate }) {
  const { setUser } = useUser();
  
  // Initialize with empty form, don't use stored values for clean start
  const [form, setForm] = useState({
    sex: '',
    age: '',
    heightCm: '',
    weightKg: '',
    activityKey: '',
    targetWeightKg: ''
  });

  function handleGetResult() {
    setUser(form);
    if (onCalculate) {
      onCalculate(form);
    }
  }

  function handleInputChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  return (
    <div className="card">
      <h2 className="title">Your Details (Metric)</h2>
      <div className="grid">
        <select 
          value={form.sex} 
          onChange={(e) => handleInputChange('sex', e.target.value)}
        >
          <option value="" disabled>Select your sex</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>

        <input 
          type="number" 
          min="10" 
          max="100" 
          value={form.age} 
          onChange={(e) => handleInputChange('age', e.target.value)}
          placeholder="Age" 
        />

        <input 
          type="number" 
          min="100" 
          max="230" 
          step="1" 
          value={form.heightCm} 
          onChange={(e) => handleInputChange('heightCm', e.target.value)}
          placeholder="Height (cm)" 
        />

        <input 
          type="number" 
          min="30" 
          max="250" 
          step="0.1" 
          value={form.weightKg} 
          onChange={(e) => handleInputChange('weightKg', e.target.value)}
          placeholder="Weight (kg)" 
        />

        <select 
          value={form.activityKey} 
          onChange={(e) => handleInputChange('activityKey', e.target.value)}
          className="span-2"
        >
          <option value="" disabled>Select your activity level</option>
          {ACTIVITY_LEVELS.map(lvl => (
            <option key={lvl.key} value={lvl.key}>{lvl.label}</option>
          ))}
        </select>

        {showAdvanced && (
          <input 
            type="number" 
            min="40" 
            max="200" 
            step="0.5" 
            value={form.targetWeightKg} 
            onChange={(e) => handleInputChange('targetWeightKg', e.target.value)}
            placeholder="Target weight (kg)" 
            className="span-2" 
          />
        )}
      </div>
      
      {showButton && (
        <button className="get-result-btn" onClick={handleGetResult}>
          Get Result
        </button>
      )}
    </div>
  );
}
