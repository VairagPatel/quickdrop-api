import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // Check if user is authenticated
    if (!token) {
      const origin = req.headers.get('origin') || '';
      const allowedOrigins = [
        'http://localhost:5173',
        'https://quickdrop-web.vercel.app'
      ];
      
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { 
          status: 401,
          headers: {
            'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : allowedOrigins[0],
            'Access-Control-Allow-Credentials': 'true',
            'Content-Type': 'application/json',
          }
        }
      );
    }

    // Admin-only routes check
    const adminOnlyRoutes = [
      '/api/admin',
      // Add more admin-only routes here
    ];

    const isAdminRoute = adminOnlyRoutes.some(route => pathname.startsWith(route));

    if (isAdminRoute && token.role !== 'admin') {
      const origin = req.headers.get('origin') || '';
      const allowedOrigins = [
        'http://localhost:5173',
        'https://quickdrop-web.vercel.app'
      ];
      
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { 
          status: 403,
          headers: {
            'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : allowedOrigins[0],
            'Access-Control-Allow-Credentials': 'true',
            'Content-Type': 'application/json',
          }
        }
      );
    }

    // Allow the request to proceed
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Return true if token exists (user is logged in)
        return !!token;
      },
    },
    pages: {
      signIn: '/login',
    },
  }
);

// Configure which routes use this middleware
export const config = {
  matcher: [
    '/api/orders/:path*',
    '/api/riders/:path*',
    '/api/products/:path*',
    '/api/admin/:path*',
  ],
};
