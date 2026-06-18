import React, { useState, useEffect } from 'react';
import WorkoutForm from '../components/WorkoutForm';
import Modal from '../components/Modal';
import { FlameIcon, DumbbellIcon, ScaleIcon, RefreshCwIcon, ColumnsIcon, BarbellIcon, MoonIcon, CheckCircleIcon } from '../components/Icons';
import './WorkoutPlan.css';

// Exercise suggestions with rep/set ranges
const EXERCISE_DETAILS = {
  // Push exercises
  'Bench Press': { sets: '4', reps: '8–10', tips: 'Keep shoulders retracted' },
  'Incline Dumbbell Press': { sets: '3', reps: '10–12', tips: '45° bench angle' },
  'Incline Barbell Press': { sets: '4', reps: '8–10', tips: 'Control the eccentric' },
  'Decline Press': { sets: '3', reps: '10–12', tips: 'Engage lower chest' },
  'Shoulder Press': { sets: '4', reps: '8–10', tips: 'Avoid locking elbows' },
  'Dumbbell Shoulder Press': { sets: '3', reps: '10–12', tips: 'Neutral grip preferred' },
  'Lateral Raises': { sets: '3', reps: '12–15', tips: 'Lean forward slightly' },
  'Cable Lateral Raises': { sets: '3', reps: '12–15', tips: 'Keep constant tension' },
  'Dips': { sets: '3', reps: '10–12', tips: 'Lean forward for chest focus' },
  'Tricep Pushdowns': { sets: '3', reps: '12–15', tips: 'Full range of motion' },
  'Close-Grip Bench': { sets: '3', reps: '10–12', tips: 'Elbows close to body' },

  // Pull exercises
  'Deadlifts': { sets: '3', reps: '5–8', tips: 'Engage lats before pulling' },
  'Rack Pulls': { sets: '3', reps: '5–8', tips: 'Above the knee start' },
  'Pull-ups': { sets: '3', reps: '8–12', tips: 'Full dead hang each rep' },
  'Bent-Over Row': { sets: '4', reps: '8–10', tips: '45° torso angle' },
  'T-Bar Row': { sets: '3', reps: '8–10', tips: 'Squeeze at the top' },
  'Cable Rows': { sets: '3', reps: '10–12', tips: 'V-grip attachment' },
  'Lat Pulldowns': { sets: '3', reps: '10–12', tips: 'Wide grip, lean back' },
  'Face Pulls': { sets: '3', reps: '12–15', tips: 'Pull to forehead height' },
  'Reverse Flyes': { sets: '3', reps: '12–15', tips: 'Light weight, high reps' },
  'Bicep Curls': { sets: '3', reps: '10–12', tips: 'No shoulder swing' },
  'Hammer Curls': { sets: '3', reps: '10–12', tips: 'Neutral grip throughout' },
  'Cable Curls': { sets: '3', reps: '12–15', tips: 'Constant tension' },
  'Preacher Curls': { sets: '3', reps: '10–12', tips: 'Full stretch at bottom' },

  // Leg exercises
  'Squats': { sets: '4', reps: '8–10', tips: 'Break parallel if mobility allows' },
  'Front Squats': { sets: '3', reps: '8–10', tips: 'Keep elbows high' },
  'Romanian Deadlifts': { sets: '3', reps: '10–12', tips: 'Soft knees, hinge at hips' },
  'Stiff Leg Deadlifts': { sets: '3', reps: '10–12', tips: 'Feel the hamstring stretch' },
  'Leg Press': { sets: '3', reps: '10–12', tips: 'Don\'t lock knees' },
  'Bulgarian Split Squats': { sets: '3', reps: '10–12', tips: 'Back foot on bench' },
  'Walking Lunges': { sets: '3', reps: '12–14', tips: 'Long stride, front knee stable' },
  'Lunges': { sets: '3', reps: '10–12', tips: 'Knee tracks over toes' },
  'Hip Thrusts': { sets: '3', reps: '10–12', tips: 'Chin tucked, drive through heels' },
  'Calf Raises': { sets: '4', reps: '15–20', tips: 'Full stretch at bottom' },
  'Standing Calf Raises': { sets: '4', reps: '15–20', tips: 'Pause at top and bottom' },
  'Leg Curls': { sets: '3', reps: '12–15', tips: 'Control the negative' },
  'Leg Extensions': { sets: '3', reps: '12–15', tips: 'Squeeze quads at top' },

  // Full body / other
  'Dumbbell Press': { sets: '3', reps: '10–12', tips: 'Neutral grip dumbbells' },
  'Plank': { sets: '3', reps: '30s–60s', tips: 'Keep core tight, hips level' },
  'Russian Twists': { sets: '3', reps: '20', tips: '10 per side, controlled motion' },
  'Mountain Climbers': { sets: '3', reps: '30s', tips: 'Fast pace, keep hips down' }
};

