import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { bmr, tdee, goals } from '../utils/calories';
import './Progress.css';

const RANGES = [
  { key: '7', label: '7 days' },
  { key: '30', label: '30 days' },
  { key: '90', label: '90 days' },
  { key: 'all', label: 'All' }
];

export default function Progress() {
  const { user, profile } = useAuth();

  const [weightLogs, setWeightLogs] = useState([]);
  const [calorieLogs, setCalorieLogs] = useState([]);
  const [newWeight, setNewWeight] = useState('');
  const [savingWeight, setSavingWeight] = useState(false);
  const [range, setRange] = useState('7');
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    document.title = 'Progress | Calories Counter';
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  async function fetchData() {
    setLoading(true);

    let dateFilter = null;
    if (range !== 'all') {
      const d = new Date();
      d.setDate(d.getDate() - parseInt(range));
      dateFilter = d.toISOString().split('T')[0];
    }

    // Fetch weight logs
    let weightQuery = supabase
      .from('weight_logs')
      .select('*')
      .order('logged_date', { ascending: true });

    if (dateFilter) weightQuery = weightQuery.gte('logged_date', dateFilter);

    const { data: weightData } = await weightQuery;
    if (weightData) setWeightLogs(weightData);

    // Fetch daily calorie totals
    let calorieQuery = supabase
      .from('food_entries')
      .select('logged_date, calories')
      .order('logged_date', { ascending: true });

    if (dateFilter) calorieQuery = calorieQuery.gte('logged_date', dateFilter);

    const { data: rawCalories } = await calorieQuery;

    if (rawCalories) {
      // Aggregate by date
      const grouped = rawCalories.reduce((acc, row) => {
        const key = row.logged_date;
        if (!acc[key]) acc[key] = 0;
        acc[key] += parseFloat(row.calories);
        return acc;
      }, {});

      setCalorieLogs(
        Object.entries(grouped)
          .map(([date, total]) => ({ date, calories: Math.round(total) }))
          .sort((a, b) => a.date.localeCompare(b.date))
      );
    }

    setLoading(false);
  }

  async function handleLogWeight(e) {
    e.preventDefault();
    if (!newWeight || newWeight < 30 || newWeight > 250) return;

    setSavingWeight(true);
    await supabase.from('weight_logs').upsert({
      user_id: user.id,
      logged_date: today,
      weight_kg: parseFloat(newWeight)
    }, { onConflict: 'user_id,logged_date' });

    setNewWeight('');
    setSavingWeight(false);
    fetchData();
  }

  // Calculate goal calories from profile
  function getGoalCalories() {
    if (!profile?.weight_kg || !profile?.sex || !profile?.age ||
        !profile?.height_cm || !profile?.activity_key || !profile?.target_weight_kg) {
      return null;
    }
    const b = bmr({
      sex: profile.sex,
      weightKg: parseFloat(profile.weight_kg),
      heightCm: parseFloat(profile.height_cm),
      age: parseInt(profile.age)
    });
    const t = tdee({ bmrValue: b, activityKey: profile.activity_key });
    const g = goals({
      tdeeValue: t,
      weightKg: parseFloat(profile.weight_kg),
      targetWeightKg: parseFloat(profile.target_weight_kg)
    });

    const diff = parseFloat(profile.weight_kg) - parseFloat(profile.target_weight_kg);
    if (diff > 0.1) return g.cut.kcal;
    if (diff < -0.1) return g.bulk.kcal;
    return g.maintenance.kcal;
  }

  const goalCalories = getGoalCalories();

  return (
    <div className="progress-page">
      <div className="page-hero">
        <h2 className="hero-title">
          <span className="hero-accent">Progress</span>
        </h2>
        <p className="hero-subtitle">Track your weight and calorie trends</p>
      </div>

      {/* Log weight form */}
      <div className="log-weight-card">
        <h3>Log Today's Weight</h3>
        <form onSubmit={handleLogWeight} className="log-weight-form">
          <div className="weight-input-group">
            <input
              type="number"
              min="30"
              max="250"
              step="0.1"
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
              placeholder="Weight in kg"
              className="weight-input"
            />
            <button type="submit" disabled={savingWeight} className="weight-save-btn">
              {savingWeight ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>

      {/* Range selector */}
      <div className="range-selector">
        {RANGES.map(r => (
          <button
            key={r.key}
            className={`range-btn ${range === r.key ? 'active' : ''}`}
            onClick={() => setRange(r.key)}
          >
            {r.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="auth-loading"><div className="spinner" /><p>Loading charts...</p></div>
      ) : (
        <>
          {/* Weight chart */}
          <div className="chart-card">
            <h3>Weight Trend</h3>
            {weightLogs.length > 1 ? (
              <WeightChart data={weightLogs} />
            ) : (
              <div className="chart-empty">
                <p>Log your weight over multiple days to see a trend.</p>
              </div>
            )}
          </div>

          {/* Calorie chart */}
          <div className="chart-card">
            <h3>Calorie Intake</h3>
            {calorieLogs.length > 1 ? (
              <CalorieChart data={calorieLogs} goal={goalCalories} />
            ) : (
              <div className="chart-empty">
                <p>Log food over multiple days to see calorie trends.</p>
              </div>
            )}
          </div>
        </>
      )}

      <footer className="copyright-footer">
        <p>Copyright &copy;2026 Billy Htet</p>
      </footer>
    </div>
  );
}

/* ── Hand-rolled SVG chart components ───── */

function WeightChart({ data }) {
  const w = 600;
  const h = 200;
  const pad = { top: 20, right: 20, bottom: 30, left: 50 };
  const pw = w - pad.left - pad.right;
  const ph = h - pad.top - pad.bottom;

  const weights = data.map(d => parseFloat(d.weight_kg));
  const minW = Math.floor(Math.min(...weights) - 1);
  const maxW = Math.ceil(Math.max(...weights) + 1);
  const yScale = v => pad.top + ph - ((v - minW) / (maxW - minW)) * ph;
  const xScale = (i) => pad.left + (i / Math.max(data.length - 1, 1)) * pw;

  const points = data.map((d, i) => `${xScale(i)},${yScale(parseFloat(d.weight_kg))}`).join(' ');
  const yTicks = 5;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="chart-svg" preserveAspectRatio="xMidYMid meet">
      {/* Y axis gridlines and labels */}
      {Array.from({ length: yTicks }, (_, i) => {
        const val = minW + (i / (yTicks - 1)) * (maxW - minW);
        const y = yScale(val);
        return (
          <g key={i}>
            <line x1={pad.left} y1={y} x2={w - pad.right} y2={y} stroke="var(--line)" strokeWidth="1" />
            <text x={pad.left - 8} y={y + 4} textAnchor="end" fill="var(--muted)" fontSize="10">
              {val.toFixed(0)}
            </text>
          </g>
        );
      })}

      {/* X axis labels */}
      {data.map((d, i) => {
        if (i % Math.ceil(data.length / 7) !== 0 && i !== data.length - 1) return null;
        return (
          <text key={i} x={xScale(i)} y={h - 6} textAnchor="middle" fill="var(--muted)" fontSize="9">
            {d.logged_date.slice(5)}
          </text>
        );
      })}

      {/* Area fill */}
      <polygon
        points={`${xScale(0)},${h - pad.bottom} ${points} ${xScale(data.length - 1)},${h - pad.bottom}`}
        fill="var(--accent)"
        opacity="0.08"
      />

      {/* Line */}
      <polyline points={points} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinejoin="round" />

      {/* Data points */}
      {data.map((d, i) => (
        <circle key={i} cx={xScale(i)} cy={yScale(parseFloat(d.weight_kg))} r="3" fill="var(--accent)" />
      ))}
    </svg>
  );
}

function CalorieChart({ data, goal }) {
  const w = 600;
  const h = 200;
  const pad = { top: 20, right: 20, bottom: 30, left: 50 };
  const pw = w - pad.left - pad.right;
  const ph = h - pad.top - pad.bottom;

  const calories = data.map(d => d.calories);
  const maxC = Math.max(Math.ceil(Math.max(...calories) / 100) * 100, goal || 2000, 500);
  const minC = 0;
  const yScale = v => pad.top + ph - ((v - minC) / (maxC - minC)) * ph;
  const xScale = (i) => pad.left + (i / Math.max(data.length - 1, 1)) * pw;

  const barWidth = Math.max(4, Math.min(pw / data.length - 4, 40));

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="chart-svg" preserveAspectRatio="xMidYMid meet">
      {/* Goal line */}
      {goal && (
        <>
          <line x1={pad.left} y1={yScale(goal)} x2={w - pad.right} y2={yScale(goal)}
            stroke="#ef4444" strokeWidth="1" strokeDasharray="4 3" />
          <text x={w - pad.right} y={yScale(goal) - 6} textAnchor="end" fill="#ef4444" fontSize="9">
            Goal: {goal} kcal
          </text>
        </>
      )}

      {/* Bars */}
      {data.map((d, i) => {
        const barH = ph - (yScale(d.calories) - pad.top);
        return (
          <rect
            key={i}
            x={xScale(i) - barWidth / 2}
            y={yScale(d.calories)}
            width={barWidth}
            height={barH}
            fill="var(--accent)"
            opacity="0.7"
            rx="2"
          />
        );
      })}

      {/* X labels */}
      {data.map((d, i) => {
        if (i % Math.ceil(data.length / 7) !== 0 && i !== data.length - 1) return null;
        return (
          <text key={i} x={xScale(i)} y={h - 6} textAnchor="middle" fill="var(--muted)" fontSize="9">
            {d.date.slice(5)}
          </text>
        );
      })}
    </svg>
  );
}
