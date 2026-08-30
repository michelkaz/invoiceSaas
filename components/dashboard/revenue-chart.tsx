"use client";

import type { MonthlyPoint } from "@/lib/dashboard-stats";
import { formatCompactFCFA, formatFCFA } from "@/lib/money";
import { useT } from "@/components/providers/i18n-provider";

/** Arrondit vers le haut à 1–2 chiffres significatifs (axe lisible). */
function niceCeil(value: number): number {
  if (value <= 0) return 1;
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
  return Math.ceil(value / magnitude) * magnitude;
}

// Repère du graphique (unités du viewBox — le SVG se met à l'échelle en largeur).
const VB_W = 720;
const VB_H = 300;
const PAD = { left: 52, right: 12, top: 12, bottom: 30 };
const PLOT_W = VB_W - PAD.left - PAD.right;
const PLOT_H = VB_H - PAD.top - PAD.bottom;
const RATIOS = [1, 0.75, 0.5, 0.25, 0];

export function RevenueChart({ data }: { data: MonthlyPoint[] }) {
  const t = useT();
  const max = niceCeil(Math.max(...data.map((d) => d.value), 1));
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const slot = PLOT_W / data.length;
  const barWidth = Math.min(slot * 0.5, 40);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            {t("dashboard.revenueTitle")}
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">
            {t("dashboard.lastMonths", { count: data.length })}
          </p>
        </div>
        <div className="text-right">
          <p className="whitespace-nowrap text-lg font-bold text-slate-900">
            {formatFCFA(total)}
          </p>
          <p className="text-xs text-slate-500">{t("dashboard.revenueTotal")}</p>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        className="mt-6 h-auto w-full overflow-visible"
        role="img"
        aria-label={`Revenus facturés par mois : ${data
          .map((d) => `${d.label} ${formatFCFA(d.value)}`)
          .join(", ")}`}
      >
        <defs>
          <linearGradient id="barFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#c4b5fd" />
          </linearGradient>
        </defs>

        {/* Grille + libellés Y */}
        {RATIOS.map((ratio) => {
          const y = PAD.top + PLOT_H * (1 - ratio);
          return (
            <g key={ratio}>
              <line
                x1={PAD.left}
                x2={VB_W - PAD.right}
                y1={y}
                y2={y}
                stroke="#f1f5f9"
                strokeWidth={1}
              />
              <text
                x={PAD.left - 10}
                y={y + 4}
                textAnchor="end"
                fontSize={12}
                fill="#94a3b8"
              >
                {formatCompactFCFA(max * ratio)}
              </text>
            </g>
          );
        })}

        {/* Barres + libellés X */}
        {data.map((point, index) => {
          const barHeight = Math.max((point.value / max) * PLOT_H, 2);
          const x = PAD.left + slot * index + (slot - barWidth) / 2;
          const y = PAD.top + PLOT_H - barHeight;
          return (
            <g key={point.label}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={5}
                fill="url(#barFill)"
              >
                <title>{`${point.label} — ${formatFCFA(point.value)}`}</title>
              </rect>
              <text
                x={PAD.left + slot * (index + 0.5)}
                y={VB_H - 8}
                textAnchor="middle"
                fontSize={13}
                fill="#64748b"
                className="capitalize"
              >
                {point.label}
              </text>
            </g>
          );
        })}
      </svg>
    </section>
  );
}
