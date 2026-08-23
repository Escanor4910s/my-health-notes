import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X, Play, Pause } from 'lucide-react';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState(null);

  const notify = useCallback(({ type = 'info', message, duration = 4000 }) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message, duration }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const confirmAction = useCallback(({ message, onConfirm, onCancel }) => {
    setConfirmDialog({
      message,
      onConfirm: () => {
        if (onConfirm) onConfirm();
        setConfirmDialog(null);
      },
      onCancel: () => {
        if (onCancel) onCancel();
        setConfirmDialog(null);
      }
    });
  }, []);

  return (
    <NotificationContext.Provider value={{ notify, confirmAction }}>
      {children}
      
      {/* Toast Container */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>

      {/* Confirm Dialog */}
      {confirmDialog && (
        <div className="confirm-overlay">
          <div className="confirm-card">
            <p className="confirm-message">{confirmDialog.message}</p>
            <div className="confirm-actions">
              <button className="confirm-btn cancel-btn" onClick={confirmDialog.onCancel}>Annuler</button>
              <button className="confirm-btn confirm-btn-danger" onClick={confirmDialog.onConfirm}>Confirmer</button>
            </div>
          </div>
        </div>
      )}

      {/* Internal Styles */}
      <style>{`
        .toast-container {
          position: fixed;
          top: 24px;
          right: 24px;
          z-index: 99999;
          display: flex;
          flex-direction: column;
          gap: 12px;
          pointer-events: none;
        }

        @media (max-width: 480px) {
          .toast-container {
            top: 16px;
            left: 16px;
            right: 16px;
            align-items: center;
          }
        }

        .toast-item {
          pointer-events: auto;
          display: flex;
          align-items: flex-start;
          width: 320px;
          max-width: 100%;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
          border-radius: 16px;
          overflow: hidden;
          position: relative;
          animation: slideIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          font-family: inherit;
        }
        
        .toast-item.exiting {
          animation: fadeOut 0.2s ease-out forwards;
        }

        @media (max-width: 480px) {
          .toast-item {
            width: 100%;
          }
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes fadeOut {
          from { opacity: 1; transform: translateY(0); }
          to { opacity: 0; transform: translateY(-10px); }
        }

        .toast-border {
          width: 4px;
          flex-shrink: 0;
          align-self: stretch;
        }
        .toast-border.success { background-color: #10b981; }
        .toast-border.error { background-color: #ef4444; }
        .toast-border.warning { background-color: #f59e0b; }
        .toast-border.info { background-color: #3b82f6; }

        .toast-content {
          padding: 16px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          flex: 1;
        }

        .toast-icon { flex-shrink: 0; }
        .toast-icon.success { color: #10b981; }
        .toast-icon.error { color: #ef4444; }
        .toast-icon.warning { color: #f59e0b; }
        .toast-icon.info { color: #3b82f6; }

        .toast-message {
          flex: 1;
          margin: 0;
          font-size: 14px;
          color: #1f2937;
          line-height: 1.4;
        }

        .toast-close {
          background: transparent;
          border: none;
          color: #9ca3af;
          cursor: pointer;
          padding: 0;
          margin-left: -4px;
          margin-top: -2px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s;
        }
        .toast-close:hover { color: #4b5563; }

        .toast-progress {
          position: absolute;
          bottom: 0;
          left: 4px;
          right: 0;
          height: 3px;
          transform-origin: left;
        }
        
        .toast-progress-bar {
          height: 100%;
          width: 100%;
          transition: width linear;
        }
        .toast-progress-bar.success { background-color: #10b981; }
        .toast-progress-bar.error { background-color: #ef4444; }
        .toast-progress-bar.warning { background-color: #f59e0b; }
        .toast-progress-bar.info { background-color: #3b82f6; }

        .confirm-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(4px);
          z-index: 100000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }

        .confirm-card {
          background: #ffffff;
          border-radius: 16px;
          padding: 24px;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          animation: popIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        @keyframes popIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        .confirm-message {
          margin: 0 0 24px 0;
          font-size: 16px;
          color: #1f2937;
          line-height: 1.5;
          text-align: center;
        }

        .confirm-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        .confirm-btn {
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .cancel-btn {
          background: transparent;
          color: #4b5563;
        }
        .cancel-btn:hover {
          background: #f3f4f6;
        }

        .confirm-btn-danger {
          background: #ef4444;
          color: white;
        }
        .confirm-btn-danger:hover {
          background: #dc2626;
        }
      `}</style>
    </NotificationContext.Provider>
  );
};

const ToastItem = ({ toast, onClose }) => {
  const { type, message, duration } = toast;
  const [isExiting, setIsExiting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [remaining, setRemaining] = useState(duration);
  const startTimeRef = useRef(Date.now());
  const timerRef = useRef(null);
  
  const Icon = {
    success: CheckCircle2,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
  }[type] || Info;

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(onClose, 200);
  }, [onClose]);

  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }
    
    startTimeRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      handleClose();
    }, remaining);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setRemaining(prev => Math.max(0, prev - (Date.now() - startTimeRef.current)));
    };
  }, [isPaused, remaining, handleClose]);

  return (
    <div 
      className={`toast-item ${isExiting ? 'exiting' : ''} ${isPaused ? 'paused' : ''}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      style={{ position: 'relative' }}
    >
      <div className={`toast-border ${type}`}></div>
      <div className="toast-content" style={{ paddingRight: '40px' }}>
        <Icon className={`toast-icon ${type}`} size={20} />
        <p className="toast-message" style={{ paddingRight: '1rem' }}>{message}</p>
        
        <div className="toast-actions" style={{ 
          position: 'absolute', 
          right: '12px', 
          display: 'flex', 
          gap: '8px', 
          opacity: isPaused ? 1 : 0, 
          transform: isPaused ? 'translateY(0)' : 'translateY(5px)',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          pointerEvents: isPaused ? 'auto' : 'none'
        }}>
          <button 
            className="toast-control-btn" 
            onClick={(e) => { e.stopPropagation(); setIsPaused(!isPaused); }}
            style={{
              background: 'rgba(0,0,0,0.05)', border: 'none', borderRadius: '50%',
              width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#64748b', transition: 'all 0.2s'
            }}
            onMouseOver={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.1)'; e.currentTarget.style.color = '#0f172a'; }}
            onMouseOut={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.05)'; e.currentTarget.style.color = '#64748b'; }}
            title={isPaused ? "Reprendre" : "Mettre en pause"}
          >
            {isPaused ? <Play size={14} fill="currentColor" /> : <Pause size={14} fill="currentColor" />}
          </button>
          <button 
            className="toast-control-btn" 
            onClick={handleClose}
            style={{
              background: 'rgba(0,0,0,0.05)', border: 'none', borderRadius: '50%',
              width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#64748b', transition: 'all 0.2s'
            }}
            onMouseOver={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.color = '#ef4444'; }}
            onMouseOut={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.05)'; e.currentTarget.style.color = '#64748b'; }}
          >
            <X size={16} />
          </button>
        </div>
      </div>
      <div className="toast-progress">
        <div 
          className={`toast-progress-bar ${type}`} 
          style={{ 
            width: isPaused ? `${(remaining / duration) * 100}%` : '0%',
            transitionDuration: isPaused ? '0ms' : `${remaining}ms`,
            transitionTimingFunction: 'linear'
          }}
        ></div>
      </div>
    </div>
  );
};
