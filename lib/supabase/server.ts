import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * Client Supabase côté serveur (RSC, route handlers, Server Actions).
 * Lit / écrit la session dans les cookies de la requête.
 */
export function createClient() {
  const cookieStore = cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Config manquante : définissez NEXT_PUBLIC_SUPABASE_URL et " +
        "NEXT_PUBLIC_SUPABASE_ANON_KEY dans les variables d'environnement, " +
        "puis redéployez.",
    );
  }

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Appelé depuis un Server Component : les cookies sont en lecture
          // seule. Le middleware rafraîchit la session, on peut ignorer.
        }
      },
    },
  });
}
