import React, { useState, useEffect } from 'react';
import { History, RotateCcw, Clock, X, AlertTriangle } from 'lucide-react';

const SECTION_LABELS = {
  'etat-civil': 'État civil', 'motif': 'Motif', 'histoire': 'Histoire',
  'antecedents': 'Antécédents', 'examen-general': 'Ex. Général',
  'resume': 'Résumé', 'hypotheses': 'Hypothèses', 'bilan': 'Bilan',
  'diagnostic': 'Diagnostic', 'traitement': 'Traitement',
  'evolution': 'Évolution', 'conclusion': 'Conclusion',
};

// Utility function to save snapshot
export function saveVersionSnapshot(patientId, formData, prevData) {
  if (!patientId || !formData) return;

  const sectionsModified = [];
  if (prevData) {
    Object.keys(formData).forEach(key => {
      if (JSON.stringify(formData[key]) !== JSON.stringify(prevData[key])) {
        sectionsModified.push(key);
      }
    });
    if (sectionsModified.length === 0) return; // No changes
  } else {
    // If no prevData, it's the first save, mark all non-empty sections
    Object.keys(formData).forEach(key => {
        if (formData[key] && Object.keys(formData[key]).length > 0) {
            sectionsModified.push(key);
        }
    });
  }

  const historyKey = `obsmed-history-${patientId}`;
  let history = [];
  try {
    const saved = localStorage.getItem(historyKey);
    if (saved) {
      history = JSON.parse(saved);
    }
  } catch (e) {
    console.error("Failed to parse history", e);
  }

  const newSnapshot = {
    timestamp: new Date().toISOString(),
    data: formData,
    sectionsModified
  };

  history.unshift(newSnapshot);
  if (history.length > 20) {
    history = history.slice(0, 20);
  }

  localStorage.setItem(historyKey, JSON.stringify(history));
}

function formatRelativeTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now - date;
  const diffInMins = Math.floor(diffInMs / 60000);
  const diffInHours = Math.floor(diffInMins / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMins < 1) return "À l'instant";
  if (diffInMins < 60) return `Il y a ${diffInMins} min`;
  if (diffInHours < 24) {
      if (now.getDate() === date.getDate()) {
          return `Aujourd'hui à ${date.toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}`;
      } else {
          return `Hier à ${date.toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}`;
      }
  }
  if (diffInDays === 1) return `Hier à ${date.toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}`;
  
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit' });
}