const MUSCLE_GROUPS = {
  'Bench Press': ['Chest', 'Triceps', 'Shoulders'],
  'Incline Dumbbell Press': ['Upper Chest', 'Shoulders'],
  'Incline Barbell Press': ['Upper Chest', 'Shoulders'],
  'Decline Press': ['Lower Chest', 'Triceps'],
  'Shoulder Press': ['Shoulders', 'Triceps'],
  'Dumbbell Shoulder Press': ['Shoulders', 'Triceps'],
  'Lateral Raises': ['Shoulders'],
  'Cable Lateral Raises': ['Shoulders'],
  'Dips': ['Chest', 'Triceps'],
  'Tricep Pushdowns': ['Triceps'],
  'Close-Grip Bench': ['Triceps', 'Chest'],
  'Deadlifts': ['Back', 'Legs', 'Core'],
  'Rack Pulls': ['Back', 'Traps'],
  'Pull-ups': ['Back', 'Biceps'],
  'Bent-Over Row': ['Back', 'Biceps'],
  'T-Bar Row': ['Back', 'Biceps'],
  'Cable Rows': ['Back', 'Biceps'],
  'Lat Pulldowns': ['Back', 'Biceps'],
  'Face Pulls': ['Rear Delts', 'Rotator Cuff'],
  'Reverse Flyes': ['Rear Delts'],
  'Bicep Curls': ['Biceps'],
  'Hammer Curls': ['Biceps', 'Forearms'],
  'Cable Curls': ['Biceps'],
  'Preacher Curls': ['Biceps'],
  'Squats': ['Quads', 'Glutes', 'Core'],
  'Front Squats': ['Quads', 'Core'],
  'Romanian Deadlifts': ['Hamstrings', 'Glutes'],
  'Stiff Leg Deadlifts': ['Hamstrings'],
  'Leg Press': ['Quads', 'Glutes'],
  'Bulgarian Split Squats': ['Quads', 'Glutes'],
  'Walking Lunges': ['Quads', 'Glutes', 'Hamstrings'],
  'Lunges': ['Quads', 'Glutes'],
  'Hip Thrusts': ['Glutes'],
  'Calf Raises': ['Calves'],
  'Standing Calf Raises': ['Calves'],
  'Leg Curls': ['Hamstrings'],
  'Leg Extensions': ['Quads'],
  'Dumbbell Press': ['Chest', 'Shoulders', 'Triceps'],
  'Plank': ['Core'],
  'Russian Twists': ['Obliques', 'Core'],
  'Mountain Climbers': ['Core', 'Hip Flexors'],
};

function getDetails(exerciseName) {
  return EXERCISE_DETAILS[exerciseName] || { sets: '3', reps: '10–12', tips: 'Focus on form' };
}

function getMuscleGroups(exerciseName) {
  return MUSCLE_GROUPS[exerciseName] || ['General'];
}

