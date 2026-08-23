import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Heart, 
  Brain, 
  Wind, 
  Baby, 
  Activity, 
  Scan, 
  X,
  ChevronRight
} from 'lucide-react';

const TemplateSelector = ({ onSelect, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for exit animation
  };

  const templates = [
    {
      id: 'vierge',
      name: 'Observation Vierge',
      icon: FileText,
      color: '#64748b',
      description: 'Commencez de zéro avec un dossier vide.',
      isDistinct: true,
      defaultData: {
        _template: { id: 'vierge', name: 'Observation Vierge', color: '#64748b' }
      }
    },
    {
      id: 'cardiologie',
      name: 'Cardiologie',
      icon: Heart,
      color: '#ef4444',
      description: 'Douleur thoracique, dyspnée, palpitations...',
      defaultData: {
        _template: { id: 'cardiologie', name: 'Cardiologie', color: '#ef4444' }
      }
    },
    {
      id: 'neurologie',
      name: 'Neurologie',
      icon: Brain,
      color: '#8b5cf6',
      description: 'Céphalées, déficits moteurs, troubles de conscience...',
      defaultData: {
        _template: { id: 'neurologie', name: 'Neurologie', color: '#8b5cf6' }
      }
    },
    {
      id: 'pneumologie',
      name: 'Pneumologie',
      icon: Wind,
      color: '#3b82f6',
      description: 'Toux, dyspnée, hémoptysie...',
      defaultData: {
        _template: { id: 'pneumologie', name: 'Pneumologie', color: '#3b82f6' }
      }
    },
    {
      id: 'pediatrie',
      name: 'Pédiatrie',
      icon: Baby,
      color: '#f59e0b',
      description: 'Adaptée aux nourrissons et enfants.',
      defaultData: {
        _template: { id: 'pediatrie', name: 'Pédiatrie', color: '#f59e0b' }
      }
    },
    {
      id: 'urgences',
      name: 'Urgences',
      icon: Activity,
      color: '#dc2626',
      description: 'Prise en charge rapide et complète.',
      defaultData: {
        _template: { id: 'urgences', name: 'Urgences', color: '#dc2626' }
      }
    },
    {
      id: 'gynecologie',
      name: 'Gynéco-Obstétrique',
      icon: Baby, // Or Heart/Activity depending on exact preference, using Baby as per spec option
      color: '#ec4899',
      description: 'Grossesse, accouchement, pathologies gynécologiques.',
      defaultData: {
        _template: { id: 'gynecologie', name: 'Gynéco-Obstétrique', color: '#ec4899' }
      }
    },
    {
      id: 'chirurgie',
      name: 'Chirurgie',
      icon: Scan,
      color: '#14b8a6',
      description: 'Observation pré/post-opératoire.',
      defaultData: {
        _template: { id: 'chirurgie', name: 'Chirurgie', color: '#14b8a6' }
      }
    }
  ];

  const handleSelect = (template) => {
    setIsVisible(false);
    setTimeout(() => {
      onSelect({
        templateId: template.id,
        name: template.name,
        defaultData: template.defaultData
      });
    }, 300);
  };

  return (
    <div className={`ts-overlay ${isVisible ? 'ts-visible' : ''}`} onClick={handleClose}>
      <div 
        className={`ts-modal ${isVisible ? 'ts-modal-visible' : ''}`} 
        onClick={e => e.stopPropagation()}
      >
        <div className="ts-header">
          <div className="ts-header-title">
            <h2>Nouveau Dossier</h2>
            <p>Choisissez un modèle pour commencer votre observation</p>
          </div>
          <button className="ts-close-btn" onClick={handleClose}>
            <X size={24} />
          </button>
        </div>

        <div className="ts-grid">
          {templates.map((template) => {
            const Icon = template.icon;
            return (
              <div 
                key={template.id}
                className={`ts-card ${template.isDistinct ? 'ts-card-distinct' : ''}`}
                onClick={() => handleSelect(template)}
                style={{ '--hover-color': template.color }}
              >
                <div className="ts-card-icon" style={{ backgroundColor: `${template.color}15`, color: template.color }}>
                  <Icon size={28} />
                </div>
                <div className="ts-card-content">
                  <h3>{template.name}</h3>
                  <p>{template.description}</p>
                </div>
                <div className="ts-card-arrow">
                  <ChevronRight size={20} color={template.color} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .ts-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          opacity: 0;
          transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          padding: 1rem;
        }
        
        .ts-overlay.ts-visible {
          opacity: 1;
        }

        .ts-modal {
          background: rgba(255, 255, 255, 0.95);
          width: 100%;
          max-width: 900px;
          max-height: 90vh;
          border-radius: 24px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          display: flex;
          flex-direction: column;
          transform: translateY(20px) scale(0.98);
          opacity: 0;
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.5);
        }

        .ts-modal.ts-modal-visible {
          transform: translateY(0) scale(1);
          opacity: 1;
        }

        .ts-header {
          padding: 2rem 2rem 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 1px solid #f1f5f9;
          background: white;
        }

        .ts-header-title h2 {
          margin: 0 0 0.5rem;
          font-size: 1.5rem;
          font-weight: 700;
          color: #0f172a;
        }

        .ts-header-title p {
          margin: 0;
          color: #64748b;
          font-size: 0.95rem;
        }

        .ts-close-btn {
          background: #f8fafc;
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .ts-close-btn:hover {
          background: #f1f5f9;
          color: #0f172a;
        }

        .ts-grid {
          padding: 2rem;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.25rem;
          overflow-y: auto;
          background: #f8fafc;
        }

        .ts-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          padding: 1.5rem;
          display: flex;
          align-items: flex-start;
          gap: 1.25rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
        }

        .ts-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.08);
          border-color: var(--hover-color);
        }

        .ts-card-distinct {
          border: 2px dashed #cbd5e1;
          background: #f8fafc;
        }
        
        .ts-card-distinct:hover {
          background: white;
          border-style: solid;
        }

        .ts-card-icon {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .ts-card:hover .ts-card-icon {
          transform: scale(1.1);
        }

        .ts-card-content {
          flex: 1;
        }

        .ts-card-content h3 {
          margin: 0 0 0.5rem;
          font-size: 1.1rem;
          font-weight: 600;
          color: #0f172a;
          transition: color 0.3s ease;
        }

        .ts-card:hover .ts-card-content h3 {
          color: var(--hover-color);
        }

        .ts-card-content p {
          margin: 0;
          color: #64748b;
          font-size: 0.9rem;
          line-height: 1.4;
        }

        .ts-card-arrow {
          opacity: 0;
          transform: translateX(-10px);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          align-self: center;
        }

        .ts-card:hover .ts-card-arrow {
          opacity: 1;
          transform: translateX(0);
        }

        @media (max-width: 768px) {
          .ts-grid {
            grid-template-columns: 1fr;
            padding: 1.5rem;
          }
          
          .ts-header {
            padding: 1.5rem 1.5rem 1rem;
          }
        }
      `}} />
    </div>
  );
};

export default React.memo(TemplateSelector);
