'use server';

import { revalidatePath } from 'next/cache';
import { addTransaction, deleteTransaction, updateTransaction } from '@/lib/db';
import { resolveCategoryId, type TxType } from '@/lib/categories';
import { toCents } from '@/lib/format';
import { requireWorkspaceId } from '@/lib/session';

function parseForm(formData: FormData, workspaceId: number) {
  const type = String(formData.get('type') || '') as TxType;
  const amount = Number(formData.get('amount'));
  const detail = String(formData.get('detail') || '').trim();
  const categoryInput = String(formData.get('category') || '');
  const date = String(formData.get('date') || '').slice(0, 10);
  const category = resolveCategoryId(type, categoryInput);
  const debtIdRaw = String(formData.get('debtId') || '').trim();
  const debtId = type === 'expense' && debtIdRaw ? Number(debtIdRaw) : null;

  return { type, amountCents: toCents(amount), detail, category, date, debtId, workspaceId };
}

function assertValid(data: ReturnType<typeof parseForm>) {
  if (data.type !== 'income' && data.type !== 'expense') {
    throw new Error('Tipo inválido');
  }
  if (!data.detail) {
    throw new Error('El detalle es obligatorio');
  }
  if (!Number.isFinite(data.amountCents) || data.amountCents <= 0) {
    throw new Error('El monto debe ser mayor a 0');
  }
  if (!data.date) {
    throw new Error('La fecha es obligatoria');
  }
}

export async function createTransaction(formData: FormData) {
  const workspaceId = await requireWorkspaceId();
  const data = parseForm(formData, workspaceId);
  assertValid(data);
  addTransaction(data);
  revalidatePath('/');
  revalidatePath('/deudas');
  revalidatePath('/analisis');
}

export async function editTransaction(id: number, formData: FormData) {
  const workspaceId = await requireWorkspaceId();
  const data = parseForm(formData, workspaceId);
  assertValid(data);
  updateTransaction(id, workspaceId, data);
  revalidatePath('/');
  revalidatePath('/deudas');
  revalidatePath('/analisis');
}

export async function removeTransaction(id: number) {
  const workspaceId = await requireWorkspaceId();
  deleteTransaction(id, workspaceId);
  revalidatePath('/');
  revalidatePath('/deudas');
  revalidatePath('/analisis');
}
