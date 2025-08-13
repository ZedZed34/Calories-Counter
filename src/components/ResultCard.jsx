import React from 'react';
import './ResultCard.css';

export default function ResultCard({ title = '', kcal = 0, proteinG = 0, fatG = 0, carbsG = 0 }) {
  return (
    <div className="card">
      <h3 className="title">{title}</h3>
      <div className="kcal">{kcal} kcal/day</div>
      <div className="macros">
        <div><strong>{proteinG}g</strong><span>Protein</span></div>
        <div><strong>{fatG}g</strong><span>Fat</span></div>
        <div><strong>{carbsG}g</strong><span>Carbs</span></div>
      </div>
    </div>
  );
}
