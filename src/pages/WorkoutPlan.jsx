import React, { useState, useEffect } from 'react';
import { bmr, tdee, goals } from '../utils/calories';
import UserForm from '../components/UserForm';
import Modal from '../components/Modal';
import './WorkoutPlan.css';

export default function WorkoutPlan() {
  const [showModal, setShowModal] = useState(false);
  const [selectedSplit, setSelectedSplit] = useState('');
  const [workoutPlan, setWorkoutPlan] = useState(null);

  useEffect(() => {
    document.title = 'Workout Plan | Calories Counter';
  }, []);

  function handleCalculate(formData) {
    // Validate that all required fields are filled
    if (!formData.sex || !formData.age || !formData.heightCm || !formData.weightKg || !formData.activityKey || !formData.targetWeightKg) {
      setShowModal(true);
      return;
    }
    

    generateWorkoutRecommendation(formData);
  }

  function generateWorkoutRecommendation(data) {
    const bmrValue = bmr(data);
    const tdeeValue = tdee({ bmrValue, activityKey: data.activityKey });
    const goalsData = goals({ tdeeValue, weightKg: data.weightKg, targetWeightKg: data.targetWeightKg });
    
    // Determine if user is cutting, bulking, or maintaining
    const weightDifference = data.weightKg - data.targetWeightKg;
    const isCutting = weightDifference > 0;
    const isBulking = weightDifference < 0;
    
    let recommendation = '';
    if (isCutting) {
      recommendation = 'upper-lower'; // Better for cutting - more frequent training
    } else if (isBulking) {
      recommendation = 'ppl'; // Better for bulking - more volume per muscle group
    } else {
      recommendation = 'upper-lower'; // Maintenance - balanced approach
    }
    
    setSelectedSplit(recommendation);
    setWorkoutPlan({
      bmr: bmrValue,
      tdee: tdeeValue,
      goals: goalsData,
      goal: isCutting ? 'cutting' : isBulking ? 'bulking' : 'maintenance',
      recommendation
    });
  }

  function handleSplitChange(split) {
    setSelectedSplit(split);
  }

  const upperLowerPlan = {
    title: "Upper/Lower Body Split",
    description: "4-day routine alternating between upper and lower body workouts",
    schedule: [
      { day: "Monday", workout: "Upper Body", exercises: ["Bench Press", "Bent-Over Row", "Shoulder Press", "Pull-ups", "Dips", "Bicep Curls", "Tricep Extensions"] },
      { day: "Tuesday", workout: "Lower Body", exercises: ["Squats", "Romanian Deadlifts", "Bulgarian Split Squats", "Hip Thrusts", "Calf Raises", "Leg Curls"] },
      { day: "Wednesday", workout: "Rest", exercises: [] },
      { day: "Thursday", workout: "Upper Body", exercises: ["Incline Dumbbell Press", "T-Bar Row", "Lateral Raises", "Lat Pulldowns", "Close-Grip Bench", "Hammer Curls", "Overhead Tricep Press"] },
      { day: "Friday", workout: "Lower Body", exercises: ["Deadlifts", "Front Squats", "Walking Lunges", "Leg Press", "Calf Raises", "Leg Extensions"] },
      { day: "Saturday", workout: "Rest", exercises: [] },
      { day: "Sunday", workout: "Rest", exercises: [] }
    ]
  };

  const pplPlan = {
    title: "Push, Pull, Legs (PPL) Split",
    description: "6-day routine targeting push muscles, pull muscles, and legs separately",
    schedule: [
      { day: "Monday", workout: "Push", exercises: ["Bench Press", "Shoulder Press", "Incline Dumbbell Press", "Lateral Raises", "Dips", "Tricep Pushdowns", "Overhead Press"] },
      { day: "Tuesday", workout: "Pull", exercises: ["Deadlifts", "Pull-ups", "Bent-Over Row", "T-Bar Row", "Face Pulls", "Bicep Curls", "Hammer Curls"] },
      { day: "Wednesday", workout: "Legs", exercises: ["Squats", "Romanian Deadlifts", "Leg Press", "Walking Lunges", "Calf Raises", "Leg Curls", "Leg Extensions"] },
      { day: "Thursday", workout: "Push", exercises: ["Incline Barbell Press", "Dumbbell Shoulder Press", "Decline Press", "Cable Lateral Raises", "Close-Grip Bench", "Diamond Push-ups"] },
      { day: "Friday", workout: "Pull", exercises: ["Rack Pulls", "Cable Rows", "Lat Pulldowns", "Reverse Flyes", "Cable Curls", "Preacher Curls", "Shrugs"] },
      { day: "Saturday", workout: "Legs", exercises: ["Front Squats", "Stiff Leg Deadlifts", "Bulgarian Split Squats", "Hip Thrusts", "Standing Calf Raises", "Seated Calf Raises"] },
      { day: "Sunday", workout: "Rest", exercises: [] }
    ]
  };

  return (
    <>
      <h2>Workout Plan Generator</h2>
      <UserForm showAdvanced={true} onCalculate={handleCalculate} />

      {workoutPlan && (
        <div className="workout-section">
          <div className="goal-summary">
            <h3>Your Goal: <span className={`goal-${workoutPlan.goal}`}>{workoutPlan.goal.charAt(0).toUpperCase() + workoutPlan.goal.slice(1)}</span></h3>
            <div className="calories-summary">
              <span>BMR: {workoutPlan.bmr} kcal</span>
              <span>TDEE: {workoutPlan.tdee} kcal</span>
              <span>Target: {workoutPlan.goals[workoutPlan.goal === 'cutting' ? 'cut' : workoutPlan.goal === 'bulking' ? 'bulk' : 'maintenance'].kcal} kcal</span>
            </div>
          </div>

          <div className="split-selector">
            <h3>Choose Your Workout Split</h3>
            <div className="split-options">
              <button 
                className={`split-option ${selectedSplit === 'upper-lower' ? 'active' : ''}`}
                onClick={() => handleSplitChange('upper-lower')}
              >
                <h4>Upper/Lower Split</h4>
                <p>4 days/week • Great for beginners • Good for cutting</p>
              </button>
              <button 
                className={`split-option ${selectedSplit === 'ppl' ? 'active' : ''}`}
                onClick={() => handleSplitChange('ppl')}
              >
                <h4>Push, Pull, Legs</h4>
                <p>6 days/week • Advanced • Great for bulking</p>
              </button>
            </div>
          </div>

          <div className="workout-plan">
            {selectedSplit === 'upper-lower' && (
              <div className="plan-details">
                <h3>{upperLowerPlan.title}</h3>
                <p>{upperLowerPlan.description}</p>
                <div className="weekly-schedule">
                  {upperLowerPlan.schedule.map((day, index) => (
                    <div key={index} className={`day-card ${day.workout === 'Rest' ? 'rest-day' : ''}`}>
                      <h4>{day.day}</h4>
                      <h5>{day.workout}</h5>
                      {day.exercises.length > 0 && (
                        <ul>
                          {day.exercises.map((exercise, i) => (
                            <li key={i}>{exercise}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedSplit === 'ppl' && (
              <div className="plan-details">
                <h3>{pplPlan.title}</h3>
                <p>{pplPlan.description}</p>
                <div className="weekly-schedule">
                  {pplPlan.schedule.map((day, index) => (
                    <div key={index} className={`day-card ${day.workout === 'Rest' ? 'rest-day' : ''}`}>
                      <h4>{day.day}</h4>
                      <h5>{day.workout}</h5>
                      {day.exercises.length > 0 && (
                        <ul>
                          {day.exercises.map((exercise, i) => (
                            <li key={i}>{exercise}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {!workoutPlan && (
        <div className="placeholder">
          <p>Fill in your details above (including your target weight goal) to get a personalized workout plan recommendation!</p>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <h3>Missing Information</h3>
        <p>Please fill out your details.</p>
      </Modal>
    </>
  );
}
