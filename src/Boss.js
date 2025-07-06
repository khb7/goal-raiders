
import React from 'react';
import './Boss.css';

const Boss = ({ bossName, currentHp, maxHp, takingDamage, isDefeated, dueDate }) => {
  const hpPercentage = (currentHp / maxHp) * 100;

  const getDDay = (dateString) => {
    if (!dateString) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(dateString);
    dueDate.setHours(0, 0, 0, 0);

    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "D-Day!";
    } else if (diffDays > 0) {
      return `D-${diffDays}`;
    } else {
      return `D+${Math.abs(diffDays)}`;
    }
  };

  const dDayText = getDDay(dueDate);

  return (
    <div className="boss-container text-center card mb-4">
        <div className="card-body">
            <h2 className="card-title">{bossName}</h2>
            {dueDate && <p className="card-text">Due: {dueDate} {dDayText && `(${dDayText})`}</p>}
            <div className={`boss-image-container ${takingDamage ? 'shake' : ''} ${isDefeated ? 'rotate-90' : ''}`}>
                <svg className="boss-svg" viewBox="0 0 100 100">
                    {/* Body */}
                    <circle cx="50" cy="60" r="30" fill="#388E3C" />
                    {/* Eye */}
                    <circle cx="50" cy="50" r="8" fill="#CDDC39" />
                    <circle cx="50" cy="50" r="4" fill="#000000" />
                     {/* Horns */}
                    <path d="M 35 30 L 40 20 L 45 30 Z" fill="#558B2F" />
                    <path d="M 65 30 L 60 20 L 55 30 Z" fill="#558B2F" />
                </svg>
            </div>
            <div className="progress mt-3" style={{ height: '30px' }}>
                <div
                    className="progress-bar bg-success"
                    role="progressbar"
                    style={{ width: `${hpPercentage}%` }}
                    aria-valuenow={currentHp}
                    aria-valuemin="0"
                    aria-valuemax={maxHp}
                >
                </div>
                    <strong className='hp-text'>{`${currentHp} / ${maxHp} HP`}</strong>
            </div>
        </div>
    </div>
  );
};

export default Boss;
