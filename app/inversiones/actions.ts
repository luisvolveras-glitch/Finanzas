'use server';

import { revalidatePath } from 'next/cache';
import { addInvestment, deleteInvestment, updateInvestment, type Currency } from '@/lib/db';
import { resolveInvestmentCategoryId } from '@/lib/investmentCategories';
import { toCents } from '@/lib/format';
import { requireWorkspaceId } from '@/lib/session';

function parseForm(formData: FormData, workspaceId: number) {
  const category = resolveInvestmentCategoryId(String(formData.get('category') || ''));
  const name = String(formData.get('name') || '').trim();
  const amount = Number(formData.get('amount'));
  const rateRaw = String(formData.get('interestRate') || '').trim();
  const interestRate = rateRaw ? Number(rateRaw) : null;
  const date = String(formData.get('date') || '').slice(0, 10);
  const currencyRaw = String(formData.get('currency') || 'COP');
  const currency: Currency = currencyRaw === 'USD' ? 'USD' : 'COP';

  return {
    category,
    name,
    amountCents: toCents(amount),
    interestRate,
    date,
    workspaceId,
    currency,
  };
}

function assertValid(data: ReturnType<typeof parseForm>) {
  if (!data.name) {
    throw new Error('El nombre es obligatorio');
  }
  if (!Number.isFinite(data.amountCents) || data.amountCents <= 0) {
    throw new Error('El monto debe ser mayor a 0');
  }
  if (data.interestRate !== null && !Number.isFinite(data.interestRate)) {
    throw new Error('La tasa de interés no es válida');
  }
  if (!data.date) {
    throw new Error('La fecha es obligatoria');
  }
}

export async function createInvestment(formData: FormData) {
  const workspaceId = await requireWorkspaceId();
  const data = parseForm(formData, workspaceId);
  assertValid(data);
  addInvestment(data);
  revalidatePath('/inversiones');
  revalidatePath('/analisis');
}

export async function editInvestment(id: number, formData: FormData) {
  const workspaceId = await requireWorkspaceId();
  const data = parseForm(formData, workspaceId);
  assertValid(data);
  updateInvestment(id, workspaceId, data);
  revalidatePath('/inversiones');
  revalidatePath('/analisis');
}

export async function removeInvestment(id: number) {
  const workspaceId = await requireWorkspaceId();
  deleteInvestment(id, workspaceId);
  revalidatePath('/inversiones');
  revalidatePath('/analisis');
}
