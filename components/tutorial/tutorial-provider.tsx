"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "@/components/providers/i18n-provider";

export interface TourStep {
  /** Sélecteur CSS de l'élément à mettre en évidence (ex. `[data-tour="nav"]`). */
  selector: string;
  title: string;
  body: string;
}

interface TutorialContextValue {
  /** Démarre un parcours. `onDone` est appelé à la fin (terminé OU ignoré). */
  start: (steps: TourStep[], onDone?: () => void) => void;
  stop: () => void;
  active: boolean;
}

const TutorialContext = createContext<TutorialContextValue | null>(null);

const PADDING = 8;

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function TutorialProvider({ children }: { children: React.ReactNode }) {
  const t = useT();
  const [steps, setSteps] = useState<TourStep[]>([]);
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const onDoneRef = useRef<(() => void) | undefined>(undefined);

  const active = steps.length > 0;
  const step = active ? steps[index] : null;

  const finish = useCallback(() => {
    setSteps([]);
    setIndex(0);
    setRect(null);
    onDoneRef.current?.();
    onDoneRef.current = undefined;
  }, []);

  const start = useCallback((s: TourStep[], onDone?: () => void) => {
    if (!s.length) return;
    onDoneRef.current = onDone;
    setIndex(0);
    setSteps(s);
  }, []);

  // Mesure de la cible + suivi resize / scroll.
  useLayoutEffect(() => {
    if (!step) return;
    let raf = 0;
    const measure = () => {
      const el = document.querySelector(step.selector);
      const r = el?.getBoundingClientRect();
      if (!el || !r || (r.width === 0 && r.height === 0)) {
        setRect(null);
        return;
      }
      el.scrollIntoView({ block: "center", behavior: "smooth" });
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    };
    measure();
    const onChange = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };
    window.addEventListener("resize", onChange);
    window.addEventListener("scroll", onChange, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onChange);
      window.removeEventListener("scroll", onChange, true);
    };
  }, [step]);

  // Échap pour quitter.
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [active, finish]);

  const value = useMemo<TutorialContextValue>(
    () => ({ start, stop: finish, active }),
    [start, finish, active],
  );

  // Position de l'infobulle : sous la cible si la place le permet, sinon au-dessus ;
  // sur mobile, ancrée en bas de l'écran.
  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
  let tooltipStyle: React.CSSProperties = {};
  if (rect && !isMobile) {
    const below = rect.top + rect.height + PADDING + 180 < window.innerHeight;
    tooltipStyle = below
      ? { top: rect.top + rect.height + PADDING + 12, left: Math.max(16, rect.left) }
      : { top: Math.max(16, rect.top - PADDING - 12 - 176), left: Math.max(16, rect.left) };
  }

  return (
    <TutorialContext.Provider value={value}>
      {children}
      {active && step && (
        <div className="fixed inset-0 z-[120]" aria-live="polite" role="dialog">
          {/* Voile + trou lumineux sur la cible */}
          {rect ? (
            <div
              className="pointer-events-none absolute rounded-xl transition-all duration-200"
              style={{
                top: rect.top - PADDING,
                left: rect.left - PADDING,
                width: rect.width + PADDING * 2,
                height: rect.height + PADDING * 2,
                boxShadow: "0 0 0 9999px rgb(15 23 42 / 0.6)",
              }}
            />
          ) : (
            <div className="absolute inset-0 bg-slate-900/60" />
          )}

          {/* Clic hors infobulle = fin */}
          <button
            type="button"
            aria-label={t("tour.close")}
            className="absolute inset-0 h-full w-full cursor-default"
            onClick={finish}
          />

          <div
            className="absolute w-[calc(100%-2rem)] max-w-xs rounded-2xl border border-slate-200 bg-white p-4 shadow-pop animate-fade-in max-sm:inset-x-4 max-sm:bottom-4 max-sm:w-auto max-sm:max-w-none"
            style={tooltipStyle}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-semibold text-slate-900">{step.title}</p>
              <button
                type="button"
                onClick={finish}
                aria-label={t("common.close")}
                className="grid h-6 w-6 shrink-0 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="mt-1 text-sm text-slate-600">{step.body}</p>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                {t("tour.step", { current: index + 1, total: steps.length })}
              </span>
              <div className="flex gap-2">
                {index > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIndex((i) => i - 1)}
                  >
                    {t("tour.prev")}
                  </Button>
                )}
                {index < steps.length - 1 ? (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setIndex((i) => i + 1)}
                  >
                    {t("tour.next")}
                  </Button>
                ) : (
                  <Button type="button" size="sm" onClick={finish}>
                    {t("tour.finish")}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </TutorialContext.Provider>
  );
}

export function useTutorial(): TutorialContextValue {
  const ctx = useContext(TutorialContext);
  if (!ctx)
    throw new Error("useTutorial doit être utilisé dans <TutorialProvider>");
  return ctx;
}
