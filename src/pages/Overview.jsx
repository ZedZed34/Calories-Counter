import React, { useState, useEffect } from 'react';
import { bmr, tdee, goals } from '../utils/calories';
import UserForm from '../components/UserForm';
import ResultCard from '../components/ResultCard';
import Modal from '../components/Modal';
import { DumbbellIcon } from '../components/Icons';
import './Overview.css';

export default function Overview() {
  const [showResults, setShowResults] = useState(false);
  const [bmrValue, setBmrValue] = useState(0);
  const [tdeeValue, setTdeeValue] = useState(0);
  const [g, setG] = useState({ maintenance: {}, cut: {}, bulk: {} });
  const [showModal, setShowModal] = useState(false);

  function handleCalculate(userData) {
    if (!userData.sex || !userData.age || !userData.heightCm ||
        !userData.weightKg || !userData.activityKey || !userData.targetWeightKg) {
      setShowModal(true);
      return;
    }

    const calculatedBmr = bmr(userData);
    const calculatedTdee = tdee({ bmrValue: calculatedBmr, activityKey: userData.activityKey });
    const calculatedGoals = goals({
      tdeeValue: calculatedTdee,
      weightKg: parseFloat(userData.weightKg),
      targetWeightKg: parseFloat(userData.targetWeightKg)
    });

    setBmrValue(calculatedBmr);
    setTdeeValue(calculatedTdee);
    setG(calculatedGoals);
    setShowResults(true);
  }

  useEffect(() => {
    document.title = 'Overview | Calories Counter';
  }, []);

  return (
    <div className="overview-page">
      {/* Hero header */}
      <div className="page-hero">
        <h2 className="hero-title">
          <span className="hero-accent">Calories</span> Calculator
        </h2>
        <p className="hero-subtitle">
          Calculate your daily energy needs and get personalized macro targets
        </p>
      </div>

      <UserForm showAdvanced={true} onCalculate={handleCalculate} />

      {showResults ? (
        <section className="results-section">
          <h3 className="section-title">Your Results</h3>
          <div className="grid">
            <ResultCard
              title="BMR"
              kcal={bmrValue}
              proteinG={0}
              fatG={0}
              carbsG={0}
              staggerIndex={0}
            />
            <ResultCard
              title="TDEE (Maintenance)"
              kcal={tdeeValue}
              proteinG={g.maintenance.proteinG || 0}
              fatG={g.maintenance.fatG || 0}
              carbsG={g.maintenance.carbsG || 0}
              staggerIndex={1}
            />
            <ResultCard
              title="Cut (Deficit)"
              kcal={g.cut.kcal || 0}
              proteinG={g.cut.proteinG || 0}
              fatG={g.cut.fatG || 0}
              carbsG={g.cut.carbsG || 0}
              staggerIndex={2}
            />
            <ResultCard
              title="Bulk (Surplus)"
              kcal={g.bulk.kcal || 0}
              proteinG={g.bulk.proteinG || 0}
              fatG={g.bulk.fatG || 0}
              carbsG={g.bulk.carbsG || 0}
              staggerIndex={3}
            />
          </div>
        </section>
      ) : (
        <div className="placeholder">
          <div className="placeholder-icon">
            <DumbbellIcon size={48} />
          </div>
          <p>
            Fill in your details above (including your target weight goal) and click
            <strong> "Calculate My Plan"</strong> to see your personalized calorie calculations!
          </p>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <h3>Missing Information</h3>
        <p>Please fill out all fields before calculating.</p>
      </Modal>

      <footer className="copyright-footer">
        <p>Copyright &copy;2026 Billy Htet</p>
      </footer>
    </div>
  );
}
