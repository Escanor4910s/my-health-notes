import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ObsMed] Erreur fatale interceptée:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--bg-color, #FAF7F2)', padding: '2rem'
        }}>
          <div style={{
            background: 'var(--surface, #fff)', borderRadius: '24px', padding: '3rem',
            maxWidth: '480px', width: '100%', textAlign: 'center',
            boxShadow: '0 20px 50px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.06)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
            <h2 style={{ margin: '0 0 0.75rem 0', color: 'var(--text-main, #1a1a1a)', fontSize: '1.5rem' }}>
              Une erreur inattendue est survenue
            </h2>
            <p style={{ color: 'var(--text-muted, #666)', fontSize: '1rem', lineHeight: '1.6', margin: '0 0 2rem 0' }}>
              L'application a rencontré un problème. Vos données sont en sécurité dans le stockage local.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: 'var(--primary, #8B6F47)', color: '#fff', border: 'none',
                padding: '1rem 2.5rem', borderRadius: '14px', fontSize: '1.05rem', fontWeight: '600',
                cursor: 'pointer', transition: 'all 0.3s ease',
                boxShadow: '0 8px 20px rgba(0,0,0,0.12)'
              }}
            >
              Recharger l'application
            </button>
            {this.state.error && (
              <details style={{ marginTop: '2rem', textAlign: 'left' }}>
                <summary style={{ cursor: 'pointer', color: 'var(--text-muted, #999)', fontSize: '0.85rem' }}>
                  Détails techniques
                </summary>
                <pre style={{
                  background: 'rgba(0,0,0,0.03)', padding: '1rem', borderRadius: '10px',
                  fontSize: '0.75rem', overflow: 'auto', maxHeight: '200px', marginTop: '0.5rem',
                  color: '#b91c1c', whiteSpace: 'pre-wrap', wordBreak: 'break-word'
                }}>
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
