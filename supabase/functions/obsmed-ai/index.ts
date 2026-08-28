import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

const GATEWAY = 'https://ai.gateway.lovable.dev/v1/chat/completions'
const MODEL = 'google/gemini-2.5-flash'
const VERSION = '2026-08-28.1'
const BOOT_AT = new Date().toISOString()

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

/** Structured log — never contains secrets, only presence booleans and lengths. */
function log(event: string, fields: Record<string, unknown> = {}) {
  console.log(JSON.stringify({ svc: 'obsmed-ai', version: VERSION, booted_at: BOOT_AT, event, ...fields }))
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const reqId = crypto.randomUUID()
  const started = Date.now()

  try {
    const apiKey = Deno.env.get('LOVABLE_API_KEY')
    const url = new URL(req.url)
    const body = req.method === 'POST' ? await req.json().catch(() => null) : null
    const action = typeof body?.action === 'string' ? body.action : ''

    // ---- Health endpoint: GET ?health=1  OR  { action: "health" }
    if (url.searchParams.has('health') || action === 'health' || req.method === 'GET') {
      const status = {
        ok: Boolean(apiKey),
        status: apiKey ? 'ready' : 'unconfigured',
        version: VERSION,
        booted_at: BOOT_AT,
        secrets: { LOVABLE_API_KEY: Boolean(apiKey) },
        model: MODEL,
        actions: Object.keys(PROMPTS),
        request_id: reqId,
      }
      log('health_check', { ok: status.ok, request_id: reqId })
      return json(status, status.ok ? 200 : 503)
    }

    log('request_received', {
      request_id: reqId,
      action,
      method: req.method,
      has_api_key: Boolean(apiKey),
      has_dossier: Boolean(body?.dossier),
      texte_len: typeof body?.texte === 'string' ? body.texte.length : 0,
      history_len: Array.isArray(body?.messages) ? body.messages.length : 0,
    })

    if (!apiKey) {
      log('config_error', { request_id: reqId, reason: 'missing_LOVABLE_API_KEY' })
      return json(
        {
          error: "Service IA temporairement indisponible (configuration). Réessayez dans un instant.",
          code: 'AI_UNCONFIGURED',
          retryable: true,
          request_id: reqId,
        },
        503,
      )
    }

    if (!PROMPTS[action]) {
      log('bad_request', { request_id: reqId, action })
      return json({ error: `Action IA inconnue : ${action}`, code: 'BAD_ACTION', retryable: false, request_id: reqId }, 400)
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

    // ---- Gateway call with bounded backoff on 429 / 5xx / network errors
    const MAX_ATTEMPTS = 3
    let lastStatus = 0
    let lastError = ''

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      let res: Response
      try {
        log('gateway_call', { request_id: reqId, action, attempt, model: MODEL })
        res = await fetch(GATEWAY, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Lovable-API-Key': apiKey },
          body: JSON.stringify({ model: MODEL, messages }),
        })
      } catch (netErr) {
        lastStatus = 0
        lastError = String(netErr)
        log('gateway_network_error', { request_id: reqId, attempt, error: lastError })
        if (attempt < MAX_ATTEMPTS) {
          await sleep(500 * 2 ** (attempt - 1))
          continue
        }
        break
      }

      if (res.ok) {
        const data = await res.json()
        const content = data?.choices?.[0]?.message?.content ?? ''
        log('gateway_success', {
          request_id: reqId,
          action,
          attempt,
          duration_ms: Date.now() - started,
          content_len: content.length,
        })
        return json({ content, request_id: reqId })
      }

      lastStatus = res.status
      lastError = (await res.text()).slice(0, 500)
      log('gateway_error', { request_id: reqId, action, attempt, status: res.status })

      const retryable = res.status === 429 || res.status >= 500
      if (retryable && attempt < MAX_ATTEMPTS) {
        const retryAfter = Number(res.headers.get('Retry-After'))
        const delay = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 500 * 2 ** (attempt - 1)
        await sleep(Math.min(delay, 4000))
        continue
      }
      break
    }

    const message =
      lastStatus === 429
        ? "Trop de requêtes IA, réessayez dans un instant."
        : lastStatus === 402
          ? "Crédits IA épuisés : ajoutez des crédits à votre espace de travail."
          : lastStatus === 0
            ? "Service IA injoignable. Réessayez."
            : `Service IA indisponible (${lastStatus}).`

    log('request_failed', { request_id: reqId, action, status: lastStatus, duration_ms: Date.now() - started })
    return json(
      {
        error: message,
        code: lastStatus === 402 ? 'AI_NO_CREDITS' : 'AI_UNAVAILABLE',
        retryable: lastStatus === 429 || lastStatus === 0 || lastStatus >= 500,
        request_id: reqId,
      },
      lastStatus && lastStatus !== 0 ? lastStatus : 503,
    )
  } catch (err) {
    log('unhandled_error', { request_id: reqId, error: String(err) })
    return json({ error: "Erreur inattendue du service IA.", code: 'AI_UNEXPECTED', retryable: true, request_id: reqId }, 500)
  }
})

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
