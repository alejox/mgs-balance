import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return req.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: Record<string, unknown>) {
            req.cookies.set({
              name,
              value,
              ...options,
            });
            response = NextResponse.next({
              request: {
                headers: req.headers,
              },
            });
            response.cookies.set({
              name,
              value,
              ...options,
            });
          },
          remove(name: string, options: Record<string, unknown>) {
            req.cookies.set({
              name,
              value: "",
              ...options,
            });
            response = NextResponse.next({
              request: {
                headers: req.headers,
              },
            });
            response.cookies.set({
              name,
              value: "",
              ...options,
            });
          },
        },
      }
    );

    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Si el usuario no está autenticado y trata de acceder al dashboard
    if (!session && req.nextUrl.pathname.startsWith("/dashboard")) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = "/auth/login";
      return NextResponse.redirect(redirectUrl);
    }

    // Si el usuario está autenticado y trata de acceder a las páginas de auth
    if (session && req.nextUrl.pathname.startsWith("/auth")) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = "/dashboard";
      return NextResponse.redirect(redirectUrl);
    }
  } catch (error) {
    console.error("Middleware error:", error);
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*"],
};
