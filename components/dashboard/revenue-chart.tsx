"use client";

import type { RevenuePoint } from "@/lib/dashboard-stats";
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

export function RevenueChart({
  data,
  action,
}: {
  data: RevenuePoint[];
  /** Sélecteur de période affiché à droite du titre. */
  action?: React.ReactNode;
}) {
  const t = useT();
  const max = niceCeil(Math.max(...data.map((d) => Math.max(d.invoiced, d.collected)), 1));
  const totalInvoiced = data.reduce((sum, d) => sum + d.invoiced, 0);
  const slot = PLOT_W / data.length;
  const groupWidth = Math.min(slot * 0.6, 46);
  const barWidth = groupWidth / 2 - 2;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            {t("dashboard.revenueTitle")}
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">
            {t("dashboard.lastMonths", { count: data.length })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {action}
          <div className="text-right">
            <p className="whitespace-nowrap text-lg font-bold text-slate-900">
              {formatFCFA(totalInvoiced)}
            </p>
            <p className="text-xs text-slate-500">{t("dashboard.revenueTotal")}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-4 text-xs font-medium text-slate-600">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-brand-400" />
          {t("dashboard.legendInvoiced")}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          {t("dashboard.legendCollected")}
        </span>
      </div>

      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        className="mt-4 h-auto w-full overflow-visible"
        role="img"
        aria-label={`${t("dashboard.legendInvoiced")} / ${t("dashboard.legendCollected")} : ${data
          .map((d) => `${d.label} ${formatFCFA(d.invoiced)} / ${formatFCFA(d.collected)}`)
          .join(", ")}`}
      >
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

        {/* Barres groupées (facturé + encaissé) + libellés X */}
        {data.map((point, index) => {
          const groupX = PAD.left + slot * index + (slot - groupWidth) / 2;
          const invoicedHeight = Math.max((point.invoiced / max) * PLOT_H, 2);
          const collectedHeight = Math.max((point.collected / max) * PLOT_H, 2);
          return (
            <g key={point.label}>
              <rect
                x={groupX}
                y={PAD.top + PLOT_H - invoicedHeight}
                width={barWidth}
                height={invoicedHeight}
                rx={4}
                fill="#a78bfa"
              >
                <title>{`${point.label} — ${t("dashboard.legendInvoiced")} : ${formatFCFA(point.invoiced)}`}</title>
              </rect>
              <rect
                x={groupX + barWidth + 4}
                y={PAD.top + PLOT_H - collectedHeight}
                width={barWidth}
                height={collectedHeight}
                rx={4}
                fill="#10b981"
              >
                <title>{`${point.label} — ${t("dashboard.legendCollected")} : ${formatFCFA(point.collected)}`}</title>
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
