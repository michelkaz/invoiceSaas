import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/** Pages accessibles sans session. */
const PUBLIC_PAGES = ["/login", "/signup", "/forgot-password", "/verify-email"];
/** Préfixes toujours autorisés, quel que soit l'état de session
 *  (callbacks de confirmation + choix d'un nouveau mot de passe après lien email). */
const ALWAYS_OPEN = ["/auth", "/reset-password"];
const VERIFY_PAGE = "/verify-email";

const startsWithAny = (path: string, list: string[]) =>
  list.some((p) => path === p || path.startsWith(`${p}/`));

/**
 * Rafraîchit la session Supabase et applique les règles d'accès :
 * - non connecté         → /login
 * - connecté non vérifié → /verify-email (métier bloqué)
 * - connecté vérifié sur une page d'auth → /dashboard
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Variables d'environnement absentes (ex. déploiement mal configuré) :
  // on laisse passer la requête plutôt que de renvoyer une 500 sur tout le site.
  if (!supabaseUrl || !supabaseKey) {
    console.error(
      "[middleware] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY manquantes.",
    );
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isPublic = startsWithAny(pathname, PUBLIC_PAGES);
  const isAlwaysOpen = startsWithAny(pathname, ALWAYS_OPEN);
  const isVerifyPage = pathname === VERIFY_PAGE;

  if (isAlwaysOpen) return response;

  const redirect = (to: string, withNext = false) => {
    const url = request.nextUrl.clone();
    url.pathname = to;
    url.search = "";
    if (withNext && pathname !== "/") url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  };

  // Non connecté : seules les pages publiques sont accessibles.
  if (!user) {
    return isPublic ? response : redirect("/login", true);
  }

  const verified = Boolean(user.email_confirmed_at);

  // Connecté mais email non vérifié : seule /verify-email est permise.
  if (!verified) {
    return isVerifyPage ? response : redirect(VERIFY_PAGE);
  }

  // Connecté + vérifié : les pages publiques d'auth renvoient vers l'app.
  if (isPublic) {
    return redirect("/dashboard");
  }

  return response;
}
