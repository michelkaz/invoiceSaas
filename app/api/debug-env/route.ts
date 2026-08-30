import { NextResponse } from "next/server";

// TEMPORAIRE — à supprimer après diagnostic. N'expose aucun secret :
// uniquement des booléens + le préfixe public de l'URL.
export const runtime = "nodejs";

export function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? null;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? null;
  return NextResponse.json({
    hasUrl: Boolean(url),
    hasKey: Boolean(key),
    urlLength: url?.length ?? 0,
    keyLength: key?.length ?? 0,
    urlPrefix: url ? url.slice(0, 20) : null,
    keyPrefix: key ? key.slice(0, 6) : null,
    // Tous les noms de variables NEXT_PUBLIC_* visibles au runtime :
    nextPublicVarNames: Object.keys(process.env).filter((k) =>
      k.startsWith("NEXT_PUBLIC_"),
    ),
    vercelEnv: process.env.VERCEL_ENV ?? null,
  });
}
