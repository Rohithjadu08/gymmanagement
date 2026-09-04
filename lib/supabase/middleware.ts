import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const pathname = request.nextUrl.pathname;
  const isAdminRoute = pathname.startsWith('/admin');
  const isMemberRoute = pathname.startsWith('/member');
  const isAdminLoginPage = pathname === '/admin/login';
  const isMemberLoginPage = pathname === '/member/login';

  const demoSession = request.cookies.get('demo_session')?.value;

  let user: any = null;

  if (demoSession) {
    user = { id: 'demo-user', role: demoSession };
  } else {
    try {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
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

      // Fast timeout so middleware never hangs requests if Supabase URL is unreachable
      const getUserPromise = supabase.auth.getUser();
      const timeoutPromise = new Promise<{ data: { user: any } }>((resolve) =>
        setTimeout(() => resolve({ data: { user: null } }), 1000)
      );

      const res = await Promise.race([getUserPromise, timeoutPromise]);
      user = res?.data?.user || null;
    } catch {
      user = null;
    }
  }

  const hasAdminAuth = user || demoSession === 'admin';
  const hasMemberAuth = user || demoSession === 'member';

  // Protect Admin Routes
  if (isAdminRoute && !isAdminLoginPage && !hasAdminAuth) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';
    return NextResponse.redirect(url);
  }

  // Protect Member Routes
  if (isMemberRoute && !isMemberLoginPage && !hasMemberAuth) {
    const url = request.nextUrl.clone();
    url.pathname = '/member/login';
    return NextResponse.redirect(url);
  }

  // Redirect Authenticated users visiting login pages
  if (isAdminLoginPage && hasAdminAuth) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/dashboard';
    return NextResponse.redirect(url);
  }

  if (isMemberLoginPage && hasMemberAuth) {
    const url = request.nextUrl.clone();
    url.pathname = '/member/dashboard';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
