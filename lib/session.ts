import { headers } from 'next/headers';
import { getUserById, type User } from './db';

export async function getCurrentUser(): Promise<User | null> {
  const h = await headers();
  const idRaw = h.get('x-user-id');
  if (!idRaw) return null;
  const id = Number(idRaw);
  if (!Number.isInteger(id)) return null;
  return getUserById(id) ?? null;
}

export async function requireWorkspaceId(): Promise<number> {
  const user = await getCurrentUser();
  if (!user) throw new Error('No autenticado');
  return user.workspace_id;
}
