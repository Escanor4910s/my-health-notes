import React, { useState, useEffect, useMemo } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';
import { useVoiceDictation } from '../../hooks/useVoiceDictation';

const AudioVisualizer = () => (
  <div className="audio-visualizer">
    <div className="visualizer-bar"></div>
    <div className="visualizer-bar"></div>
    <div className="visualizer-bar"></div>
    <div className="visualizer-bar"></div>
    <div className="visualizer-bar"></div>
  </div>
);

const DictationWrapper = ({ id, name, value, onChange, children, type = 'text' }) => {
  const [baseValue, setBaseValue] = useState(value || '');
  const [interim, setInterim] = useState('');
  
  useEffect(() => {
    if (!interim) {
      setBaseValue(value || '');
    }
  }, [value, interim]);

  const handleResult = ({ finalTranscript, interimTranscript }) => {
    let currentBase = baseValue;
    if (finalTranscript) {
      const newVal = currentBase + (currentBase && !currentBase.endsWith(' ') ? ' ' : '') + finalTranscript;
      setBaseValue(newVal);
      setInterim('');
      if (onChange) onChange({ target: { id: id, name: name || id, value: newVal, type } });
    } else if (interimTranscript) {
      setInterim(interimTranscript);
      const displayVal = currentBase + (currentBase && !currentBase.endsWith(' ') ? ' ' : '') + interimTranscript;
      if (onChange) onChange({ target: { id: id, name: name || id, value: displayVal, type } });
    }
  };

  const { status, isListening, isSupported, toggleListening } = useVoiceDictation({ onResult: handleResult });

  const isBusy = status === 'starting' || status === 'stopping';
  
  // Decide icon based on status
  let Icon = Mic;
  let iconColor = 'var(--text-light)';
  let micClass = 'mic-btn';
  let title = 'Démarrer la dictée vocale';

  if (isBusy) {
    Icon = Loader2;
    iconColor = 'var(--text-light)';
    micClass = 'mic-btn animate-spin';
    title = 'Veuillez patienter...';
  } else if (status === 'listening') {
    Icon = Square;
    iconColor = '#ef4444'; // Red
    micClass = 'mic-btn mic-pulse';
    title = 'Arrêter la dictée';
  }

  const displayValue = isListening && interim ? baseValue + (baseValue && !baseValue.endsWith(' ') ? ' ' : '') + interim : value;

  return (
    <div style={{ position: 'relative' }}>
      {React.cloneElement(children, {
        value: displayValue,
        onChange: (e) => {
          setBaseValue(e.target.value);
          if (onChange) onChange(e);
        }
      })}
      
      {isSupported && (
        <div style={{
          position: 'absolute',
          bottom: children.type === 'textarea' ? '12px' : '6px',
          right: children.type === 'textarea' ? '12px' : '6px',
          display: 'flex',
          alignItems: 'center'
        }}>
          {status === 'listening' && <AudioVisualizer />}
          
          <button
            type="button"
            onClick={toggleListening}
            className={micClass}
            disabled={isBusy}
            style={{
              background: status === 'listening' ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
              border: 'none',
              borderRadius: '50%',
              padding: '6px',
              cursor: isBusy ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
            }}
            title={title}
          >
            <Icon size={18} color={iconColor} />
          </button>
        </div>
      )}
    </div>
  );
};

export const PremiumInput = React.memo(({ id, name, label, type = 'text', placeholder, value, onChange, required, ...rest }) => {
  const [localValue, setLocalValue] = React.useState(value || '');
  const timeoutRef = React.useRef(null);

  React.useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  const handleChange = React.useCallback((e) => {
    const newVal = e.target.value;
    setLocalValue(newVal);
    
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (onChange) {
        onChange({ target: { id: id, name: name || id, value: newVal, type } });
      }
    }, 300);
  }, [onChange, id, name, type]);

  const hasValue = localValue !== undefined && localValue !== null && localValue.toString().trim() !== '';

  return (
    <div className="input-group">
      {label && (
        <label htmlFor={id} className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {label}
          {required && (
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: hasValue ? 'var(--success)' : 'var(--danger)',
              display: 'inline-block',
              transition: 'background-color 0.3s ease, transform 0.3s ease',
              transform: hasValue ? 'scale(1.2)' : 'scale(1)',
              boxShadow: hasValue ? '0 0 4px rgba(90, 138, 94, 0.4)' : 'none'
            }} title={hasValue ? 'Valide' : 'Champ obligatoire'} />
          )}
        </label>
      )}
      <DictationWrapper id={id} name={name} value={localValue} onChange={handleChange} type={type}>
        <input
          id={id}
          name={name}
          type={type}
          className="input-field"
          placeholder={placeholder}
          style={{ paddingRight: '60px' }} // Make room for visualizer and mic
          {...rest}
        />
      </DictationWrapper>
    </div>
  );
}, (prev, next) => {
  return prev.value === next.value && prev.id === next.id && prev.label === next.label && prev.required === next.required;
});

export const PremiumTextArea = React.memo(({ id, name, label, placeholder, value, onChange, rows = 4, required, ...rest }) => {
  const [localValue, setLocalValue] = React.useState(value || '');
  const timeoutRef = React.useRef(null);

  React.useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  const handleChange = React.useCallback((e) => {
    const newVal = e.target.value;
    setLocalValue(newVal);
    
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (onChange) {
        onChange({ target: { id: id, name: name || id, value: newVal, type: 'textarea' } });
      }
    }, 300);
  }, [onChange, id, name]);

  const hasValue = localValue !== undefined && localValue !== null && localValue.toString().trim() !== '';
  
  const wordCount = useMemo(() => {
    if (!localValue) return 0;
    return localValue.toString().trim().split(/\s+/).filter(word => word.length > 0).length;
  }, [localValue]);

  const wordCountColor = wordCount > 200 ? 'var(--brown)' : (wordCount > 50 ? 'var(--success)' : 'var(--text-light)');

  return (
    <div className="input-group">
      {label && (
        <label htmlFor={id} className="input-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {label}
            {required && (
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: hasValue ? 'var(--success)' : 'var(--danger)',
                display: 'inline-block',
                transition: 'background-color 0.3s ease, transform 0.3s ease',
                transform: hasValue ? 'scale(1.2)' : 'scale(1)',
                boxShadow: hasValue ? '0 0 4px rgba(90, 138, 94, 0.4)' : 'none'
              }} title={hasValue ? 'Valide' : 'Champ obligatoire'} />
            )}
          </span>
          <span style={{ fontSize: '0.7rem', fontWeight: '500', color: wordCountColor, transition: 'color 0.3s' }}>
            {wordCount} mot{wordCount !== 1 ? 's' : ''}
          </span>
        </label>
      )}
      <DictationWrapper id={id} name={name} value={localValue} onChange={handleChange} type="textarea">
        <textarea
          id={id}
          name={name}
          className="input-field"
          placeholder={placeholder}
          rows={rows}
          style={{ resize: 'vertical', minHeight: '80px', paddingRight: '60px', paddingBottom: '30px' }}
          {...rest}
        />
      </DictationWrapper>
    </div>
  );
}, (prev, next) => {
  return prev.value === next.value && prev.id === next.id && prev.label === next.label && prev.required === next.required;
});
