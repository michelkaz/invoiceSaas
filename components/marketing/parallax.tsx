"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Parallaxe verticale très subtile pilotée par le scroll.
 * `strength` = amplitude max en pixels (défaut 14). Inerte sous
 * prefers-reduced-motion. N'utilise que `transform` (GPU).
 */
export function Parallax({
  children,
  strength = 14,
  className,
}: {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (
      typeof window === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const mid = rect.top + rect.height / 2;
      // -1 (élément en haut) … +1 (élément en bas)
      const progress = (mid - window.innerHeight / 2) / window.innerHeight;
      const clamped = Math.max(-1.2, Math.min(1.2, progress));
      el.style.transform = `translate3d(0, ${(-clamped * strength).toFixed(2)}px, 0)`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [strength]);

  return (
    <div ref={ref} className={cn("will-change-transform", className)}>
      {children}
    </div>
  );
}
