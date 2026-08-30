'use server';

import { revalidatePath } from 'next/cache';
import { approveUser, rejectUser } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';

async function assertAdmin() {
  const user = await getCurrentUser();
  if (!user || !user.is_admin) {
    throw new Error('No autorizado');
  }
}

export async function approve(id: number) {
  await assertAdmin();
  approveUser(id);
  revalidatePath('/admin');
}

export async function reject(id: number) {
  await assertAdmin();
  rejectUser(id);
  revalidatePath('/admin');
}