export default React.memo(function VersionHistory({ patientId, currentData, onRestore, onClose }) {
  const [history, setHistory] = useState([]);
  const [confirmRestore, setConfirmRestore] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Read history
    if (patientId) {
      try {
        const saved = localStorage.getItem(`obsmed-history-${patientId}`);
        if (saved) {
          setHistory(JSON.parse(saved));
        }
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
    
    // Slide in animation
    requestAnimationFrame(() => setIsVisible(true));
  }, [patientId]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // wait for animation
  };

  const handleRestoreClick = (version) => {
    setConfirmRestore(version);
  };

  const confirmAction = () => {
    if (confirmRestore) {
      onRestore(confirmRestore.data);
      setConfirmRestore(null);
      handleClose();
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .history-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(4px);
          z-index: 1000;
          opacity: 0;
          transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .history-backdrop.visible {
          opacity: 1;
        }
        .history-panel {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: 420px;
          background: rgba(248, 250, 252, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          box-shadow: -8px 0 32px rgba(15, 23, 42, 0.1);
          z-index: 1001;
          display: flex;
          flex-direction: column;
          transform: translateX(100%);
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          border-left: 1px solid rgba(255,255,255,0.5);
        }
        @media (max-width: 768px) {
          .history-panel {
            width: 100%;
          }
        }
        .history-panel.visible {
          transform: translateX(0);
        }
        .history-header {
          padding: 24px;
          border-bottom: 1px solid rgba(148, 163, 184, 0.2);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(255,255,255,0.5);
        }
        .history-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #0f172a;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .close-button {
          background: none;
          border: none;
          padding: 8px;
          border-radius: 50%;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .close-button:hover {
          background: rgba(148, 163, 184, 0.1);
          color: #0f172a;
        }
        .history-content {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          position: relative;
        }
        .timeline-line {
          position: absolute;
          left: 41px;
          top: 24px;
          bottom: 24px;
          width: 2px;
          background: rgba(148, 163, 184, 0.3);
          border-radius: 2px;
        }
        .version-item {
          position: relative;
          padding-left: 48px;
          margin-bottom: 32px;
        }
        .version-item:last-child {
          margin-bottom: 0;
        }
        .timeline-dot {
          position: absolute;
          left: 17px;
          top: 6px;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: white;
          border: 2px solid var(--primary, #3b82f6);
          box-shadow: 0 0 0 4px rgba(248, 250, 252, 0.85);
          z-index: 2;
        }
        .version-card {
          background: white;
          border-radius: 16px;
          padding: 16px;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.03);
          border: 1px solid rgba(148, 163, 184, 0.1);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .version-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
        }
        .version-card.current {
          border-color: var(--primary, #3b82f6);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
        }
        .version-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .version-time {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.875rem;
          color: #64748b;
          font-weight: 500;
        }
        .current-badge {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--primary, #3b82f6);
          background: rgba(59, 130, 246, 0.1);
          padding: 4px 8px;
          border-radius: 12px;
        }
        .version-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 16px;
        }
        .section-tag {
          font-size: 0.75rem;
          font-weight: 500;
          color: #475569;
          background: #f1f5f9;
          padding: 4px 10px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }
        .restore-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          color: #0f172a;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .restore-btn:hover {
          background: #f8fafc;
          border-color: var(--primary, #3b82f6);
          color: var(--primary, #3b82f6);
        }
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          height: 100%;
          color: #64748b;
          padding: 32px;
        }
        .empty-icon {
          margin-bottom: 16px;
          opacity: 0.5;
        }
        
        /* Confirmation Dialog */
        .confirm-dialog {
          position: absolute;
          inset: 0;
          background: rgba(255,255,255,0.9);
          backdrop-filter: blur(4px);
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px;
          text-align: center;
          border-radius: 16px;
          opacity: 0;
          animation: fadeIn 0.2s forwards;
        }
        @keyframes fadeIn {
          to { opacity: 1; }
        }
        .confirm-icon {
          color: #f59e0b;
          margin-bottom: 16px;
        }
        .confirm-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 8px;
        }
        .confirm-text {
          font-size: 0.875rem;
          color: #64748b;
          margin-bottom: 24px;
        }
        .confirm-actions {
          display: flex;
          gap: 12px;
          width: 100%;
        }
        .btn-cancel, .btn-confirm {
          flex: 1;
          padding: 10px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-cancel {
          background: white;
          border: 1px solid #e2e8f0;
          color: #475569;
        }
        .btn-cancel:hover {
          background: #f1f5f9;
        }
        .btn-confirm {
          background: var(--primary, #3b82f6);
          border: 1px solid var(--primary, #3b82f6);
          color: white;
        }
        .btn-confirm:hover {
          filter: brightness(1.1);
        }
      `}} />

      <div className={`history-backdrop ${isVisible ? 'visible' : ''}`} onClick={handleClose}></div>
      
      <div className={`history-panel ${isVisible ? 'visible' : ''}`}>
        <div className="history-header">
          <div className="history-title">
            <History size={24} color="var(--primary, #3b82f6)" />
            Historique des versions
          </div>
          <button className="close-button" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        <div className="history-content">
          {history.length > 0 && <div className="timeline-line" />}
          
          {history.length === 0 ? (
            <div className="empty-state">
              <History size={48} className="empty-icon" />
              <p>Aucun historique disponible pour ce patient.</p>
            </div>
          ) : (
            history.map((version, index) => {
              const isCurrent = index === 0;
              return (
                <div key={version.timestamp} className="version-item">
                  <div className="timeline-dot" style={{ borderColor: isCurrent ? 'var(--primary, #3b82f6)' : '#cbd5e1' }} />
                  
                  <div className={`version-card ${isCurrent ? 'current' : ''}`}>
                    <div className="version-header">
                      <div className="version-time">
                        <Clock size={14} />
                        {formatRelativeTime(version.timestamp)}
                      </div>
                      {isCurrent && <span className="current-badge">Version actuelle</span>}
                    </div>

                    {version.sectionsModified && version.sectionsModified.length > 0 && (
                      <div className="version-tags">
                        {version.sectionsModified.map(section => (
                          <span key={section} className="section-tag">
                            {SECTION_LABELS[section] || section}
                          </span>
                        ))}
                      </div>
                    )}

                    {!isCurrent && (
                      <button 
                        className="restore-btn"
                        onClick={() => handleRestoreClick(version)}
                      >
                        <RotateCcw size={16} />
                        Restaurer
                      </button>
                    )}

                    {confirmRestore === version && (
                      <div className="confirm-dialog">
                        <AlertTriangle size={32} className="confirm-icon" />
                        <div className="confirm-title">Restaurer la version ?</div>
                        <div className="confirm-text">
                          Les modifications non sauvegardées seront perdues.
                        </div>
                        <div className="confirm-actions">
                          <button className="btn-cancel" onClick={() => setConfirmRestore(null)}>Annuler</button>
                          <button className="btn-confirm" onClick={confirmAction}>Confirmer</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
});
