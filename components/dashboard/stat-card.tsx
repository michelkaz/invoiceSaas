import { type LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Accent = "brand" | "emerald" | "amber" | "rose";

const ACCENT: Record<Accent, { icon: string; spark: string }> = {
  brand: { icon: "bg-brand-50 text-brand-600", spark: "text-brand-500" },
  emerald: { icon: "bg-emerald-50 text-emerald-600", spark: "text-emerald-500" },
  amber: { icon: "bg-amber-50 text-amber-600", spark: "text-amber-500" },
  rose: { icon: "bg-rose-50 text-rose-600", spark: "text-rose-500" },
};

function Sparkline({ data, className }: { data: number[]; className?: string }) {
  if (data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const span = max - min || 1;
  const points = data
    .map((value, index) => {
      const x = 2 + (index / (data.length - 1)) * 96;
      const y = 26 - ((value - min) / span) * 22;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  return (
    <svg
      viewBox="0 0 100 28"
      preserveAspectRatio="none"
      className={cn("h-8 w-full", className)}
      aria-hidden
    >
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  accent?: Accent;
  series?: number[];
  /** Contenu libre sous la valeur : badge de tendance, "N factures"… */
  hint?: React.ReactNode;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = "brand",
  series,
  hint,
}: StatCardProps) {
  const colors = ACCENT[accent];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
      <span
        className={cn("grid h-11 w-11 place-items-center rounded-xl", colors.icon)}
      >
        <Icon className="h-5 w-5" />
      </span>

      <p className="mt-4 text-2xl font-bold tracking-tight tabular-nums text-slate-900">
        {value}
      </p>
      <p className="mt-1 text-sm text-slate-500">{label}</p>
      {hint && <div className="mt-1.5 text-xs">{hint}</div>}

      {series && series.length > 1 && (
        <Sparkline data={series} className={cn("mt-3", colors.spark)} />
      )}
    </div>
  );
}

/** Badge "+12,4 %" / "-3,1 %" — vert si en hausse, rose si en baisse. */
export function TrendBadge({
  value,
  suffix,
}: {
  value: number | null;
  suffix?: string;
}) {
  if (value === null) return null;
  const up = value >= 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  const formatted = Math.abs(value).toFixed(1).replace(".", ",");
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-semibold",
        up ? "text-emerald-600" : "text-rose-600",
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {up ? "+" : "-"}
      {formatted} %{suffix ? ` ${suffix}` : ""}
    </span>
  );
}
