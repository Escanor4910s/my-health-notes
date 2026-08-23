import React, { useMemo, useState, useEffect } from 'react';
import { Database, Calendar, Target, TrendingUp, X, BarChart2, PieChart, Activity, Info } from 'lucide-react';

const SECTION_LABELS = {
  'etat-civil': 'État civil',
  'motif': 'Motif de consultation',
  'histoire': 'Histoire de la maladie',
  'antecedents': 'Antécédents',
  'examen-general': 'Examen général',
  'examen-pleuro': 'Pleuro-pulmonaire',
  'examen-cardio': 'Cardio-vasculaire',
  'examen-digestif': 'Digestif',
  'examen-neuro': 'Neurologique',
  'examen-uro': 'Uro-néphrologique',
  'examen-locomoteur': 'Locomoteur',
  'examen-dermato': 'Dermatologique',
  'examen-orl': 'ORL',
  'examen-gyneco': 'Gynécologique',
  'resume': 'Résumé syndromique',
  'hypotheses': 'Hypothèses',
  'bilan': 'Bilan paraclinique',
  'diagnostic': 'Diagnostics',
  'traitement': 'Traitement',
  'evolution': 'Évolution',
  'conclusion': 'Conclusion',
};

const DEFAULT_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

const StatsPanel = ({ patients = [], onClose }) => {
  const [mounted, setMounted] = useState(false);
  const [hoveredWeek, setHoveredWeek] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Total
    const total = patients.length;
    
    // Cette Semaine (last 7 days)
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);
    const thisWeek = patients.filter(p => new Date(p.date) >= sevenDaysAgo).length;
    
    // 14 days ago for insight comparison
    const fourteenDaysAgo = new Date(now);
    fourteenDaysAgo.setDate(now.getDate() - 14);
    const lastWeek = patients.filter(p => {
      const d = new Date(p.date);
      return d >= fourteenDaysAgo && d < sevenDaysAgo;
    }).length;

    const percentChange = lastWeek === 0 ? (thisWeek > 0 ? 100 : 0) : Math.round(((thisWeek - lastWeek) / lastWeek) * 100);

    // Completion
    let totalSectionsFilled = 0;
    const totalPossibleSections = Object.keys(SECTION_LABELS).length;
    const sectionCounts = {};
    Object.keys(SECTION_LABELS).forEach(key => sectionCounts[key] = 0);
    
    const templateCounts = {};

    // Weekly activity (8 weeks)
    const weeklyData = Array.from({ length: 8 }, (_, i) => ({
      label: i === 7 ? 'Actuelle' : `S-${7-i}`,
      count: 0
    }));

    // Streak
    const dates = patients.map(p => {
      const d = new Date(p.date);
      return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    }).sort((a, b) => b - a);
    
    const uniqueDates = [...new Set(dates)];
    let streak = 0;
    let currentDate = today.getTime();
    
    if (uniqueDates.includes(currentDate) || uniqueDates.includes(currentDate - 86400000)) {
      let checkDate = uniqueDates.includes(currentDate) ? currentDate : currentDate - 86400000;
      for (const d of uniqueDates) {
        if (d === checkDate) {
          streak++;
          checkDate -= 86400000;
        } else if (d < checkDate) {
          break;
        }
      }
    }

    patients.forEach(p => {
      // Completion
      const pData = p.data || {};
      let filled = 0;
      Object.keys(SECTION_LABELS).forEach(key => {
        const val = pData[key];
        const hasContent = val && (typeof val === 'string' ? val.trim() !== '' : Object.keys(val).length > 0);
        if (hasContent) {
          filled++;
          sectionCounts[key]++;
        }
      });
      totalSectionsFilled += (filled / totalPossibleSections);

      // Template
      const tName = (pData._template && pData._template.name) ? pData._template.name : 'Observation Vierge';
      templateCounts[tName] = (templateCounts[tName] || 0) + 1;

      // Weekly
      const pDate = new Date(p.date);
      const diffTime = Math.abs(now - pDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const weekIndex = 7 - Math.floor(diffDays / 7);
      if (weekIndex >= 0 && weekIndex < 8) {
        weeklyData[weekIndex].count++;
      }
    });

    const avgCompletion = total === 0 ? 0 : Math.round((totalSectionsFilled / total) * 100);

    const sortedSections = Object.entries(sectionCounts)
      .map(([id, count]) => ({ id, label: SECTION_LABELS[id], count, percent: total === 0 ? 0 : (count / total) * 100 }))
      .sort((a, b) => b.percent - a.percent);
      
    const leastFilledSection = sortedSections.length > 0 ? sortedSections[sortedSections.length - 1] : null;

    // Donut logic
    let currentAngle = 0;
    const donutData = Object.entries(templateCounts).map(([name, count], idx) => {
      const percentage = count / total;
      const angle = percentage * 360;
      const startAngle = currentAngle;
      currentAngle += angle;
      const color = DEFAULT_COLORS[idx % DEFAULT_COLORS.length];
      return { name, count, percentage, startAngle, endAngle: currentAngle, color };
    });

    return {
      total,
      thisWeek,
      lastWeek,
      percentChange,
      avgCompletion,
      streak,
      weeklyData,
      donutData,
      sortedSections,
      leastFilledSection
    };
  }, [patients]);

  const maxWeeklyCount = Math.max(1, ...stats.weeklyData.map(d => d.count));

  // SVG Donut path generator
  const getDonutPath = (startAngle, endAngle, cx = 100, cy = 100, r1 = 80, r2 = 50) => {
    const toRad = (angle) => (angle - 90) * Math.PI / 180;
    if (endAngle - startAngle >= 360) {
      return `M ${cx} ${cy - r1} A ${r1} ${r1} 0 1 1 ${cx} ${cy + r1} A ${r1} ${r1} 0 1 1 ${cx} ${cy - r1} M ${cx} ${cy - r2} A ${r2} ${r2} 0 1 0 ${cx} ${cy + r2} A ${r2} ${r2} 0 1 0 ${cx} ${cy - r2}`;
    }
    const x1 = cx + r1 * Math.cos(toRad(startAngle));
    const y1 = cy + r1 * Math.sin(toRad(startAngle));
    const x2 = cx + r1 * Math.cos(toRad(endAngle));
    const y2 = cy + r1 * Math.sin(toRad(endAngle));
    const x3 = cx + r2 * Math.cos(toRad(endAngle));
    const y3 = cy + r2 * Math.sin(toRad(endAngle));
    const x4 = cx + r2 * Math.cos(toRad(startAngle));
    const y4 = cy + r2 * Math.sin(toRad(startAngle));
    
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
    
    return `M ${x1} ${y1} A ${r1} ${r1} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${x3} ${y3} A ${r2} ${r2} 0 ${largeArcFlag} 0 ${x4} ${y4} Z`;
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .stats-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(8px);
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          opacity: 0;
          animation: statsFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        
        .stats-panel {
          background: #ffffff;
          border-radius: 24px;
          width: 100%;
          max-width: 900px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 40px -10px rgba(0,0,0,0.1), 0 10px 20px -5px rgba(0,0,0,0.05);
          transform: translateY(20px) scale(0.98);
          animation: statsSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          display: flex;
          flex-direction: column;
        }
        
        .stats-header {
          padding: 2rem;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          position: sticky;
          top: 0;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(12px);
          z-index: 10;
          border-radius: 24px 24px 0 0;
        }
        
        .stats-content {
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        
        .stats-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }
        
        .stat-card {
          background: #f8fafc;
          border-radius: 16px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          border: 1px solid #e2e8f0;
          opacity: 0;
          transform: translateY(10px);
          animation: statsFadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        
        .stat-card:nth-child(1) { animation-delay: 0.1s; }
        .stat-card:nth-child(2) { animation-delay: 0.15s; }
        .stat-card:nth-child(3) { animation-delay: 0.2s; }
        .stat-card:nth-child(4) { animation-delay: 0.25s; }
        
        .stat-card-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: rgba(59, 130, 246, 0.1);
          color: var(--primary, #3b82f6);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .charts-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }
        
        @media (max-width: 768px) {
          .charts-grid {
            grid-template-columns: 1fr;
          }
        }
        
        .chart-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
        }
        
        .bar-chart-container {
          position: relative;
          height: 200px;
          width: 100%;
          margin-top: 1rem;
        }
        
        .weekly-bar {
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .weekly-bar:hover {
          opacity: 0.8;
        }
        
        .tooltip {
          position: absolute;
          background: #0f172a;
          color: white;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 0.75rem;
          pointer-events: none;
          transform: translate(-50%, -100%);
          white-space: nowrap;
          z-index: 10;
        }
        
        .section-bar-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 0.75rem;
        }
        
        .section-bar-label {
          width: 120px;
          font-size: 0.875rem;
          color: #64748b;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .section-bar-track {
          flex: 1;
          height: 8px;
          background: #f1f5f9;
          border-radius: 4px;
          overflow: hidden;
        }
        
        .section-bar-fill {
          height: 100%;
          background: var(--primary, #3b82f6);
          border-radius: 4px;
          transition: width 1s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .insights-section {
          background: linear-gradient(to right, rgba(59, 130, 246, 0.05), rgba(59, 130, 246, 0.1));
          border-radius: 16px;
          padding: 1.5rem;
          border: 1px solid rgba(59, 130, 246, 0.2);
        }

        .close-button {
          background: #f1f5f9;
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s;
        }
        .close-button:hover {
          background: #e2e8f0;
          color: #0f172a;
        }
        
        @keyframes statsFadeIn { to { opacity: 1; } }
        @keyframes statsSlideUp { to { transform: translateY(0) scale(1); } }
        @keyframes statsFadeUp { to { opacity: 1; transform: translateY(0); } }
      `}} />
      
      <div className="stats-overlay" onClick={(e) => { if (e.target.className === 'stats-overlay') onClose(); }}>
        <div className="stats-panel">
          <div className="stats-header">
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>Mes Statistiques</h2>
              <p style={{ color: '#64748b', margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>Aperçu de votre activité clinique</p>
            </div>
            <button className="close-button" onClick={onClose}><X size={20} /></button>
          </div>
          
          <div className="stats-content">
            {/* Stat Cards */}
            <div className="stats-cards-grid">
              <div className="stat-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div className="stat-card-icon"><Database size={20} /></div>
                </div>
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: '#0f172a' }}>{stats.total}</div>
                  <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: '500' }}>Total Dossiers</div>
                </div>
              </div>
              
              <div className="stat-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div className="stat-card-icon"><Calendar size={20} /></div>
                  {stats.percentChange !== 0 && (
                    <div style={{ 
                      padding: '4px 8px', 
                      borderRadius: '12px', 
                      fontSize: '0.75rem', 
                      fontWeight: '600',
                      background: stats.percentChange > 0 ? '#dcfce7' : '#fee2e2',
                      color: stats.percentChange > 0 ? '#166534' : '#991b1b'
                    }}>
                      {stats.percentChange > 0 ? '+' : ''}{stats.percentChange}%
                    </div>
                  )}
                </div>
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: '#0f172a' }}>{stats.thisWeek}</div>
                  <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: '500' }}>Cette Semaine</div>
                </div>
              </div>
              
              <div className="stat-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div className="stat-card-icon"><Target size={20} /></div>
                </div>
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: '#0f172a' }}>{stats.avgCompletion}%</div>
                  <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: '500' }}>Complétion Moyenne</div>
                </div>
              </div>
              
              <div className="stat-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div className="stat-card-icon"><TrendingUp size={20} /></div>
                  {stats.streak > 3 && <div style={{ fontSize: '1.25rem' }}>🔥</div>}
                </div>
                <div>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: '#0f172a' }}>{stats.streak} {stats.streak <= 1 ? 'jour' : 'jours'}</div>
                  <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: '500' }}>Série Active</div>
                </div>
              </div>
            </div>
            
            {/* Charts Grid */}
            <div className="charts-grid">
              {/* Histogramme */}
              <div className="chart-card">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1rem 0', fontSize: '1.1rem', color: '#0f172a' }}>
                  <Activity size={18} color="var(--primary, #3b82f6)" /> Activité hebdomadaire
                </h3>
                <div className="bar-chart-container">
                  <svg width="100%" height="100%" viewBox="0 0 400 200" preserveAspectRatio="none">
                    {/* Grid lines */}
                    {[0, 1, 2, 3].map(i => (
                      <line key={i} x1="0" y1={i * 50} x2="400" y2={i * 50} stroke="#f1f5f9" strokeWidth="1" />
                    ))}
                    {/* Bars */}
                    {stats.weeklyData.map((d, i) => {
                      const barWidth = 32;
                      const spacing = (400 - (8 * barWidth)) / 9;
                      const x = spacing + i * (barWidth + spacing);
                      const height = maxWeeklyCount === 0 ? 0 : (d.count / maxWeeklyCount) * 160;
                      const y = 170 - height;
                      return (
                        <g key={i} 
                           onMouseEnter={() => setHoveredWeek({ ...d, x, y })}
                           onMouseLeave={() => setHoveredWeek(null)}>
                          {mounted && (
                            <rect 
                              className="weekly-bar"
                              x={x} 
                              y={y} 
                              width={barWidth} 
                              height={height} 
                              fill="var(--primary, #3b82f6)" 
                              rx="6" 
                              ry="6"
                              style={{ 
                                animation: `statsFadeUp 0.5s ${i * 0.05}s cubic-bezier(0.16, 1, 0.3, 1) both`
                              }}
                            />
                          )}
                          <text x={x + barWidth/2} y="190" textAnchor="middle" fill="#64748b" fontSize="12">{d.label}</text>
                        </g>
                      );
                    })}
                  </svg>
                  {hoveredWeek && (
                    <div className="tooltip" style={{ left: `${(hoveredWeek.x / 400) * 100}%`, top: `${(hoveredWeek.y / 200) * 100}%`, marginTop: '-10px' }}>
                      {hoveredWeek.count} dossiers
                    </div>
                  )}
                </div>
              </div>

              {/* Donut Chart */}
              <div className="chart-card">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1rem 0', fontSize: '1.1rem', color: '#0f172a' }}>
                  <PieChart size={18} color="var(--primary, #3b82f6)" /> Répartition par modèle
                </h3>
                <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', gap: '2rem' }}>
                  <svg width="180" height="180" viewBox="0 0 200 200">
                    {stats.donutData.length === 0 ? (
                      <circle cx="100" cy="100" r="70" fill="none" stroke="#f1f5f9" strokeWidth="20" />
                    ) : (
                      mounted && stats.donutData.map((d, i) => (
                        <path 
                          key={i} 
                          d={getDonutPath(d.startAngle, d.endAngle)} 
                          fill={d.color} 
                          style={{
                            animation: `statsFadeIn 0.8s ${i * 0.1}s cubic-bezier(0.16, 1, 0.3, 1) both`
                          }}
                        />
                      ))
                    )}
                  </svg>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {stats.donutData.map((d, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: d.color }}></div>
                        <div style={{ fontSize: '0.875rem', color: '#0f172a' }}>{d.name} <span style={{ color: '#64748b' }}>({Math.round(d.percentage * 100)}%)</span></div>
                      </div>
                    ))}
                    {stats.donutData.length === 0 && (
                      <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Aucune donnée</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Sections */}
            <div className="chart-card">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1.5rem 0', fontSize: '1.1rem', color: '#0f172a' }}>
                <BarChart2 size={18} color="var(--primary, #3b82f6)" /> Sections les plus remplies
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '250px', overflowY: 'auto', paddingRight: '1rem' }}>
                {stats.sortedSections.slice(0, 10).map((sec, i) => (
                  <div key={sec.id} className="section-bar-row">
                    <div className="section-bar-label" title={sec.label}>{sec.label}</div>
                    <div className="section-bar-track">
                      <div className="section-bar-fill" style={{ width: mounted ? `${sec.percent}%` : '0%' }}></div>
                    </div>
                    <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#0f172a', width: '40px', textAlign: 'right' }}>
                      {Math.round(sec.percent)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Insights */}
            <div className="insights-section">
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1rem 0', color: 'var(--primary, #3b82f6)' }}>
                <Info size={18} /> Insights automatiques
              </h4>
              <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#0f172a', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.95rem' }}>
                {stats.percentChange !== 0 ? (
                  <li>Activité: <strong>{stats.percentChange > 0 ? '+' : ''}{stats.percentChange}%</strong> cette semaine par rapport à la semaine dernière.</li>
                ) : (
                  <li>Activité stable par rapport à la semaine dernière.</li>
                )}
                {stats.leastFilledSection && stats.leastFilledSection.percent < 50 && (
                  <li>La section <strong>{stats.leastFilledSection.label}</strong> est souvent laissée vide ({Math.round(stats.leastFilledSection.percent)}% de remplissage).</li>
                )}
                {stats.streak >= 3 && (
                  <li>Vous êtes sur une belle série de <strong>{stats.streak} jours consécutifs</strong>. Continuez comme ça! 🔥</li>
                )}
                {stats.avgCompletion > 80 && (
                  <li>Vos dossiers sont très complets avec <strong>{stats.avgCompletion}%</strong> de complétion moyenne.</li>
                )}
              </ul>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default React.memo(StatsPanel);
