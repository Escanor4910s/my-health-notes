import React from 'react';

export const PremiumCheckbox = React.memo(({ checked, onChange, id, label }) => {
  const handleChange = (e) => {
    if (navigator.vibrate) {
      navigator.vibrate(e.target.checked ? 30 : 10);
    }
    if (onChange) onChange(e);
  };

  return (
    <label className="checkbox-container">
      <input
        type="checkbox"
        className="hidden-checkbox"
        checked={checked}
        onChange={handleChange}
        id={id}
      />
      <span className="custom-checkbox-indicator"></span>
      <span className="checkbox-label" style={{
        fontSize: '0.92rem',
        fontWeight: '500',
        color: checked ? 'var(--text-main)' : 'var(--text-muted)',
        transition: 'color 0.2s ease',
        lineHeight: '1.4',
        wordBreak: 'break-word',
        flex: 1
      }}>
        {label}
      </span>
    </label>
  );
}, (prev, next) => {
  return prev.checked === next.checked && prev.id === next.id && prev.label === next.label;
});
