import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const publicPaths = ["/", "/landing", "/pricing", "/privacy", "/terms"];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isPublic = publicPaths.includes(pathname) || pathname.startsWith("/auth/") || pathname.startsWith("/_next/") || pathname.includes(".");
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return isPublic ? NextResponse.next() : NextResponse.redirect(new URL("/auth/login", request.url));
  }
  const response = NextResponse.next({ request });
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "", {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookies) => cookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options)),
    },
  });
  const { data: { user } } = await supabase.auth.getUser();
  if (pathname === "/" && user) return NextResponse.redirect(new URL("/dashboard", request.url));
  if (!isPublic && !user) return NextResponse.redirect(new URL("/auth/login", request.url));
  if (pathname.startsWith("/auth/") && user) return NextResponse.redirect(new URL("/dashboard", request.url));
  return response;
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };