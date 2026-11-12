import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from './admin-session';

// The one admin check every admin route uses.
export async function isAdmin(): Promise<boolean> {
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  return verifyAdminSession(token, Date.now());
}

export const unauthorized = () => NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
