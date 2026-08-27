/**
 * Hache un code PIN à 4 chiffres avec SHA-256.
 * Le hash est stocké à la place du PIN en clair.
 */
export async function hashPin(pin) {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Compare un PIN saisi avec un hash stocké.
 * Si le stockage est encore en clair (migration), compare en clair puis hache.
 */
export async function verifyPin(attempt, stored) {
  if (!stored) return false;
  if (stored.length === 64) {
    const hash = await hashPin(attempt);
    return hash === stored;
  }
  // Ancien stockage en clair : comparer puis migrer silencieusement.
  if (attempt === stored) {
    try {
      const hash = await hashPin(stored);
      localStorage.setItem('obsmed-pin', hash);
    } catch (e) {
      console.warn('Impossible de migrer le PIN haché', e);
    }
    return true;
  }
  return false;
}
