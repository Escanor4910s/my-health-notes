import React, { useMemo, useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';

export default function CompletenessAlert({ formData, navigateTo }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const alerts = useMemo(() => {
    const issues = [];

    // 1. Check critical missing data
    if (!formData['etat-civil']?.age || !formData['etat-civil']?.sexe) {
      issues.push({ section: 'etat-civil', message: "L'âge et le sexe (État civil) sont obligatoires." });
    }
    if (!formData['motif']?.motif) {
      issues.push({ section: 'motif', message: "Le motif de consultation principal n'est pas renseigné." });
    }

    // 2. Clinical inconsistencies
    const temp = parseFloat(formData['examen-general']?.temperature);
    if (temp > 38) {
      const motifText = String(formData['motif']?.motif || '').toLowerCase();
      if (!motifText.includes('fièvre') && !motifText.includes('fievre') && !motifText.includes('hyperthermie')) {
        issues.push({ section: 'motif', message: `Température à ${temp}°C mais 'fièvre' non mentionnée dans le motif.` });
      }
    }

    // 3. Workflow logic
    const hasDiagnostic = formData['diagnostic']?.diagnostic_retenu && formData['diagnostic'].diagnostic_retenu.trim() !== '';
    const hasHypotheses = formData['hypotheses']?.hypotheses && formData['hypotheses'].hypotheses.length > 0;
    const hasTraitement = formData['traitement']?.ttt_etiologique || formData['traitement']?.ttt_symptomatique || (formData['traitement']?.medsEtiologique?.length > 0);

    if (hasDiagnostic && !hasHypotheses) {
      issues.push({ section: 'hypotheses', message: "Diagnostic posé, mais aucune hypothèse diagnostique n'a été discutée." });
    }

    if (hasTraitement && !hasDiagnostic) {
      issues.push({ section: 'diagnostic', message: "Un traitement a été prescrit, mais aucun diagnostic n'est retenu." });
    }

    return issues;
  }, [formData]);

  if (alerts.length === 0) return null;

  return (
    <div style={{ marginBottom: '1.5rem', borderRadius: '12px', border: '1px solid #f59e0b', background: '#fffbeb', overflow: 'hidden' }}>
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ 
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
          padding: '0.75rem 1.25rem', background: 'transparent', border: 'none', cursor: 'pointer',
          color: '#d97706', fontWeight: '600'
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertTriangle size={18} />
          {alerts.length} point{alerts.length > 1 ? 's' : ''} d'attention détecté{alerts.length > 1 ? 's' : ''} par l'IA
        </span>
        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {isExpanded && (
        <div style={{ padding: '0 1.25rem 1.25rem 1.25rem' }}>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {alerts.map((alert, idx) => (
              <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.9rem', color: '#92400e' }}>
                <span style={{ marginTop: '2px', color: '#f59e0b' }}>•</span>
                <span style={{ flex: 1 }}>{alert.message}</span>
                {navigateTo && (
                  <button 
                    onClick={() => navigateTo(alert.section)}
                    style={{ 
                      padding: '0.2rem 0.6rem', fontSize: '0.8rem', borderRadius: '4px', 
                      background: '#fde68a', color: '#b45309', border: 'none', cursor: 'pointer' 
                    }}
                  >
                    Corriger
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
