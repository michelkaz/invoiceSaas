import { createBrowserClient } from "@supabase/ssr";

/**
 * Client Supabase côté navigateur (composants « use client »).
 * Singleton implicite : `createBrowserClient` réutilise l'instance.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
