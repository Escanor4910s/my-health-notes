const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/obsmed-ai`;
const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

/**
 * Appelle l'assistant IA d'ObsMed.
 * @param {'synthese'|'apercu'|'hypotheses'|'interpretation'|'export'|'ocr'|'chat'} action
 * @param {{ dossier?: object, texte?: string, messages?: Array<{role:string,content:string}> }} payload
 * @returns {Promise<string>} le contenu (markdown ou JSON selon l'action)
 */
export async function askAI(action, payload = {}) {
  let res;
  try {
    res = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: ANON_KEY,
        Authorization: `Bearer ${ANON_KEY}`,
      },
      body: JSON.stringify({ action, ...payload }),
    });
  } catch {
    throw new Error("Impossible de joindre l'IA. Vérifiez votre connexion internet.");
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Le service IA a renvoyé une erreur.");
  if (!data.content) throw new Error("L'IA n'a renvoyé aucun contenu.");
  return data.content;
}

/** Nettoie le dossier avant envoi : retire les sections vides. */
export function compactDossier(formData) {
  const out = {};
  for (const [section, values] of Object.entries(formData || {})) {
    if (!values || typeof values !== 'object') continue;
    const cleaned = {};
    for (const [k, v] of Object.entries(values)) {
      if (v === '' || v === false || v === null || v === undefined) continue;
      cleaned[k] = v;
    }
    if (Object.keys(cleaned).length) out[section] = cleaned;
  }
  return out;
}

/** Extrait un objet JSON depuis une réponse IA éventuellement entourée de texte. */
export function parseJSONResponse(content) {
  const match = content.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Réponse IA illisible.");
  return JSON.parse(match[0]);
}
