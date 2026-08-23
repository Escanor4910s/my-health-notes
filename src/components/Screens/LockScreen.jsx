import React, { useState, useEffect } from 'react';
import { Lock, KeyRound } from 'lucide-react';

export default function LockScreen({ onUnlock }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const correctPin = localStorage.getItem('obsmed-pin');

  const handleInput = (num) => {
    if (pin.length < 4) {
      if (navigator.vibrate) navigator.vibrate(15);
      setPin(prev => prev + num);
      setError(false);
    }
  };

  const handleBackspace = () => {
    if (navigator.vibrate) navigator.vibrate(10);
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  useEffect(() => {
    if (pin.length === 4) {
      if (pin === correctPin) {
        onUnlock();
      } else {
        setError(true);
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        setTimeout(() => setPin(''), 500);
      }
    }
  }, [pin, correctPin, onUnlock]);

  const handleBiometric = async () => {
    if (navigator.vibrate) navigator.vibrate(30);
    // En production, utiliser WebAuthn API. Ici, on simule ou on utilise juste le PIN.
    const attempt = window.prompt("Simulation biométrique: Tapez votre PIN pour déverrouiller");
    if (attempt === correctPin) onUnlock();
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'var(--bg-main)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      zIndex: 99999, padding: '2rem'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ width: '80px', height: '80px', background: 'var(--surface)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}>
          <Lock size={36} color="var(--primary)" />
        </div>
        <h2 style={{ fontSize: '1.8rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Verrouillé</h2>
        <p style={{ color: 'var(--text-muted)' }}>Veuillez entrer votre code PIN pour accéder aux dossiers.</p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem' }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{
            width: '20px', height: '20px', borderRadius: '50%',
            background: pin.length > i ? 'var(--primary)' : 'var(--surface-border)',
            transition: 'all 0.2s',
            transform: error ? 'translateX(5px)' : 'none',
            animation: error ? 'shake 0.4s' : 'none'
          }} />
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', maxWidth: '300px', margin: '0 auto' }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <button key={num} onClick={() => handleInput(num.toString())} style={{
            width: '70px', height: '70px', borderRadius: '50%', border: 'none', background: 'var(--surface)',
            color: 'var(--text-main)', fontSize: '1.5rem', fontWeight: '600', cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(0,0,0,0.05)', transition: 'background 0.2s'
          }}>
            {num}
          </button>
        ))}
        <button onClick={handleBiometric} style={{
            width: '70px', height: '70px', borderRadius: '50%', border: 'none', background: 'transparent',
            color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
        }}>
          <KeyRound size={28} />
        </button>
        <button onClick={() => handleInput('0')} style={{
            width: '70px', height: '70px', borderRadius: '50%', border: 'none', background: 'var(--surface)',
            color: 'var(--text-main)', fontSize: '1.5rem', fontWeight: '600', cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
        }}>
          0
        </button>
        <button onClick={handleBackspace} style={{
            width: '70px', height: '70px', borderRadius: '50%', border: 'none', background: 'transparent',
            color: 'var(--text-secondary)', fontSize: '1.2rem', cursor: 'pointer'
        }}>
          ⌫
        </button>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          50% { transform: translateX(8px); }
          75% { transform: translateX(-8px); }
        }
      `}</style>
    </div>
  );
}
