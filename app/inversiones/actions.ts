'use server';

import { revalidatePath } from 'next/cache';
import { addInvestment, deleteInvestment, updateInvestment } from '@/lib/db';
import { resolveInvestmentCategoryId } from '@/lib/investmentCategories';
import { toCents } from '@/lib/format';

function parseForm(formData: FormData) {
  const category = resolveInvestmentCategoryId(String(formData.get('category') || ''));
  const name = String(formData.get('name') || '').trim();
  const amount = Number(formData.get('amount'));
  const rateRaw = String(formData.get('interestRate') || '').trim();
  const interestRate = rateRaw ? Number(rateRaw) : null;
  const date = String(formData.get('date') || '').slice(0, 10);

  return { category, name, amountCents: toCents(amount), interestRate, date };
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
  const data = parseForm(formData);
  assertValid(data);
  addInvestment(data);
  revalidatePath('/inversiones');
  revalidatePath('/analisis');
}

export async function editInvestment(id: number, formData: FormData) {
  const data = parseForm(formData);
  assertValid(data);
  updateInvestment(id, data);
  revalidatePath('/inversiones');
  revalidatePath('/analisis');
}

export async function removeInvestment(id: number) {
  deleteInvestment(id);
  revalidatePath('/inversiones');
  revalidatePath('/analisis');
}
