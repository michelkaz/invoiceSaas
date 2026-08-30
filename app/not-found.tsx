import Link from "next/link";
import { getServerT } from "@/lib/i18n/server";

export default function NotFound() {
  const t = getServerT();
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4">
      <div className="text-center">
        <p className="text-sm font-semibold text-brand-600">
          {t("errors.notFoundCode")}
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
          {t("errors.notFoundTitle")}
        </h1>
        <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
          {t("errors.notFoundDesc")}
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex items-center rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
        >
          {t("errors.backDashboard")}
        </Link>
      </div>
    </main>
  );
}
