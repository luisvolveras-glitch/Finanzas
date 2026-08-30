'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createSessionToken, SESSION_COOKIE } from '@/lib/auth';
import { getUserByEmail } from '@/lib/db';
import { verifyPassword } from '@/lib/password';

export async function login(formData: FormData) {
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');
  const next = String(formData.get('next') || '/');

  const user = email ? getUserByEmail(email) : undefined;

  if (!user || !verifyPassword(password, user.password_hash)) {
    redirect(`/login?error=credenciales&next=${encodeURIComponent(next)}`);
  }

  if (user.status === 'pending') {
    redirect(`/login?error=pendiente&next=${encodeURIComponent(next)}`);
  }

  if (user.status === 'rejected') {
    redirect(`/login?error=rechazada&next=${encodeURIComponent(next)}`);
  }

  if (user.is_blocked) {
    redirect(`/login?error=bloqueada&next=${encodeURIComponent(next)}`);
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, createSessionToken(user.id), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  });

  redirect(next || '/');
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect('/login');
}
