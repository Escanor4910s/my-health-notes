import { useEffect } from 'react';

export function useShortcuts({ onNext, onPrev, onToggleZen, onSave, onCommandPalette }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if we are typing inside an input/textarea (except for Ctrl+S / Ctrl+K / Zen)
      const isInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';

      // Alt + Right
      if (e.altKey && e.key === 'ArrowRight') {
        if (!isInput) {
          e.preventDefault();
          onNext?.();
        }
      }
      
      // Alt + Left
      if (e.altKey && e.key === 'ArrowLeft') {
        if (!isInput) {
          e.preventDefault();
          onPrev?.();
        }
      }

      // Ctrl + Shift + F (Zen Mode)
      if (e.ctrlKey && e.shiftKey && (e.key === 'f' || e.key === 'F')) {
        e.preventDefault();
        onToggleZen?.();
      }

      // Ctrl + S (Save)
      if (e.ctrlKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        onSave?.();
      }

      // Ctrl + K (Command Palette) - wait, it's already in CommandPalette component or triggered via window event?
      // In App.jsx, window.addEventListener('keydown', (e) => { if (e.ctrlKey && e.key === 'k') setIsCommandPaletteOpen(true) })
      // We can trigger the custom event here to centralize.
      if (e.ctrlKey && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        if (onCommandPalette) onCommandPalette();
        else window.dispatchEvent(new CustomEvent('open-command-palette'));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNext, onPrev, onToggleZen, onSave, onCommandPalette]);
}
