import React, { useState, useEffect } from 'react';
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
    // Validate that required fields are filled
    if (!formData.sex || !formData.age || !formData.height || !formData.currentWeight || !formData.targetWeight) {
      setShowModal(true);
      return;
    }

    generateWorkoutRecommendation(formData);
  }

  function generateWorkoutRecommendation(data) {
    // Determine goal based on weight difference
    const weightDifference = parseFloat(data.currentWeight) - parseFloat(data.targetWeight);
    const weightDifferencePercent = Math.abs(weightDifference) / parseFloat(data.currentWeight) * 100;
    
    let goal = '';
    let recommendation = '';
    
    if (weightDifference > 2) { // Want to lose weight
      goal = 'fat-loss';
      // For fat loss, recommend more frequent training with shorter sessions
      recommendation = weightDifferencePercent > 15 ? 'upper-lower' : 'full-body';
    } else if (weightDifference < -2) { // Want to gain weight  
      goal = 'bulk';
      // For muscle building, recommend higher volume splits
      recommendation = 'ppl';
    } else { // Maintain weight
      goal = 'maintain';
      recommendation = 'upper-lower';
    }
    
    setSelectedSplit(recommendation);
    setWorkoutPlan({
      currentWeight: data.currentWeight,
      targetWeight: data.targetWeight,
      height: data.height,
      goal: goal,
      recommendation: recommendation,
      sex: data.sex,
      age: data.age
    });
  }

  function handleSplitChange(split) {
    setSelectedSplit(split);
  }

  const workoutPlans = {
    'full-body': {
      title: "Full Body Workout",
      description: "3 days/week • Ideal for beginners • Perfect for fat loss",
      frequency: "3x week",
      duration: "45-60 mins",
      schedule: [
        { day: "Monday", workout: "Full Body A", exercises: ["Squats", "Bench Press", "Bent-Over Row", "Shoulder Press", "Deadlifts", "Plank"] },
        { day: "Tuesday", workout: "Rest", exercises: [] },
        { day: "Wednesday", workout: "Full Body B", exercises: ["Deadlifts", "Incline Press", "Pull-ups", "Dips", "Lunges", "Russian Twists"] },
        { day: "Thursday", workout: "Rest", exercises: [] },
        { day: "Friday", workout: "Full Body C", exercises: ["Front Squats", "Dumbbell Press", "Cable Rows", "Lateral Raises", "Romanian Deadlifts", "Mountain Climbers"] },
        { day: "Saturday", workout: "Rest", exercises: [] },
        { day: "Sunday", workout: "Rest", exercises: [] }
      ]
    },
    'upper-lower': {
      title: "Upper/Lower Split",
      description: "4 days/week • Great for intermediates • Balanced approach",
      frequency: "4x week",
      duration: "50-70 mins",
      schedule: [
        { day: "Monday", workout: "Upper Body", exercises: ["Bench Press", "Bent-Over Row", "Shoulder Press", "Pull-ups", "Dips", "Bicep Curls", "Tricep Extensions"] },
        { day: "Tuesday", workout: "Lower Body", exercises: ["Squats", "Romanian Deadlifts", "Bulgarian Split Squats", "Hip Thrusts", "Calf Raises", "Leg Curls"] },
        { day: "Wednesday", workout: "Rest", exercises: [] },
        { day: "Thursday", workout: "Upper Body", exercises: ["Incline Dumbbell Press", "T-Bar Row", "Lateral Raises", "Lat Pulldowns", "Close-Grip Bench", "Hammer Curls"] },
        { day: "Friday", workout: "Lower Body", exercises: ["Deadlifts", "Front Squats", "Walking Lunges", "Leg Press", "Calf Raises", "Leg Extensions"] },
        { day: "Saturday", workout: "Rest", exercises: [] },
        { day: "Sunday", workout: "Rest", exercises: [] }
      ]
    },
    'ppl': {
      title: "Push, Pull, Legs Split",
      description: "6 days/week • Advanced • Maximum muscle building",
      frequency: "6x week",
      duration: "60-90 mins",
      schedule: [
        { day: "Monday", workout: "Push", exercises: ["Bench Press", "Shoulder Press", "Incline Dumbbell Press", "Lateral Raises", "Dips", "Tricep Pushdowns"] },
        { day: "Tuesday", workout: "Pull", exercises: ["Deadlifts", "Pull-ups", "Bent-Over Row", "T-Bar Row", "Face Pulls", "Bicep Curls", "Hammer Curls"] },
        { day: "Wednesday", workout: "Legs", exercises: ["Squats", "Romanian Deadlifts", "Leg Press", "Walking Lunges", "Calf Raises", "Leg Curls"] },
        { day: "Thursday", workout: "Push", exercises: ["Incline Barbell Press", "Dumbbell Shoulder Press", "Decline Press", "Cable Lateral Raises", "Close-Grip Bench"] },
        { day: "Friday", workout: "Pull", exercises: ["Rack Pulls", "Cable Rows", "Lat Pulldowns", "Reverse Flyes", "Cable Curls", "Preacher Curls"] },
        { day: "Saturday", workout: "Legs", exercises: ["Front Squats", "Stiff Leg Deadlifts", "Bulgarian Split Squats", "Hip Thrusts", "Standing Calf Raises"] },
        { day: "Sunday", workout: "Rest", exercises: [] }
      ]
    }
  };

  // Custom form component for workout plans (no activity level needed)
  function WorkoutForm({ onCalculate }) {
    const [form, setForm] = useState({
      sex: '',
      age: '',
      height: '',
      currentWeight: '',
      targetWeight: ''
    });

    function handleInputChange(field, value) {
      setForm(prev => ({ ...prev, [field]: value }));
    }

    function handleSubmit() {
      onCalculate(form);
    }

    return (
      <div className="card">
        <h2 className="title">Your Details (Metric)</h2>
        <div className="form-grid">
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
            placeholder="Enter your age" 
          />

          <input 
            type="number" 
            min="100" 
            max="230" 
            step="1" 
            value={form.height} 
            onChange={(e) => handleInputChange('height', e.target.value)}
            placeholder="Enter your height (cm)" 
          />

          <input 
            type="number" 
            min="30" 
            max="250" 
            step="0.1" 
            value={form.currentWeight} 
            onChange={(e) => handleInputChange('currentWeight', e.target.value)}
            placeholder="Enter your weight (kg)" 
          />

          <input 
            type="number" 
            min="40" 
            max="200" 
            step="0.5" 
            value={form.targetWeight} 
            onChange={(e) => handleInputChange('targetWeight', e.target.value)}
            placeholder="Enter your target weight (kg)" 
          />
        </div>
        
        <button className="get-result-btn" onClick={handleSubmit}>
          Get Result
        </button>
      </div>
    );
  }

  return (
    <div className="workout-page">
      <h2>Workout Plan Generator</h2>
      <WorkoutForm onCalculate={handleCalculate} />

      {workoutPlan && (
        <div className="workout-section">
          <div className="goal-summary">
            <h3>Your Goal: <span className={`goal-${workoutPlan.goal}`}>
              {workoutPlan.goal === 'fat-loss' ? 'Fat Loss' : 
               workoutPlan.goal === 'bulk' ? 'Bulk' : 'Maintain Weight'}
            </span></h3>
            <div className="calories-summary">
              <span>Current: {workoutPlan.currentWeight} kg</span>
              <span>Target: {workoutPlan.targetWeight} kg</span>
              <span>Goal: {Math.abs(parseFloat(workoutPlan.currentWeight) - parseFloat(workoutPlan.targetWeight)).toFixed(1)} kg {
                parseFloat(workoutPlan.currentWeight) > parseFloat(workoutPlan.targetWeight) ? 'loss' : 'gain'
              }</span>
            </div>
          </div>

          <div className="split-selector">
            <h3>Choose Your Workout Split</h3>
            <div className="split-options">
              <button 
                className={`split-option ${selectedSplit === 'full-body' ? 'active' : ''}`}
                onClick={() => handleSplitChange('full-body')}
              >
                <h4>Full Body</h4>
                <p>{workoutPlans['full-body'].description}</p>
              </button>
              <button 
                className={`split-option ${selectedSplit === 'upper-lower' ? 'active' : ''}`}
                onClick={() => handleSplitChange('upper-lower')}
              >
                <h4>Upper/Lower Split</h4>
                <p>{workoutPlans['upper-lower'].description}</p>
              </button>
              <button 
                className={`split-option ${selectedSplit === 'ppl' ? 'active' : ''}`}
                onClick={() => handleSplitChange('ppl')}
              >
                <h4>Push, Pull, Legs</h4>
                <p>{workoutPlans['ppl'].description}</p>
              </button>
            </div>
          </div>

          <div className="workout-plan">
            {selectedSplit && workoutPlans[selectedSplit] && (
              <div className="plan-details">
                <h3>{workoutPlans[selectedSplit].title}</h3>
                <p>
                  <strong>{workoutPlans[selectedSplit].frequency}</strong> • 
                  <strong> {workoutPlans[selectedSplit].duration}</strong>
                </p>
                <div className="weekly-schedule">
                  {workoutPlans[selectedSplit].schedule.map((day, index) => (
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
      
      <footer className="copyright-footer">
        <p>Copyright &copy;2025 Billy Htet</p>
      </footer>
    </div>
  );
}
