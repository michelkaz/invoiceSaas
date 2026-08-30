/** Ruban défilant en boucle (CSS pur). Se met en pause au survol,
 *  s'immobilise sous prefers-reduced-motion. */
export function Marquee({ items }: { items: string[] }) {
  const row = (
    <ul className="marquee-track" aria-hidden>
      {items.map((it, i) => (
        <li
          key={`${it}-${i}`}
          className="flex items-center gap-3 whitespace-nowrap text-sm font-semibold uppercase tracking-wide text-slate-400"
        >
          {it}
          <span className="h-1 w-1 rounded-full bg-brand-400" />
        </li>
      ))}
    </ul>
  );

  return (
    <div className="marquee border-y border-slate-100 bg-white py-4">
      {row}
      {row}
    </div>
  );
}
