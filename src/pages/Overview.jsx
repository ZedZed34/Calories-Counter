import React, { useState, useEffect } from 'react';
import { bmr, tdee, goals } from '../utils/calories';
import UserForm from '../components/UserForm';
import ResultCard from '../components/ResultCard';
import Modal from '../components/Modal';

export default function Overview() {
  const [showResults, setShowResults] = useState(false);
  const [bmrValue, setBmrValue] = useState(0);
  const [tdeeValue, setTdeeValue] = useState(0);
  const [g, setG] = useState({ maintenance: {}, cut: {}, bulk: {} });
  const [showModal, setShowModal] = useState(false);

  function handleCalculate(userData) {
    // Validate that all required fields are filled
    if (!userData.sex || !userData.age || !userData.heightCm || !userData.weightKg || !userData.activityKey || !userData.targetWeightKg) {
      setShowModal(true);
      return;
    }
    
    setShowResults(true);
    const calculatedBmr = bmr(userData);
    const calculatedTdee = tdee({ bmrValue: calculatedBmr, activityKey: userData.activityKey });
    const calculatedGoals = goals({ tdeeValue: calculatedTdee, weightKg: userData.weightKg, targetWeightKg: userData.targetWeightKg });
    
    setBmrValue(calculatedBmr);
    setTdeeValue(calculatedTdee);
    setG(calculatedGoals);
  }

  useEffect(() => {
    document.title = 'Overview | Calories Counter';
  }, []);

  return (
    <>

      <UserForm showAdvanced={true} onCalculate={handleCalculate} />

      {showResults ? (
        <section className="grid">
          <ResultCard title="BMR" kcal={bmrValue} proteinG={g.maintenance.proteinG} fatG={g.maintenance.fatG} carbsG={g.maintenance.carbsG} />
          <ResultCard title="TDEE (Maintenance)" kcal={tdeeValue} proteinG={g.maintenance.proteinG} fatG={g.maintenance.fatG} carbsG={g.maintenance.carbsG} />
          <ResultCard title="Cut (Deficit)" kcal={g.cut.kcal} proteinG={g.cut.proteinG} fatG={g.cut.fatG} carbsG={g.cut.carbsG} />
          <ResultCard title="Bulk (Surplus)" kcal={g.bulk.kcal} proteinG={g.bulk.proteinG} fatG={g.bulk.fatG} carbsG={g.bulk.carbsG} />
        </section>
      ) : (
        <div className="placeholder">
          <p>Fill in your details above (including your target weight goal) and click "Get Result" to see your personalized calorie calculations!</p>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <h3>Missing Information</h3>
        <p>Please fill out your details.</p>
      </Modal>
    </>
  );
}
