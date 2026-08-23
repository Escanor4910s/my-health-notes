import React from 'react';

export default function AnatomyMap({ onBodyPartClick }) {
  // SVG d'un corps humain stylisé simplifié.
  // Les path auront une classe interactive.
  const handlePartClick = (partName) => {
    if (navigator.vibrate) navigator.vibrate(20);
    onBodyPartClick(partName);
  };

  const interactiveStyle = {
    fill: 'var(--surface-border)',
    stroke: 'var(--primary)',
    strokeWidth: 2,
    cursor: 'pointer',
    transition: 'fill 0.2s',
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
      <svg width="200" height="400" viewBox="0 0 100 200" style={{ filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.1))' }}>
        <style>{`
          .body-part:hover { fill: var(--primary) !important; opacity: 0.5; }
        `}</style>
        {/* Tête */}
        <circle cx="50" cy="20" r="12" className="body-part" style={interactiveStyle} onClick={() => handlePartClick('Tête / Céphalées')} />
        {/* Cou */}
        <rect x="44" y="32" width="12" height="10" className="body-part" style={interactiveStyle} onClick={() => handlePartClick('Cou / Cervicalgies')} />
        {/* Tronc */}
        <path d="M 35 42 L 65 42 L 60 100 L 40 100 Z" className="body-part" style={interactiveStyle} onClick={() => handlePartClick('Thorax / Abdomen')} />
        {/* Bras Gauche (Vue de face, donc à droite sur l'image) */}
        <path d="M 65 42 L 80 80 L 85 110 L 75 110 L 70 80 L 62 48 Z" className="body-part" style={interactiveStyle} onClick={() => handlePartClick('Membre supérieur gauche')} />
        {/* Bras Droit */}
        <path d="M 35 42 L 20 80 L 15 110 L 25 110 L 30 80 L 38 48 Z" className="body-part" style={interactiveStyle} onClick={() => handlePartClick('Membre supérieur droit')} />
        {/* Jambe Gauche */}
        <path d="M 50 100 L 60 100 L 55 180 L 45 180 Z" className="body-part" style={interactiveStyle} onClick={() => handlePartClick('Membre inférieur gauche')} />
        {/* Jambe Droite */}
        <path d="M 40 100 L 50 100 L 55 180 L 45 180 Z" className="body-part" style={interactiveStyle} onClick={() => handlePartClick('Membre inférieur droit')} />
      </svg>
    </div>
  );
}
