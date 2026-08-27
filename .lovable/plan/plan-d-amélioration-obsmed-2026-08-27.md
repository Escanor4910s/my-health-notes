# Plan d'amélioration ObsMed

## Objectif

Rendre l'application plus fiable, sécurisée et professionnelle en corrigeant les dysfonctionnements critiques actuels, en unifiant la configuration backend et en ajoutant des améliorations d'usage concrètes (export personnalisable, SEO, tests).

## Améliorations retenues

### 1. Corriger l'OCR (bug bloquant)

Tesseract.js v7 n'utilise plus `worker.loadLanguage()` / `worker.initialize()`. L'OCR est donc totalement inopérant en l'état.

- Remplacer l'instanciation worker par l'API v5+.
- Supprimer les appels obsolètes.
- Aligner les clés de fallback local avec celles attendues par l'IA.

### 2. Unifier et sécuriser la configuration Supabase

Deux projets Supabase coexistent actuellement : un hardcodé dans `src/lib/supabase.js` et un fourni par `.env` utilisé par l'IA. Cette incohérence peut rompre l'authentification, la sync ou les edge functions.

- Utiliser `import.meta.env.VITE_SUPABASE_URL` et `VITE_SUPABASE_PUBLISHABLE_KEY` partout.
- Supprimer les identifiants hardcodés.
- Vérifier le déploiement de la fonction `obsmed-ai` sur le projet `.env`.

### 3. Sécuriser l'export HTML

L'export PDF/Word concatène les valeurs patient dans du HTML sans échappement. Un nom ou une valeur contenant du HTML/JS peut corrompre le document ou exécuter du script.

- Ajouter une fonction `escapeHtml` utilitaire.
- L'appliquer à toutes les valeurs injectées dans `ExportSection.jsx`.

### 4. Vérifier / corriger le modèle IA

Le modèle `google/gemini-3.7-flash` n'est pas un identifiant Gemini public connu (les familles officielles sont 1.5, 2.0, 2.5). Cela risque de produire des erreurs 404 côté gateway.

- Tester un appel réel de la edge function.
- Remplacer par un modèle valide si nécessaire (`google/gemini-2.5-flash` ou autre modèle supporté par le gateway Lovable AI).

### 5. Améliorer l'authentification

Le flux actuel manque de robustesse pour une application à données médicales.

- Ajouter un lien "Mot de passe oublié" utilisant `supabase.auth.resetPasswordForEmail`.
- Renforcer la politique de mot de passe (8 caractères minimum, indicateur de force).
- Vérifier/hacher le PIN de `LockScreen.jsx` s'il est stocké en clair.

### 6. Personnaliser l'en-tête d'export

L'en-tête institutionnel est codé en dur "République du Sénégal". Il doit devenir paramétrable.

- Ajouter un écran ou un champ de paramètres utilisateur (pays, établissement, logo, ville).
- Persister ces réglages dans le profil utilisateur ou le `localStorage`.
- Les utiliser dans `ExportSection.jsx` à la place du texte en dur.

### 7. SEO et métadonnées de base

`index.html` est minimaliste (`lang="en"`, pas de description, pas d'Open Graph).

- Passer `lang` à `"fr"`.
- Ajouter `<meta name="description">`, `og:title`, `og:description`, `og:type`, `twitter:card` et `theme-color`.
- Ne pas générer d'`og:image` automatique (sera ajouté par l'hébergement) sauf si l'utilisateur fournit une URL absolue.

### 8. Ajouter des tests unitaires

Aucun test n'existe dans le projet.

- Ajouter Vitest et un script `test` dans `package.json`.
- Couvrir d'abord les fonctions pures critiques : `compactDossier`, `parseJSONResponse`, `escapeHtml`.
- Ajouter un test de non-régression sur l'appel OCR Tesseract.

### 9. Découper le tableau de bord

`Dashboard.jsx` fait 75 Ko. Il est difficile à maintenir et à optimiser.

- Extraire au minimum : `PatientList`, `DashboardStats`, `DashboardActions`.
- Conserver le comportement actuel ; seul l'organisation interne change.

## Détails techniques

| Étape | Fichiers concernés | Notes |
|---|---|---|
| OCR | `src/components/Screens/OCRScanner.jsx` | API `Tesseract.createWorker('fra+eng', 1, { logger })` |
| Supabase unifié | `src/lib/supabase.js`, `.env`, `supabase/functions/obsmed-ai/index.ts` | Vérifier déploiement fonction sur le projet `.env` |
| Export sécurisé | `src/components/Sections/ExportSection.jsx`, nouveau `src/lib/html.js` | Échappement systématique |
| Modèle IA | `supabase/functions/obsmed-ai/index.ts` | Test réel via edge function |
| Auth | `src/components/Screens/AuthScreen.jsx`, `src/components/Screens/LockScreen.jsx` | Reset password + force mdp + hachage PIN |
| Export institution | `src/components/Sections/ExportSection.jsx`, éventuellement nouveau `src/components/Screens/Settings.jsx` | Paramètres utilisateur |
| SEO | `index.html` | Respecter les contraintes de longueur title/description |
| Tests | `package.json`, `src/lib/*.test.js` | Vitest minimal |
| Dashboard | `src/components/Screens/Dashboard.jsx` | Refactor interne sans changer l'UI |

## Livrables attendus

- OCR fonctionnel sur photo de bilan.
- Un seul projet Supabase utilisé par toute l'application.
- Export HTML sans risque d'injection.
- IA fonctionnelle avec un modèle valide.
- Auth renforcée avec reset password.
- Export personnalisable par établissement.
- SEO de base conforme.
- Premiers tests unitaires passants.
- Dashboard plus lisible/maintenable.

## Hors scope de ce plan

- Migration `localStorage` vers `IndexedDB` (effort élevé, nécessite un plan dédié).
- Activation complète PWA / service worker (serait cohérent mais trop large ici).
- Refonte graphique ou redesign des sections cliniques.
- Interopérabilité CIM-10/SNOMED.

## Ordre de réalisation suggéré

1. Corrections critiques : OCR, Supabase, modèle IA, XSS export.
2. Auth et sécurité : reset password, force mdp, PIN.
3. Usage : paramètres d'export institution.
4. Fondation : SEO, tests Vitest.
5. Maintenabilité : découpage Dashboard.
