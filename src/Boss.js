
import React from 'react';
import './Boss.css';

// Helper function to get a consistent number from a string/number ID
const getIndexFromId = (id, arrayLength) => {
  // Log the received ID for debugging
  console.log(`getIndexFromId received id: ${id}, type: ${typeof id}`);

  if (id === null || id === undefined) {
    console.log("ID is null or undefined, returning 0.");
    return 0;
  }

  let hash = 0;
  const idStr = String(id); // Convert ID to string to be safe

  if (idStr.length === 0) {
    console.log("ID string is empty, returning 0.");
    return 0;
  }

  for (let i = 0; i < idStr.length; i++) {
    const char = idStr.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }

  const index = Math.abs(hash) % arrayLength;
  console.log(`Calculated index: ${index}`);
  return index;
};


const Boss = ({ bossId, bossName, currentHp, maxHp, takingDamage, isDefeated, dueDate }) => {
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

  // --- Array of Boss Designs ---
  const bossDesigns = [
    // Design 1: Slime Boss
    <svg key="slime" className="boss-svg" viewBox="0 0 100 100">
        <circle cx="50" cy="60" r="30" fill="#388E3C" />
        <circle cx="50" cy="50" r="8" fill="#CDDC39" />
        <circle cx="50" cy="50" r="4" fill="#000000" />
        <path d="M 35 30 L 40 20 L 45 30 Z" fill="#558B2F" />
        <path d="M 65 30 L 60 20 L 55 30 Z" fill="#558B2F" />
    </svg>,
    // Design 2: Golem Boss
    <svg key="golem" className="boss-svg" viewBox="0 0 100 100">
        <rect x="35" y="20" width="30" height="20" fill="#A1887F" />
        <rect x="25" y="40" width="50" height="40" fill="#795548" />
        <circle cx="50" cy="30" r="5" fill="#FF5722" />
    </svg>,
    // Design 3: Ghost Boss
    <svg key="ghost" className="boss-svg" viewBox="0 0 100 100">
        <path d="M 20 80 Q 50 20 80 80 Z" fill="#90A4AE" />
        <circle cx="40" cy="50" r="5" fill="#000000" />
        <circle cx="60" cy="50" r="5" fill="#000000" />
    </svg>,
    // Design 4: Cyclops Boss
    <svg key="cyclops" className="boss-svg" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" fill="#4A148C" />
        <circle cx="50" cy="50" r="15" fill="#FFFFFF" />
        <circle cx="50" cy="50" r="8" fill="#000000" />
        <rect x="40" y="70" width="20" height="5" fill="#000000" />
    </svg>
  ];

  // Select a boss design based on the bossId
  const bossIndex = getIndexFromId(bossId, bossDesigns.length);
  const BossAppearance = bossDesigns[bossIndex];

  return (
    <div className="boss-container text-center">
        <div className="card-body">
            <h2 className="card-title">{bossName}</h2>
            {dueDate && <p className="card-text">Due: {dueDate} {dDayText && `(${dDayText})`}</p>}
            <div className={`boss-image-container ${takingDamage ? 'shake' : ''} ${isDefeated ? 'rotate-90' : ''}`}>
                {BossAppearance}
            </div>
            <div className="progress mt-3" style={{ height: '30px' }}>
                <div
                    className="progress-bar"
                    role="progressbar"
                    style={{ width: `${hpPercentage}%`, backgroundColor: 'var(--primary-color)' }}
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
