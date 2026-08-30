'use server';

import { createUser, createWorkspace, getUserByEmail } from '@/lib/db';
import { hashPassword } from '@/lib/password';

export async function signup(formData: FormData) {
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const password = String(formData.get('password') || '');
  const confirmPassword = String(formData.get('confirmPassword') || '');
  const firstName = String(formData.get('firstName') || '').trim();
  const lastName = String(formData.get('lastName') || '').trim();
  const phone = String(formData.get('phone') || '').trim();
  const reason = String(formData.get('reason') || '').trim();
  const wantsShare = formData.get('share') === 'on';
  const shareWithEmail = String(formData.get('shareWithEmail') || '').trim().toLowerCase();

  if (!email || !password || !firstName || !lastName || !phone) {
    throw new Error('Completa correo, contraseña, nombres, apellidos y celular');
  }
  if (password.length < 8) {
    throw new Error('La contraseña debe tener al menos 8 caracteres');
  }
  if (password !== confirmPassword) {
    throw new Error('Las contraseñas no coinciden');
  }
  if (getUserByEmail(email)) {
    throw new Error('Ya existe una cuenta con ese correo');
  }

  let workspaceId: number;
  if (wantsShare) {
    if (!shareWithEmail) {
      throw new Error('Escribe el correo de la cuenta con la que quieres compartir');
    }
    const target = getUserByEmail(shareWithEmail);
    if (!target || target.status !== 'approved') {
      throw new Error('No encontramos una cuenta aprobada con ese correo para compartir');
    }
    workspaceId = target.workspace_id;
  } else {
    workspaceId = createWorkspace(`${firstName} ${lastName}`.trim());
  }

  createUser({
    email,
    passwordHash: hashPassword(password),
    firstName,
    lastName,
    phone,
    reason,
    workspaceId,
  });
}