export default function WorkoutPlan() {
  const [showModal, setShowModal] = useState(false);
  const [selectedSplit, setSelectedSplit] = useState('');
  const [workoutPlan, setWorkoutPlan] = useState(null);

  useEffect(() => {
    document.title = 'Workout Plan | Calories Counter';
  }, []);

  function handleCalculate(formData) {
    if (!formData.sex || !formData.age || !formData.height ||
        !formData.currentWeight || !formData.targetWeight) {
      setShowModal(true);
      return;
    }
    generateWorkoutRecommendation(formData);
  }

  function generateWorkoutRecommendation(data) {
    const weightDifference = parseFloat(data.currentWeight) - parseFloat(data.targetWeight);
    const weightDifferencePercent = Math.abs(weightDifference) / parseFloat(data.currentWeight) * 100;

    let goal = '';
    let recommendation = '';

    if (weightDifference > 2) {
      goal = 'fat-loss';
      recommendation = weightDifferencePercent > 15 ? 'upper-lower' : 'full-body';
    } else if (weightDifference < -2) {
      goal = 'bulk';
      recommendation = 'ppl';
    } else {
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

  const GOAL_LABELS = {
    'fat-loss': { label: 'Fat Loss', Icon: FlameIcon, color: 'coral' },
    'bulk': { label: 'Muscle Gain', Icon: DumbbellIcon, color: 'emerald' },
    'maintain': { label: 'Maintain Weight', Icon: ScaleIcon, color: 'blue' }
  };

  const workoutPlans = {
    'full-body': {
      title: 'Full Body Workout',
      description: '3 days/week • Ideal for beginners • Efficient for fat loss',
      frequency: '3x week',
      duration: '45–60 mins',
      Icon: RefreshCwIcon,
      schedule: [
        { day: 'Monday', workout: 'Full Body A', exercises: ['Squats', 'Bench Press', 'Bent-Over Row', 'Shoulder Press', 'Deadlifts', 'Plank'] },
        { day: 'Tuesday', workout: 'Rest', exercises: [] },
        { day: 'Wednesday', workout: 'Full Body B', exercises: ['Deadlifts', 'Incline Dumbbell Press', 'Pull-ups', 'Dips', 'Lunges', 'Russian Twists'] },
        { day: 'Thursday', workout: 'Rest', exercises: [] },
        { day: 'Friday', workout: 'Full Body C', exercises: ['Front Squats', 'Dumbbell Press', 'Cable Rows', 'Lateral Raises', 'Romanian Deadlifts', 'Mountain Climbers'] },
        { day: 'Saturday', workout: 'Rest', exercises: [] },
        { day: 'Sunday', workout: 'Rest', exercises: [] }
      ]
    },
    'upper-lower': {
      title: 'Upper / Lower Split',
      description: '4 days/week • Great for intermediates • Balanced approach',
      frequency: '4x week',
      duration: '50–70 mins',
      Icon: ColumnsIcon,
      schedule: [
        { day: 'Monday', workout: 'Upper Body A', exercises: ['Bench Press', 'Bent-Over Row', 'Shoulder Press', 'Pull-ups', 'Dips', 'Bicep Curls', 'Tricep Pushdowns'] },
        { day: 'Tuesday', workout: 'Lower Body A', exercises: ['Squats', 'Romanian Deadlifts', 'Bulgarian Split Squats', 'Hip Thrusts', 'Calf Raises', 'Leg Curls'] },
        { day: 'Wednesday', workout: 'Rest', exercises: [] },
        { day: 'Thursday', workout: 'Upper Body B', exercises: ['Incline Dumbbell Press', 'T-Bar Row', 'Lateral Raises', 'Lat Pulldowns', 'Close-Grip Bench', 'Hammer Curls'] },
        { day: 'Friday', workout: 'Lower Body B', exercises: ['Deadlifts', 'Front Squats', 'Walking Lunges', 'Leg Press', 'Calf Raises', 'Leg Extensions'] },
        { day: 'Saturday', workout: 'Rest', exercises: [] },
        { day: 'Sunday', workout: 'Rest', exercises: [] }
      ]
    },
    'ppl': {
      title: 'Push, Pull, Legs',
      description: '6 days/week • Advanced • Maximum muscle growth',
      frequency: '6x week',
      duration: '60–90 mins',
      Icon: BarbellIcon,
      schedule: [
        { day: 'Monday', workout: 'Push A', exercises: ['Bench Press', 'Shoulder Press', 'Incline Dumbbell Press', 'Lateral Raises', 'Dips', 'Tricep Pushdowns'] },
        { day: 'Tuesday', workout: 'Pull A', exercises: ['Deadlifts', 'Pull-ups', 'Bent-Over Row', 'T-Bar Row', 'Face Pulls', 'Bicep Curls', 'Hammer Curls'] },
        { day: 'Wednesday', workout: 'Legs A', exercises: ['Squats', 'Romanian Deadlifts', 'Leg Press', 'Walking Lunges', 'Calf Raises', 'Leg Curls'] },
        { day: 'Thursday', workout: 'Push B', exercises: ['Incline Barbell Press', 'Dumbbell Shoulder Press', 'Decline Press', 'Cable Lateral Raises', 'Close-Grip Bench'] },
        { day: 'Friday', workout: 'Pull B', exercises: ['Rack Pulls', 'Cable Rows', 'Lat Pulldowns', 'Reverse Flyes', 'Cable Curls', 'Preacher Curls'] },
        { day: 'Saturday', workout: 'Legs B', exercises: ['Front Squats', 'Stiff Leg Deadlifts', 'Bulgarian Split Squats', 'Hip Thrusts', 'Standing Calf Raises'] },
        { day: 'Sunday', workout: 'Rest', exercises: [] }
      ]
    }
  };

  return (
    <div className="workout-page">
      {/* Hero header */}
      <div className="page-hero">
        <h2 className="hero-title">
          <span className="hero-accent">Workout Plan</span> Generator
        </h2>
        <p className="hero-subtitle">
          Get a personalized training split based on your goals
        </p>
      </div>

      <WorkoutForm onCalculate={handleCalculate} />

      {workoutPlan && (
        <div className="workout-section animate-in">
          {/* Goal summary */}
          <div className={`goal-summary goal-summary-${GOAL_LABELS[workoutPlan.goal]?.color}`}>
            <div className="goal-badge">
              <span className="goal-icon">
                {(() => {
                  const GoalIcon = GOAL_LABELS[workoutPlan.goal]?.Icon;
                  return GoalIcon ? <GoalIcon size={24} /> : null;
                })()}
              </span>
              <span className={`goal-text goal-${GOAL_LABELS[workoutPlan.goal]?.color}`}>
                {GOAL_LABELS[workoutPlan.goal]?.label}
              </span>
            </div>
            <div className="goal-stats">
              <div className="goal-stat">
                <span className="goal-stat-label">Current</span>
                <span className="goal-stat-value">{workoutPlan.currentWeight} kg</span>
              </div>
              <div className="goal-stat-arrow">→</div>
              <div className="goal-stat">
                <span className="goal-stat-label">Target</span>
                <span className="goal-stat-value">{workoutPlan.targetWeight} kg</span>
              </div>
              <div className="goal-stat">
                <span className="goal-stat-label">Change</span>
                <span className={`goal-stat-value goal-${GOAL_LABELS[workoutPlan.goal]?.color}`}>
                  {Math.abs(parseFloat(workoutPlan.currentWeight) - parseFloat(workoutPlan.targetWeight)).toFixed(1)} kg{' '}
                  {parseFloat(workoutPlan.currentWeight) > parseFloat(workoutPlan.targetWeight) ? '↓' : '↑'}
                </span>
              </div>
            </div>
          </div>

          {/* Split selector */}
          <div className="split-selector">
            <h3>Choose Your Training Split</h3>
            <div className="split-options">
              {Object.entries(workoutPlans).map(([key, plan]) => (
                <button
                  key={key}
                  className={`split-option ${selectedSplit === key ? 'active' : ''}`}
                  onClick={() => handleSplitChange(key)}
                >
                  <span className="split-option-icon">{plan.Icon ? <plan.Icon size={24} /> : null}</span>
                  <div className="split-option-content">
                    <h4>{plan.title}</h4>
                    <p>{plan.description}</p>
                  </div>
                  {selectedSplit === key && (
                    <span className="split-check">
                      <CheckCircleIcon size={16} />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Weekly schedule */}
          {selectedSplit && workoutPlans[selectedSplit] && (
            <div className="plan-details animate-in">
              <div className="plan-header">
                <h3>
                  {(() => {
                    const PlanIcon = workoutPlans[selectedSplit].Icon;
                    return PlanIcon ? <PlanIcon size={24} /> : null;
                  })()}
                  {' '}{workoutPlans[selectedSplit].title}
                </h3>
                <div className="plan-meta">
                  <span className="plan-meta-tag">{workoutPlans[selectedSplit].frequency}</span>
                  <span className="plan-meta-tag">{workoutPlans[selectedSplit].duration}</span>
                </div>
              </div>
              <div className="weekly-schedule">
                {workoutPlans[selectedSplit].schedule.map((day, index) => (
                  <div
                    key={index}
                    className={`day-card ${day.workout === 'Rest' ? 'rest-day' : ''}`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="day-header">
                      <span className="day-name">{day.day}</span>
                      {day.workout !== 'Rest' && (
                        <span className={`day-badge day-badge-${GOAL_LABELS[workoutPlan.goal]?.color}`}>
                          {day.workout}
                        </span>
                      )}
                    </div>
                    {day.workout === 'Rest' ? (
                      <div className="rest-indicator">
                        <span className="rest-icon"><MoonIcon size={16} /></span>
                        <span>Recovery Day</span>
                      </div>
                    ) : (
                      <ul className="exercise-list">
                        {day.exercises.map((exercise, i) => {
                          const details = getDetails(exercise);
                          const muscles = getMuscleGroups(exercise);
                          return (
                            <li key={i} className="exercise-item">
                              <div className="exercise-info">
                                <span className="exercise-name">{exercise}</span>
                                <span className="exercise-detail">
                                  {details.sets} × {details.reps}
                                </span>
                              </div>
                              <div className="exercise-muscles">
                                {muscles.map((m, mi) => (
                                  <span key={mi} className="muscle-tag">{m}</span>
                                ))}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!workoutPlan && (
        <div className="placeholder">
          <div className="placeholder-icon"><DumbbellIcon size={48} /></div>
          <p>
            Fill in your details above (including your target weight goal) to get a
            <strong> personalized workout plan</strong> recommendation!
          </p>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <h3>Missing Information</h3>
        <p>Please fill out all fields before generating a workout plan.</p>
      </Modal>

      <footer className="copyright-footer">
        <p>Copyright &copy;2025 Billy Htet</p>
      </footer>
    </div>
  );
}
