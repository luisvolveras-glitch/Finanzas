import crypto from 'crypto';

export const SESSION_COOKIE = 'finanzas_session';

export function sessionToken(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export function checkPassword(input: string): boolean {
  const real = process.env.APP_PASSWORD;
  if (!real) return false;
  return input === real;
}

export function isSessionValid(cookieValue: string | undefined): boolean {
  const real = process.env.APP_PASSWORD;
  if (!real || !cookieValue) return false;
  return cookieValue === sessionToken(real);
}

export function checkApiToken(header: string | null): boolean {
  const real = process.env.API_TOKEN;
  if (!real) return false;
  if (!header) return false;
  const match = header.match(/^Bearer\s+(.+)$/i);
  const token = match ? match[1] : header;
  return token === real;
}
