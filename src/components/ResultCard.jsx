import React from 'react';
import { FlameIcon, ZapIcon, TrendingDownIcon, TrendingUpIcon, ChartBarIcon } from './Icons';
import './ResultCard.css';

const CARD_CONFIG = {
  'BMR': {
    Icon: FlameIcon,
    description: 'Resting energy burn'
  },
  'TDEE (Maintenance)': {
    Icon: ZapIcon,
    description: 'Daily energy to maintain weight'
  },
  'Cut (Deficit)': {
    Icon: TrendingDownIcon,
    description: 'Calorie deficit for fat loss'
  },
  'Bulk (Surplus)': {
    Icon: TrendingUpIcon,
    description: 'Calorie surplus for muscle gain'
  }
};

export default function ResultCard({
  title = '',
  kcal = 0,
  proteinG = 0,
  fatG = 0,
  carbsG = 0,
  staggerIndex = 0
}) {
  const config = CARD_CONFIG[title] || { Icon: ChartBarIcon, description: '' };

  return (
    <div
      className="result-card"
      style={{ animationDelay: `${staggerIndex * 0.08}s` }}
    >
      {/* Accent bar */}
      <div className="card-accent-bar" />

      {/* Header */}
      <div className="card-header">
        <div className="card-icon">
          <config.Icon size={20} />
        </div>
        <div className="card-title-group">
          <h3 className="card-title">{title}</h3>
          {config.description && (
            <span className="card-subtitle">{config.description}</span>
          )}
        </div>
      </div>

      {/* Kcal display */}
      <div className="card-kcal">
        <span className="kcal-number">{kcal.toLocaleString()}</span>
        <span className="kcal-unit">kcal/day</span>
      </div>

      {/* Macro bars — only show if there are macros */}
      {(proteinG > 0 || fatG > 0 || carbsG > 0) && (
        <div className="card-macros">
          <div className="macro-item">
            <div className="macro-header">
              <span className="macro-label">Protein</span>
              <span className="macro-value">{proteinG}g</span>
            </div>
            <div className="macro-bar-track">
              <div
                className="macro-bar-fill"
                style={{ width: `${Math.min((proteinG / 250) * 100, 100)}%` }}
              />
            </div>
          </div>

          <div className="macro-item">
            <div className="macro-header">
              <span className="macro-label">Fat</span>
              <span className="macro-value">{fatG}g</span>
            </div>
            <div className="macro-bar-track">
              <div
                className="macro-bar-fill"
                style={{ width: `${Math.min((fatG / 120) * 100, 100)}%` }}
              />
            </div>
          </div>

          <div className="macro-item">
            <div className="macro-header">
              <span className="macro-label">Carbs</span>
              <span className="macro-value">{carbsG}g</span>
            </div>
            <div className="macro-bar-track">
              <div
                className="macro-bar-fill"
                style={{ width: `${Math.min((carbsG / 400) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
