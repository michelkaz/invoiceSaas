import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4">
      <div className="text-center">
        <p className="text-sm font-semibold text-brand-600">Erreur 404</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
          Page introuvable
        </h1>
        <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
          La page que vous cherchez n&apos;existe pas ou a été déplacée.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex items-center rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
        >
          Retour au tableau de bord
        </Link>
      </div>
    </main>
  );
}
