import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(req) {
  const token = req.cookies.get('token')?.value;

  if (!token || typeof token !== 'string') {
    console.log('No valid token found, redirecting to login.');
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    req.userId = payload.userId; // Menyimpan userId dari token ke request
  } catch (error) {
    console.error('JWT verification failed:', error); // Error log
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/'], // Ganti dengan path yang perlu dilindungi
};
