import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'qwerty-super-secret-key-123456');

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protected Routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/checkout')) {
    const token = request.cookies.get('access_token')?.value;

    // 1. Check if token exists
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      // 2. Verify Token
      const { payload } = await jwtVerify(token, JWT_SECRET);
      
      // ADMIN ACCESS CONTROL
      if (pathname.startsWith('/admin') && payload.role !== 'admin') {
        return NextResponse.redirect(new URL('/login?error=unauthorized', request.url));
      }

      // CHECKOUT LOGIC
      if (pathname.startsWith('/checkout')) {
        // Admins cannot checkout
        if (payload.role === 'admin') {
          return NextResponse.redirect(new URL('/', request.url));
        }

        // Check for complete address
        const addr = payload.address as any;
        const hasAddress = addr && typeof addr === 'object' && addr.detail && addr.city;
        
        if (!hasAddress) {
          // Redirect to profile if address is incomplete
          const profileUrl = new URL('/profile', request.url);
          profileUrl.searchParams.set('error', 'missing_address');
          profileUrl.searchParams.set('redirect', '/checkout');
          return NextResponse.redirect(profileUrl);
        }
      }

      return NextResponse.next();
    } catch (error) {
      // 3. Token invalid or expired
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('error', 'session_invalid');
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: ['/admin/:path*', '/checkout/:path*'],
};
