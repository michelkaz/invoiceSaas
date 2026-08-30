import { Wallet, CheckCircle2, Clock, FileStack } from "lucide-react";
import { getServerT } from "@/lib/i18n/server";

const bars = [38, 22, 30, 46, 34, 72, 40, 88];

/** Aperçu stylisé du tableau de bord (données fictives, en FC). */
export function DashboardMockup() {
  const t = getServerT();
  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-pop sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {t("landing.mockGreeting")}
          </p>
          <p className="text-xs text-slate-500">{t("landing.mockActivity")}</p>
        </div>
        <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
          Kinshasa · RDC
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {[
          { icon: Wallet, label: t("landing.mockRevenue"), value: "2 450 000 FC", accent: "text-brand-600 bg-brand-50" },
          { icon: FileStack, label: t("landing.mockInvoices"), value: "34", accent: "text-slate-600 bg-slate-100" },
          { icon: CheckCircle2, label: t("landing.mockPaid"), value: "24", accent: "text-emerald-600 bg-emerald-50" },
          { icon: Clock, label: t("landing.mockPending"), value: "7", accent: "text-amber-600 bg-amber-50" },
        ].map(({ icon: Icon, label, value, accent }) => (
          <div key={label} className="rounded-xl border border-slate-100 p-3">
            <span className={`grid h-8 w-8 place-items-center rounded-lg ${accent}`}>
              <Icon className="h-4 w-4" />
            </span>
            <p className="mt-2 text-base font-bold tracking-tight tabular-nums text-slate-900">
              {value}
            </p>
            <p className="text-[11px] text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-slate-100 p-3">
        <p className="text-[11px] font-semibold text-slate-500">
          {t("landing.mockRevenueChart")}
        </p>
        <div className="mt-3 flex h-20 items-end gap-1.5">
          {bars.map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t bg-brand-500/80"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>

      <div className="mt-4 space-y-1.5">
        {[
          { n: "FAC-2026-0042", c: "Congo Digital", a: "850 000 FC", s: t("status.payee"), tone: "bg-emerald-50 text-emerald-700" },
          { n: "FAC-2026-0041", c: "Kivu Consulting", a: "450 000 FC", s: t("status.envoyee"), tone: "bg-amber-50 text-amber-700" },
        ].map((r) => (
          <div
            key={r.n}
            className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-xs"
          >
            <span className="font-semibold text-slate-900">{r.n}</span>
            <span className="hidden text-slate-500 sm:inline">{r.c}</span>
            <span className="font-medium tabular-nums text-slate-900">{r.a}</span>
            <span className={`rounded-full px-2 py-0.5 font-medium ${r.tone}`}>{r.s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Aperçu stylisé d'une facture PDF (données fictives, en FC). */
export function InvoiceMockup() {
  const t = getServerT();
  return (
    <div className="mx-auto w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-pop">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-bold text-slate-900">Congo Digital</p>
          <p className="text-xs text-slate-500">Kinshasa, RDC</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            {t("pdf.invoice")}
          </p>
          <p className="text-sm font-bold text-slate-900">FAC-2026-0042</p>
        </div>
      </div>

      <div className="mt-5 border-t border-slate-100 pt-4 text-xs">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          {t("landing.mockBilledTo")}
        </p>
        <p className="mt-1 font-semibold text-slate-900">Kivu Consulting</p>
        <p className="mt-1 text-slate-500">{t("landing.mockDate")}</p>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
        <span className="text-slate-600">{t("landing.mockService")}</span>
        <span className="tabular-nums text-slate-600">1 × 850 000 FC</span>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
        <span className="text-sm font-bold text-slate-900">
          {t("landing.mockTotal")}
        </span>
        <span className="text-sm font-bold tabular-nums text-slate-900">
          850 000 FC
        </span>
      </div>

      <div className="mt-5 flex gap-2">
        {[
          t("landing.pdfActionPreview"),
          t("landing.pdfActionDownload"),
          t("landing.pdfActionSend"),
        ].map((a) => (
          <span
            key={a}
            className="flex-1 rounded-lg border border-slate-200 py-1.5 text-center text-[11px] font-semibold text-slate-600"
          >
            {a}
          </span>
        ))}
      </div>
    </div>
  );
}
