'use server';

import { revalidatePath } from 'next/cache';
import {
  approveUser,
  blockUser,
  getUserById,
  rejectUser,
  setUserPasswordHash,
  unblockUser,
} from '@/lib/db';
import { hashPassword, verifyPassword } from '@/lib/password';
import { getCurrentUser } from '@/lib/session';

async function assertAdmin() {
  const user = await getCurrentUser();
  if (!user || !user.is_admin) {
    throw new Error('No autorizado');
  }
  return user;
}

export async function changeOwnPassword(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error('No autenticado');

  const currentPassword = String(formData.get('currentPassword') || '');
  const newPassword = String(formData.get('newPassword') || '');
  const confirmPassword = String(formData.get('confirmPassword') || '');

  if (!verifyPassword(currentPassword, user.password_hash)) {
    throw new Error('Tu contraseña actual no es correcta');
  }
  if (newPassword.length < 8) {
    throw new Error('La nueva contraseña debe tener al menos 8 caracteres');
  }
  if (newPassword !== confirmPassword) {
    throw new Error('Las contraseñas nuevas no coinciden');
  }

  setUserPasswordHash(user.id, hashPassword(newPassword));
  revalidatePath('/cuenta');
}

export async function adminApprove(id: number) {
  await assertAdmin();
  approveUser(id);
  revalidatePath('/cuenta');
}

export async function adminReject(id: number) {
  await assertAdmin();
  rejectUser(id);
  revalidatePath('/cuenta');
}

export async function adminBlock(id: number) {
  const admin = await assertAdmin();
  if (admin.id === id) {
    throw new Error('No puedes bloquear tu propia cuenta');
  }
  blockUser(id);
  revalidatePath('/cuenta');
}

export async function adminUnblock(id: number) {
  await assertAdmin();
  unblockUser(id);
  revalidatePath('/cuenta');
}

export async function adminResetPassword(id: number, formData: FormData) {
  await assertAdmin();
  const target = getUserById(id);
  if (!target) throw new Error('Usuario no encontrado');

  const newPassword = String(formData.get('newPassword') || '');
  if (newPassword.length < 8) {
    throw new Error('La nueva contraseña debe tener al menos 8 caracteres');
  }

  setUserPasswordHash(id, hashPassword(newPassword));
  revalidatePath('/cuenta');
}
