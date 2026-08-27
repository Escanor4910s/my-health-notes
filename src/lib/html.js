/**
 * Échappe les caractères HTML dangereux d'une chaîne.
 * Utilisé avant d'injecter des valeurs utilisateur dans du HTML généré.
 */
export function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
