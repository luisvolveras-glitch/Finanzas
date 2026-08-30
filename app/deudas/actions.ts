'use server';

import { revalidatePath } from 'next/cache';
import { addDebt, deleteDebt, updateDebt } from '@/lib/db';
import { toCents } from '@/lib/format';

function parseForm(formData: FormData) {
  const entity = String(formData.get('entity') || '').trim();
  const detail = String(formData.get('detail') || '').trim();
  const amount = Number(formData.get('amount'));
  const rateRaw = String(formData.get('interestRate') || '').trim();
  const termRaw = String(formData.get('termMonths') || '').trim();
  const interestRate = rateRaw ? Number(rateRaw) : null;
  const termMonths = termRaw ? Number(termRaw) : null;

  return { entity, detail, principalCents: toCents(amount), interestRate, termMonths };
}

function assertValid(data: ReturnType<typeof parseForm>) {
  if (!data.entity) {
    throw new Error('El nombre de la entidad es obligatorio');
  }
  if (!Number.isFinite(data.principalCents) || data.principalCents <= 0) {
    throw new Error('El monto debe ser mayor a 0');
  }
  if (data.interestRate !== null && !Number.isFinite(data.interestRate)) {
    throw new Error('La tasa de interés no es válida');
  }
  if (data.termMonths !== null && (!Number.isInteger(data.termMonths) || data.termMonths <= 0)) {
    throw new Error('El plazo debe ser un número de meses válido');
  }
}

export async function createDebt(formData: FormData) {
  const data = parseForm(formData);
  assertValid(data);
  addDebt(data);
  revalidatePath('/deudas');
  revalidatePath('/');
}

export async function editDebt(id: number, formData: FormData) {
  const data = parseForm(formData);
  assertValid(data);
  updateDebt(id, data);
  revalidatePath('/deudas');
  revalidatePath('/');
}

export async function removeDebt(id: number) {
  deleteDebt(id);
  revalidatePath('/deudas');
  revalidatePath('/');
}
