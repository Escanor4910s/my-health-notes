import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

const GATEWAY = 'https://ai.gateway.lovable.dev/v1/chat/completions'
const MODEL = 'google/gemini-2.5-flash'

const BASE_SYSTEM = `Tu es un assistant médical expert intégré à ObsMed, une application de rédaction d'observations médicales hospitalières (contexte francophone, Afrique de l'Ouest).
Tu rédiges dans un français médical rigoureux, sobre et professionnel.
Tu n'inventes JAMAIS de données cliniques : tu n'utilises que les informations fournies. Si une donnée manque, tu l'indiques comme "non renseigné".
Tes propositions sont une aide à la rédaction et à la réflexion, jamais une décision médicale.`

const PROMPTS: Record<string, string> = {
  synthese: `À partir du dossier JSON fourni, rédige :
1. Un résumé syndromique structuré (identité, motif, ATCD pertinents, synthèse HDM, syndromes retrouvés à l'examen).
2. Le "problème posé" par le patient en une à trois phrases.
Réponds en markdown avec deux titres : "## Résumé" et "## Problème posé".`,
  apercu: `Analyse le dossier JSON et organise les informations pour un aperçu clinique lisible.
Réponds en markdown avec ces sections :
## Synthèse en une phrase
## Éléments clés (liste à puces, regroupés par syndrome)
## Données manquantes ou incohérences (liste à puces, sois précis sur la section concernée)
## Suggestions de pré-remplissage (liste "champ → valeur suggérée", uniquement des déductions sûres : IMC, âge/sexe, calculs, reformulations)`,
  hypotheses: `À partir du dossier JSON, propose 3 à 5 hypothèses diagnostiques classées de la moins à la plus probable.
Pour chacune : arguments POUR (épidémiologiques, cliniques, paracliniques), arguments CONTRE, et examens complémentaires discriminants.
Réponds en markdown structuré.`,
  interpretation: `Interprète les données paracliniques et les constantes du dossier JSON : valeurs anormales, degré de sévérité, orientations. Signale les valeurs critiques en premier. Réponds en markdown concis.`,
  export: `Rédige le contenu d'un rapport d'observation médicale prêt à imprimer, à partir du dossier JSON.
Rends un texte fluide et professionnel, section par section (Identité, Motif, Histoire de la maladie, Antécédents, Examen physique, Résumé syndromique, Hypothèses, Bilan, Diagnostic, Traitement, Conclusion).
Corrige la syntaxe, développe les notes télégraphiques en phrases, sans ajouter d'information nouvelle.
Réponds UNIQUEMENT en markdown (titres ##, paragraphes, listes).`,
  ocr: `Voici le texte brut d'un bilan biologique ou d'un compte rendu obtenu par OCR (il peut contenir des erreurs de reconnaissance).
Extrais les valeurs et rends UNIQUEMENT un objet JSON valide, sans texte autour, de la forme :
{"valeurs":[{"nom":"Hémoglobine","cle":"hemoglobine","valeur":"9.2","unite":"g/dL","anormal":true}],"synthese":"phrase de synthèse"}
Utilise ces clés quand elles s'appliquent : hemoglobine, leucocytes, plaquettes, creatinine, uree, glycemie, crp, natremie, kaliemie, asat, alat. Sinon, une clé en minuscules sans accent.`,
  chat: `Réponds à la question du clinicien en t'appuyant sur le dossier JSON fourni comme contexte. Sois concis, structuré et pédagogique.`,
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const apiKey = Deno.env.get('LOVABLE_API_KEY')
    if (!apiKey) {
      return json({ error: "Service IA non configuré." }, 500)
    }

    const body = await req.json().catch(() => null)
    const action = typeof body?.action === 'string' ? body.action : ''
    if (!PROMPTS[action]) {
      return json({ error: `Action IA inconnue : ${action}` }, 400)
    }

    const dossier = body?.dossier ? JSON.stringify(body.dossier).slice(0, 120000) : ''
    const texte = typeof body?.texte === 'string' ? body.texte.slice(0, 60000) : ''
    const history = Array.isArray(body?.messages) ? body.messages.slice(-12) : []

    const messages: { role: string; content: string }[] = [
      { role: 'system', content: `${BASE_SYSTEM}\n\n${PROMPTS[action]}` },
    ]
    if (dossier) messages.push({ role: 'user', content: `Dossier patient (JSON) :\n${dossier}` })
    if (texte) messages.push({ role: 'user', content: texte })
    for (const m of history) {
      if (m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string') {
        messages.push({ role: m.role, content: m.content.slice(0, 8000) })
      }
    }
    if (messages.length === 1) messages.push({ role: 'user', content: 'Procède.' })

    const res = await fetch(GATEWAY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Lovable-API-Key': apiKey },
      body: JSON.stringify({ model: MODEL, messages }),
    })

    if (!res.ok) {
      const detail = await res.text()
      console.error('AI gateway error', res.status, detail)
      const message =
        res.status === 429
          ? "Trop de requêtes IA, réessayez dans un instant."
          : res.status === 402
            ? "Crédits IA épuisés : ajoutez des crédits à votre espace de travail."
            : `Erreur du service IA (${res.status}).`
      return json({ error: message }, res.status)
    }

    const data = await res.json()
    const content = data?.choices?.[0]?.message?.content ?? ''
    return json({ content })
  } catch (err) {
    console.error(err)
    return json({ error: "Erreur inattendue du service IA." }, 500)
  }
})

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
