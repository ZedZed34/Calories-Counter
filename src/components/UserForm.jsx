import React, { useState } from 'react';
import { useUser } from '../hooks/useUser';
import { ACTIVITY_LEVELS } from '../utils/calories';
import { ZapIcon, MaleIcon, FemaleIcon, ArrowRightIcon } from './Icons';
import './UserForm.css';

export default function UserForm({ showAdvanced = true, showButton = true, onCalculate }) {
  const { user, setUser } = useUser();

  const [form, setForm] = useState({
    sex: user.sex || '',
    age: user.age || '',
    heightCm: user.heightCm || '',
    weightKg: user.weightKg || '',
    activityKey: user.activityKey || '',
    targetWeightKg: user.targetWeightKg || ''
  });

  const [errors, setErrors] = useState({});

  function validate() {
    const errs = {};
    if (!form.sex) errs.sex = 'Select your sex';
    if (!form.age || form.age < 10 || form.age > 100) errs.age = 'Enter a valid age (10–100)';
    if (!form.heightCm || form.heightCm < 100 || form.heightCm > 230) errs.heightCm = 'Enter height in cm (100–230)';
    if (!form.weightKg || form.weightKg < 30 || form.weightKg > 250) errs.weightKg = 'Enter weight in kg (30–250)';
    if (!form.activityKey) errs.activityKey = 'Select activity level';
    if (showAdvanced && (!form.targetWeightKg || form.targetWeightKg < 40 || form.targetWeightKg > 200)) {
      errs.targetWeightKg = 'Enter target weight (40–200 kg)';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleGetResult() {
    if (!validate()) return;
    setUser(form);
    if (onCalculate) {
      onCalculate(form);
    }
  }

  function handleInputChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user types
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  return (
    <div className="user-form-card">
      <h2 className="user-form-title">
        <span className="title-icon"><ZapIcon size={22} /></span>
        Your Details
        <span className="title-badge">Metric</span>
      </h2>

      <div className="form-grid">
        {/* Sex — segmented control */}
        <div className="field-group">
          <label className="field-label">Biological Sex</label>
          <div className="segmented-control">
            <button
              type="button"
              className={`segment ${form.sex === 'male' ? 'active' : ''}`}
              onClick={() => handleInputChange('sex', 'male')}
            >
              <span className="segment-icon"><MaleIcon size={16} /></span> Male
            </button>
            <button
              type="button"
              className={`segment ${form.sex === 'female' ? 'active' : ''}`}
              onClick={() => handleInputChange('sex', 'female')}
            >
              <span className="segment-icon"><FemaleIcon size={16} /></span> Female
            </button>
          </div>
          {errors.sex && <span className="field-error">{errors.sex}</span>}
        </div>

        {/* Age */}
        <div className="field-group">
          <label className="field-label">Age</label>
          <div className="input-wrapper">
            <input
              type="number"
              min="10"
              max="100"
              value={form.age}
              onChange={(e) => handleInputChange('age', e.target.value)}
              placeholder=" "
              className={errors.age ? 'has-error' : ''}
            />
            <span className="input-suffix">years</span>
          </div>
          {errors.age && <span className="field-error">{errors.age}</span>}
        </div>

        {/* Height */}
        <div className="field-group">
          <label className="field-label">Height</label>
          <div className="input-wrapper">
            <input
              type="number"
              min="100"
              max="230"
              step="1"
              value={form.heightCm}
              onChange={(e) => handleInputChange('heightCm', e.target.value)}
              placeholder=" "
              className={errors.heightCm ? 'has-error' : ''}
            />
            <span className="input-suffix">cm</span>
          </div>
          {errors.heightCm && <span className="field-error">{errors.heightCm}</span>}
        </div>

        {/* Weight */}
        <div className="field-group">
          <label className="field-label">Current Weight</label>
          <div className="input-wrapper">
            <input
              type="number"
              min="30"
              max="250"
              step="0.1"
              value={form.weightKg}
              onChange={(e) => handleInputChange('weightKg', e.target.value)}
              placeholder=" "
              className={errors.weightKg ? 'has-error' : ''}
            />
            <span className="input-suffix">kg</span>
          </div>
          {errors.weightKg && <span className="field-error">{errors.weightKg}</span>}
        </div>

        {/* Activity Level */}
        <div className="field-group span-2">
          <label className="field-label">Activity Level</label>
          <div className="activity-options">
            {ACTIVITY_LEVELS.map((lvl, i) => (
              <button
                key={lvl.key}
                type="button"
                className={`activity-chip ${form.activityKey === lvl.key ? 'active' : ''}`}
                onClick={() => handleInputChange('activityKey', lvl.key)}
              >
                <span className="activity-meter">
                  {Array.from({ length: 5 }, (_, j) => (
                    <span key={j} className={`meter-bar ${j <= i ? 'filled' : ''}`} />
                  ))}
                </span>
                <span className="activity-label">{lvl.label}</span>
              </button>
            ))}
          </div>
          {errors.activityKey && <span className="field-error">{errors.activityKey}</span>}
        </div>

        {/* Target Weight */}
        {showAdvanced && (
          <div className="field-group span-2">
            <label className="field-label">Target Weight</label>
            <div className="input-wrapper">
              <input
                type="number"
                min="40"
                max="200"
                step="0.5"
                value={form.targetWeightKg}
                onChange={(e) => handleInputChange('targetWeightKg', e.target.value)}
                placeholder=" "
                className={errors.targetWeightKg ? 'has-error' : ''}
              />
              <span className="input-suffix">kg</span>
            </div>
            {errors.targetWeightKg && <span className="field-error">{errors.targetWeightKg}</span>}
          </div>
        )}
      </div>

      {showButton && (
        <button className="get-result-btn" onClick={handleGetResult}>
          <span className="btn-text">Calculate My Plan</span>
          <span className="btn-arrow"><ArrowRightIcon size={20} /></span>
        </button>
      )}
    </div>
  );
}
