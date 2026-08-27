import { describe, it, expect } from 'vitest';
import { compactDossier, parseJSONResponse } from './ai';
import { escapeHtml } from './html';

describe('AI utils: compactDossier', () => {
  it('should remove empty fields and sections', () => {
    const input = {
      'etat-civil': { nom: 'Doe', age: '', prenom: 'John', sexe: null },
      'motif': { texte: '' },
      'conclusion': undefined
    };
    const expected = {
      'etat-civil': { nom: 'Doe', prenom: 'John' }
    };
    expect(compactDossier(input)).toEqual(expected);
  });

  it('should handle null/undefined input', () => {
    expect(compactDossier(null)).toEqual({});
    expect(compactDossier(undefined)).toEqual({});
  });
});

describe('AI utils: parseJSONResponse', () => {
  it('should extract JSON from markdown wrapping', () => {
    const content = `Voici le JSON:\n\`\`\`json\n{"valeurs": [{"nom": "Hb"}]}\n\`\`\``;
    const parsed = parseJSONResponse(content);
    expect(parsed).toEqual({ valeurs: [{ nom: 'Hb' }] });
  });

  it('should throw an error if no JSON is found', () => {
    const content = `Ce texte ne contient pas de données structurées.`;
    expect(() => parseJSONResponse(content)).toThrow("Réponse IA illisible.");
  });
});

describe('HTML utils: escapeHtml', () => {
  it('should escape malicious HTML tags', () => {
    const input = `<script>alert("XSS")</script>`;
    expect(escapeHtml(input)).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
  });

  it('should handle null, undefined and numbers', () => {
    expect(escapeHtml(null)).toBe('');
    expect(escapeHtml(undefined)).toBe('');
    expect(escapeHtml(123)).toBe('123');
  });
});
