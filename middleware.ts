import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Different way to get cookies in Next.js 12
  const cookies = request.headers.get('cookie') || '';
  const tokenMatch = cookies.match(/token=([^;]+)/);
  const roleMatch = cookies.match(/userRole=([^;]+)/);
  
  const token = tokenMatch ? tokenMatch[1] : null;
  const userRole = roleMatch ? roleMatch[1] : null;
  
  const path = request.nextUrl.pathname;

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/signup'];
  
  // Manager only routes
  const managerRoutes = ['/manager-dashboard'];
  
  // Student only routes
  const studentRoutes = ['/home', '/classroom'];

  if (!token && !publicRoutes.includes(path)) {
    // Redirect to login if no token and trying to access protected route
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (token) {
    // Check role-specific routes
    if (managerRoutes.includes(path) && userRole !== 'manager') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
    
    if (studentRoutes.includes(path) && userRole !== 'student') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};