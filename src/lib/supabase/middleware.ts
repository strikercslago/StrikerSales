import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database.generated";

export async function updateSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return NextResponse.next({ request });

  let response = NextResponse.next({ request });
  const supabase = createServerClient<Database>(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data, error } = await supabase.auth.getClaims();
  const authenticated = !error && Boolean(data?.claims?.sub);
  const loginRoute = request.nextUrl.pathname.startsWith("/login");

  const redirectWithSession = (pathname: string) => {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = pathname;
    const redirect = NextResponse.redirect(redirectUrl);
    response.cookies.getAll().forEach(({ name, value }) => redirect.cookies.set(name, value));
    return redirect;
  };

  if (!authenticated && !loginRoute) {
    return redirectWithSession("/login");
  }
  if (authenticated && loginRoute) {
    return redirectWithSession("/");
  }
  return response;
}
