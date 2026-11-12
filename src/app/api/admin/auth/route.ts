import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_TTL_MS, passwordMatches, signAdminSession } from '@/lib/admin-session';
import { clientIp, rateLimitAllows } from '@/lib/rate-limit';

// Password attempts per IP per window, so the password cannot be guessed online.
const LOGIN_LIMIT = { scope: 'admin-login', limit: 10, windowSeconds: 15 * 60 };

export async function POST(request: NextRequest) {
  try {
    if (!(await rateLimitAllows({ ...LOGIN_LIMIT, ip: clientIp(request) }))) {
      return NextResponse.json({ error: 'Too many attempts, try again later' }, { status: 429 });
    }

    const { password } = await request.json();

    if (!process.env.ADMIN_PASSWORD) {
      console.error('ADMIN_PASSWORD environment variable is not set');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    if (passwordMatches(password)) {
      const response = NextResponse.json({ success: true });
      response.cookies.set(ADMIN_SESSION_COOKIE, signAdminSession(Date.now()), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: ADMIN_SESSION_TTL_MS / 1000,
        path: '/',
      });
      return response;
    }

    return NextResponse.json(
      { error: 'Invalid password' },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ authenticated: await isAdmin() });
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  });
  return response;
}
