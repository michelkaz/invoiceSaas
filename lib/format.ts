/** Formatage des dates — affichage jour/mois/année. */

const MONTHS_SHORT = [
  "janv.", "févr.", "mars", "avr.", "mai", "juin",
  "juil.", "août", "sept.", "oct.", "nov.", "déc.",
];

function toDate(input: string | Date): Date {
  return typeof input === "string" ? new Date(input) : input;
}

/** "2026-01-15" -> "15/01/2026" */
export function formatDate(input: string | Date): string {
  const d = toDate(input);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${d.getFullYear()}`;
}

/** "2026-01-15" -> "15 janv. 2026" */
export function formatDateLong(input: string | Date): string {
  const d = toDate(input);
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}

/** Libellé court d'un mois (0 = janvier). */
export function monthLabel(monthIndex: number): string {
  return MONTHS_SHORT[((monthIndex % 12) + 12) % 12];
}

function isoOf(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/** Date du jour au format ISO court "AAAA-MM-JJ". */
export function todayISO(): string {
  return isoOf(new Date());
}

/** Ajoute `days` jours à une date ISO et renvoie l'ISO court. */
export function addDaysISO(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  return isoOf(d);
}
