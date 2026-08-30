'use server';

import { revalidatePath } from 'next/cache';
import { addBudgetItem, deleteBudgetItem, updateBudgetItem } from '@/lib/db';
import { toCents } from '@/lib/format';
import { requireWorkspaceId } from '@/lib/session';

function parseForm(formData: FormData, workspaceId: number) {
  const name = String(formData.get('name') || '').trim();
  const detail = String(formData.get('detail') || '').trim();
  const frequency = String(formData.get('frequency') || '').trim();
  const amount = Number(formData.get('amount'));

  return { name, detail, frequency, amountCents: toCents(amount), workspaceId };
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
  const workspaceId = await requireWorkspaceId();
  const data = parseForm(formData, workspaceId);
  assertValid(data);
  addBudgetItem(data);
  revalidatePath('/presupuesto');
  revalidatePath('/analisis');
}

export async function editBudgetItem(id: number, formData: FormData) {
  const workspaceId = await requireWorkspaceId();
  const data = parseForm(formData, workspaceId);
  assertValid(data);
  updateBudgetItem(id, workspaceId, data);
  revalidatePath('/presupuesto');
  revalidatePath('/analisis');
}

export async function removeBudgetItem(id: number) {
  const workspaceId = await requireWorkspaceId();
  deleteBudgetItem(id, workspaceId);
  revalidatePath('/presupuesto');
  revalidatePath('/analisis');
}
