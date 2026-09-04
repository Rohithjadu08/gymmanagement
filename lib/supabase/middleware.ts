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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isAdminRoute = pathname.startsWith('/admin');
  const isMemberRoute = pathname.startsWith('/member');
  const isAdminLoginPage = pathname === '/admin/login';
  const isMemberLoginPage = pathname === '/member/login';

  // Protect Admin Routes
  if (isAdminRoute && !isAdminLoginPage && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';
    return NextResponse.redirect(url);
  }

  // Protect Member Routes
  if (isMemberRoute && !isMemberLoginPage && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/member/login';
    return NextResponse.redirect(url);
  }

  // Redirect Authenticated users visiting login pages
  if (isAdminLoginPage && user) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/dashboard';
    return NextResponse.redirect(url);
  }

  if (isMemberLoginPage && user) {
    const url = request.nextUrl.clone();
    url.pathname = '/member/dashboard';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
