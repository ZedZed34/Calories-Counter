import React, { useState } from 'react';
import { ZapIcon, MaleIcon, FemaleIcon, ArrowRightIcon } from './Icons';
import './UserForm.css';
import './WorkoutForm.css';

export default function WorkoutForm({ onCalculate }) {
  const [form, setForm] = useState({
    sex: '',
    age: '',
    height: '',
    currentWeight: '',
    targetWeight: ''
  });

  const [errors, setErrors] = useState({});

  function validate() {
    const errs = {};
    if (!form.sex) errs.sex = 'Select your sex';
    if (!form.age || form.age < 10 || form.age > 100) errs.age = 'Enter a valid age (10–100)';
    if (!form.height || form.height < 100 || form.height > 230) errs.height = 'Enter height in cm (100–230)';
    if (!form.currentWeight || form.currentWeight < 30 || form.currentWeight > 250) {
      errs.currentWeight = 'Enter weight in kg (30–250)';
    }
    if (!form.targetWeight || form.targetWeight < 40 || form.targetWeight > 200) {
      errs.targetWeight = 'Enter target weight (40–200 kg)';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    onCalculate(form);
  }

  function handleInputChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
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
              value={form.height}
              onChange={(e) => handleInputChange('height', e.target.value)}
              placeholder=" "
              className={errors.height ? 'has-error' : ''}
            />
            <span className="input-suffix">cm</span>
          </div>
          {errors.height && <span className="field-error">{errors.height}</span>}
        </div>

        {/* Current Weight */}
        <div className="field-group">
          <label className="field-label">Current Weight</label>
          <div className="input-wrapper">
            <input
              type="number"
              min="30"
              max="250"
              step="0.1"
              value={form.currentWeight}
              onChange={(e) => handleInputChange('currentWeight', e.target.value)}
              placeholder=" "
              className={errors.currentWeight ? 'has-error' : ''}
            />
            <span className="input-suffix">kg</span>
          </div>
          {errors.currentWeight && <span className="field-error">{errors.currentWeight}</span>}
        </div>

        {/* Target Weight */}
        <div className="field-group">
          <label className="field-label">Target Weight</label>
          <div className="input-wrapper">
            <input
              type="number"
              min="40"
              max="200"
              step="0.5"
              value={form.targetWeight}
              onChange={(e) => handleInputChange('targetWeight', e.target.value)}
              placeholder=" "
              className={errors.targetWeight ? 'has-error' : ''}
            />
            <span className="input-suffix">kg</span>
          </div>
          {errors.targetWeight && <span className="field-error">{errors.targetWeight}</span>}
        </div>
      </div>

      <button className="get-result-btn" onClick={handleSubmit}>
        <span className="btn-text">Generate Workout Plan</span>
        <span className="btn-arrow"><ArrowRightIcon size={20} /></span>
      </button>
    </div>
  );
}
