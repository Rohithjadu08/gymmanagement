import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Do not run code between createServerClient and getUser to avoid subtle auth issues
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isLoginPage = request.nextUrl.pathname === '/admin/login';
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');

  if (isAdminRoute && !isLoginPage && !user) {
    // Unauthenticated user trying to access admin dashboard
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';
    return NextResponse.redirect(url);
  }

  if (isLoginPage && user) {
    // Authenticated user trying to access login page
    const url = request.nextUrl.clone();
    url.pathname = '/admin/dashboard';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

