import React, { useState, useRef } from 'react';
import { Camera, Upload, Loader2, X, Check } from 'lucide-react';
import Tesseract from 'tesseract.js';
import { askAI, parseJSONResponse } from '../../lib/ai';


export default function OCRScanner({ onScanComplete }) {
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsScanning(true);
    setProgress(0);
    setError('');

    try {
      const worker = await Tesseract.createWorker({
        logger: m => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        }
      });
      await worker.loadLanguage('fra+eng');
      await worker.initialize('fra+eng');
      const { data: { text } } = await worker.recognize(file);
      await worker.terminate();

      // Extraction intelligente par IA, avec repli sur les heuristiques locales
      try {
        setAiStep(true);
        const content = await askAI('ocr', { texte: text });
        const parsed = parseJSONResponse(content);
        const results = {};
        for (const v of parsed.valeurs || []) {
          if (v?.cle && v?.valeur !== undefined) results[v.cle] = String(v.valeur);
        }
        if (Object.keys(results).length) {
          onScanComplete(results, text, parsed.synthese || '');
        } else {
          parseAndReturn(text);
        }
      } catch (aiErr) {
        console.warn('Extraction IA indisponible, repli local', aiErr);
        parseAndReturn(text);
      } finally {
        setAiStep(false);
      }
    } catch (err) {
      setError('Erreur lors du scan du document.');
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  const parseAndReturn = (text) => {
    // Basic extraction heuristics
    const results = {};
    const lowerText = text.toLowerCase();
    
    const extractVal = (keywords) => {
      for (const kw of keywords) {
        const regex = new RegExp(kw + '\\s*[:=]?\\s*(\\d+[.,]?\\d*)', 'i');
        const match = lowerText.match(regex);
        if (match) return match[1].replace(',', '.');
      }
      return '';
    };

    results.hemoglobine = extractVal(['hémoglobine', 'hb', 'hemoglobin']);
    results.leucocytes = extractVal(['leucocytes', 'globules blancs', 'gb', 'wbc']);
    results.plaquettes = extractVal(['plaquettes', 'plt', 'platelets']);
    results.creatinine = extractVal(['créatinine', 'creatininemie', 'creat']);
    results.glycemie = extractVal(['glycémie', 'glucose', 'glycemie a jeun']);
    results.crp = extractVal(['crp', 'protéine c réactive']);

    onScanComplete(results, text);
  };

  return (
    <div style={{ background: 'var(--surface-border)', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      <h4 style={{ margin: 0, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Camera size={20} />
        Scanner un Bilan Biologique (OCR)
      </h4>
      <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center' }}>
        Prenez en photo une feuille d'analyses. L'IA lira les valeurs principales (Hb, Plaquettes, CRP...) et pré-remplira les champs.
      </p>

      {isScanning ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <Loader2 className="animate-spin" size={32} color="var(--primary)" />
          <span style={{ fontWeight: 'bold' }}>Analyse en cours... {progress}%</span>
        </div>
      ) : (
        <>
          <input 
            type="file" 
            accept="image/*" 
            capture="environment" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            style={{ display: 'none' }} 
          />
          <button 
            className="btn btn-primary" 
            onClick={() => fileInputRef.current.click()}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Upload size={18} /> Sélectionner / Photographier
          </button>
        </>
      )}

      {error && <span style={{ color: 'var(--danger)', fontSize: '0.9rem' }}>{error}</span>}
    </div>
  );
}

