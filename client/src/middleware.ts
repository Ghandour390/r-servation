import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('access_token')?.value;
  const { pathname } = request.nextUrl;

  const authPages = ['/login', '/register', '/resetPassword', '/verification-email', '/envoicode'];
  const isAuthPage = authPages.some(page => pathname.startsWith(page));

  if (isAuthPage && accessToken) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (!isAuthPage && !accessToken && pathname !== '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
