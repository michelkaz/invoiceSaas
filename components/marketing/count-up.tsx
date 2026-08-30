"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Compte de 0 → `end` lorsqu'il entre dans le viewport (easing ease-out cubic).
 * `format` : transforme la valeur affichée (ex. séparateurs de milliers).
 * Inerte sous prefers-reduced-motion (affiche directement la valeur finale).
 */
export function CountUp({
  end,
  duration = 1400,
  prefix = "",
  suffix = "",
  format,
  className,
}: {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  format?: (n: number) => string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce || typeof IntersectionObserver === "undefined") {
      setValue(end);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return;
        started.current = true;
        io.disconnect();
        const t0 = performance.now();
        const step = (now: number) => {
          const p = Math.min(1, (now - t0) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          setValue(Math.round(end * eased));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      },
      { threshold: 0.45 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [end, duration]);

  const shown = format ? format(value) : String(value);
  return (
    <span ref={ref} className={className}>
      {prefix}
      {shown}
      {suffix}
    </span>
  );
}

/** Format « 2 450 000 » (fr-FR, espace fine remplacée par espace normale). */
export function groupFR(n: number): string {
  return n.toLocaleString("fr-FR").replace(/ | /g, " ");
}
