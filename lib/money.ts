/**
 * Formatage monétaire.
 *
 * Le franc congolais (CDF) est manipulé sans sous-unité : tous les montants
 * sont des entiers, arrondis au franc le plus proche. Affichage suffixé « FC ».
 */

const groupFormatter = new Intl.NumberFormat("fr-FR", {
  maximumFractionDigits: 0,
});

/** Formate un entier en séparateurs de milliers : 250000 -> "250 000". */
export function formatNumber(value: number): string {
  return groupFormatter.format(Math.round(value));
}

/** Formate un montant en francs congolais : 250000 -> "250 000 FC". */
export function formatFCFA(amount: number): string {
  return `${formatNumber(amount)} FC`;
}

/** Version compacte pour les graphiques : 1250000 -> "1,25 M". */
export function formatCompactFCFA(amount: number): string {
  const abs = Math.abs(amount);
  if (abs >= 1_000_000) return `${(amount / 1_000_000).toFixed(1).replace(".", ",")} M`;
  if (abs >= 1_000) return `${Math.round(amount / 1_000)} k`;
  return formatNumber(amount);
}
