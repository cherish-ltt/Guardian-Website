import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicRoutes = ['/login', '/2fa'];
const protectedRoutes = ['/dashboard', '/admins', '/roles', '/permissions'];

function isValidToken(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    const payload = JSON.parse(atob(parts[1]));
    const now = Math.floor(Date.now() / 1000);
    
    return payload.exp > now;
  } catch {
    return false;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('access_token')?.value;
  
  if (pathname === '/') {
    if (token && isValidToken(token)) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  if (publicRoutes.includes(pathname)) {
    if (token && isValidToken(token)) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }
  
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!token || !isValidToken(token)) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      if (token) {
        response.cookies.delete('access_token');
      }
      return response;
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/login', '/2fa', '/dashboard/:path*', '/admins/:path*', '/roles/:path*', '/permissions/:path*']
};
