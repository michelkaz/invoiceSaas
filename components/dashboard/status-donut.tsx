"use client";

import type { StatusSlice } from "@/lib/dashboard-stats";
import type { InvoiceStatus } from "@/lib/data/types";
import { formatFCFA } from "@/lib/money";
import { useT } from "@/components/providers/i18n-provider";

const COLORS: Record<InvoiceStatus, string> = {
  payee: "#10b981", // emerald-500
  envoyee: "#f59e0b", // amber-500
  en_retard: "#f43f5e", // rose-500
  brouillon: "#cbd5e1", // slate-300
};

export function StatusDonut({ data }: { data: StatusSlice[] }) {
  const t = useT();
  const total = data.reduce((sum, slice) => sum + slice.count, 0);
  let offset = 0;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-6">
      <h2 className="text-base font-semibold text-slate-900">
        {t("dashboard.statusTitle")}
      </h2>
      <p className="mt-0.5 text-sm text-slate-500">
        {t("dashboard.statusSubtitle")}
      </p>

      <div className="mt-6 flex flex-col items-center gap-6 xl:flex-row">
        <div className="relative h-36 w-36 shrink-0">
          <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
            <circle
              cx="18"
              cy="18"
              r="15.915"
              fill="none"
              stroke="#f1f5f9"
              strokeWidth="4"
            />
            {total > 0 &&
              data.map((slice) => {
                if (slice.count === 0) return null;
                const pct = (slice.count / total) * 100;
                const dash = `${pct} ${100 - pct}`;
                const circle = (
                  <circle
                    key={slice.status}
                    cx="18"
                    cy="18"
                    r="15.915"
                    fill="none"
                    stroke={COLORS[slice.status]}
                    strokeWidth="4"
                    strokeLinecap="round"
                    pathLength={100}
                    strokeDasharray={dash}
                    strokeDashoffset={-offset}
                  />
                );
                offset += pct;
                return circle;
              })}
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900">{total}</p>
              <p className="text-xs text-slate-500">{t("nav.invoices")}</p>
            </div>
          </div>
        </div>

        <ul className="w-full min-w-0 space-y-3">
          {data.map((slice) => (
            <li
              key={slice.status}
              className="flex min-w-0 items-center justify-between gap-3"
            >
              <span className="flex min-w-0 flex-1 items-center gap-2 text-sm text-slate-600">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: COLORS[slice.status] }}
                />
                <span className="truncate">{t(`status.${slice.status}`)}</span>
                <span className="shrink-0 text-slate-400">({slice.count})</span>
              </span>
              <span className="shrink-0 whitespace-nowrap text-sm font-semibold tabular-nums text-slate-900">
                {formatFCFA(slice.amount)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
