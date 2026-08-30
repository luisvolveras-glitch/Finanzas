import crypto from 'crypto';

export const SESSION_COOKIE = 'finanzas_session';

const SESSION_SECRET = process.env.SESSION_SECRET || process.env.API_TOKEN || 'insecure-dev-secret';

export function createSessionToken(userId: number): string {
  const payload = String(userId);
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
  return `${payload}.${sig}`;
}

export function verifySessionToken(token: string | undefined | null): number | null {
  if (!token) return null;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;

  const expected = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
  const sigBuffer = Buffer.from(sig, 'hex');
  const expectedBuffer = Buffer.from(expected, 'hex');
  if (sigBuffer.length !== expectedBuffer.length) return null;
  if (!crypto.timingSafeEqual(sigBuffer, expectedBuffer)) return null;

  const userId = Number(payload);
  return Number.isInteger(userId) ? userId : null;
}

export function checkApiToken(header: string | null): boolean {
  const real = process.env.API_TOKEN;
  if (!real) return false;
  if (!header) return false;
  const match = header.match(/^Bearer\s+(.+)$/i);
  const token = match ? match[1] : header;
  return token === real;
}
