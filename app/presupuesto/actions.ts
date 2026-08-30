'use server';

import { revalidatePath } from 'next/cache';
import { addBudgetItem, deleteBudgetItem, updateBudgetItem } from '@/lib/db';
import { toCents } from '@/lib/format';

function parseForm(formData: FormData) {
  const name = String(formData.get('name') || '').trim();
  const detail = String(formData.get('detail') || '').trim();
  const frequency = String(formData.get('frequency') || '').trim();
  const amount = Number(formData.get('amount'));

  return { name, detail, frequency, amountCents: toCents(amount) };
}

function assertValid(data: ReturnType<typeof parseForm>) {
  if (!data.name) {
    throw new Error('El nombre es obligatorio');
  }
  if (!Number.isFinite(data.amountCents) || data.amountCents <= 0) {
    throw new Error('El monto debe ser mayor a 0');
  }
}

export async function createBudgetItem(formData: FormData) {
  const data = parseForm(formData);
  assertValid(data);
  addBudgetItem(data);
  revalidatePath('/presupuesto');
  revalidatePath('/analisis');
}

export async function editBudgetItem(id: number, formData: FormData) {
  const data = parseForm(formData);
  assertValid(data);
  updateBudgetItem(id, data);
  revalidatePath('/presupuesto');
  revalidatePath('/analisis');
}

export async function removeBudgetItem(id: number) {
  deleteBudgetItem(id);
  revalidatePath('/presupuesto');
  revalidatePath('/analisis');
}
