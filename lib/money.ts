/**
 * Formatage monétaire.
 *
 * Le FCFA (XOF / XAF) n'a pas de sous-unité : tous les montants sont
 * manipulés en entiers et arrondis au franc le plus proche.
 */

const groupFormatter = new Intl.NumberFormat("fr-FR", {
  maximumFractionDigits: 0,
});

/** Formate un entier en séparateurs de milliers : 250000 -> "250 000". */
export function formatNumber(value: number): string {
  return groupFormatter.format(Math.round(value));
}

/** Formate un montant en FCFA : 250000 -> "250 000 FCFA". */
export function formatFCFA(amount: number): string {
  return `${formatNumber(amount)} FCFA`;
}

/** Version compacte pour les graphiques : 1250000 -> "1,25 M". */
export function formatCompactFCFA(amount: number): string {
  const abs = Math.abs(amount);
  if (abs >= 1_000_000) return `${(amount / 1_000_000).toFixed(1).replace(".", ",")} M`;
  if (abs >= 1_000) return `${Math.round(amount / 1_000)} k`;
  return formatNumber(amount);
}
