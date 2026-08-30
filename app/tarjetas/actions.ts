'use server';

import { revalidatePath } from 'next/cache';
import {
  addCreditCard,
  addCreditCardPurchase,
  deleteCreditCard,
  deleteCreditCardPurchase,
  updateCreditCard,
  updateCreditCardPurchase,
} from '@/lib/db';
import { toCents } from '@/lib/format';
import { requireWorkspaceId } from '@/lib/session';

function revalidateAll() {
  revalidatePath('/tarjetas');
  revalidatePath('/presupuesto');
  revalidatePath('/analisis');
}

function parseCardForm(formData: FormData, workspaceId: number) {
  const name = String(formData.get('name') || '').trim();
  const lastFour = String(formData.get('lastFour') || '').trim();
  return { name, lastFour, workspaceId };
}

function assertValidCard(data: ReturnType<typeof parseCardForm>) {
  if (!data.name) {
    throw new Error('El nombre de la tarjeta es obligatorio');
  }
  if (data.lastFour && !/^\d{0,4}$/.test(data.lastFour)) {
    throw new Error('Los últimos dígitos deben ser solo números (máximo 4)');
  }
}

export async function createCard(formData: FormData) {
  const workspaceId = await requireWorkspaceId();
  const data = parseCardForm(formData, workspaceId);
  assertValidCard(data);
  addCreditCard(data);
  revalidateAll();
}

export async function editCard(id: number, formData: FormData) {
  const workspaceId = await requireWorkspaceId();
  const data = parseCardForm(formData, workspaceId);
  assertValidCard(data);
  updateCreditCard(id, workspaceId, data);
  revalidateAll();
}

export async function removeCard(id: number) {
  const workspaceId = await requireWorkspaceId();
  deleteCreditCard(id, workspaceId);
  revalidateAll();
}

function parsePurchaseForm(formData: FormData, workspaceId: number) {
  const cardId = Number(formData.get('cardId'));
  const detail = String(formData.get('detail') || '').trim();
  const amount = Number(formData.get('amount'));
  const installmentsRaw = String(formData.get('installments') || '1').trim();
  const installments = installmentsRaw ? Number(installmentsRaw) : 1;
  const date = String(formData.get('date') || '').slice(0, 10);

  return { cardId, detail, totalCents: toCents(amount), installments, date, workspaceId };
}

function assertValidPurchase(data: ReturnType<typeof parsePurchaseForm>) {
  if (!Number.isInteger(data.cardId) || data.cardId <= 0) {
    throw new Error('Selecciona una tarjeta');
  }
  if (!data.detail) {
    throw new Error('El detalle es obligatorio');
  }
  if (!Number.isFinite(data.totalCents) || data.totalCents <= 0) {
    throw new Error('El monto debe ser mayor a 0');
  }
  if (!Number.isInteger(data.installments) || data.installments <= 0) {
    throw new Error('Las cuotas deben ser un número entero mayor a 0');
  }
  if (!data.date) {
    throw new Error('La fecha es obligatoria');
  }
}

export async function createPurchase(formData: FormData) {
  const workspaceId = await requireWorkspaceId();
  const data = parsePurchaseForm(formData, workspaceId);
  assertValidPurchase(data);
  addCreditCardPurchase(data);
  revalidateAll();
}

export async function editPurchase(id: number, formData: FormData) {
  const workspaceId = await requireWorkspaceId();
  const data = parsePurchaseForm(formData, workspaceId);
  assertValidPurchase(data);
  updateCreditCardPurchase(id, workspaceId, data);
  revalidateAll();
}

export async function removePurchase(id: number) {
  const workspaceId = await requireWorkspaceId();
  deleteCreditCardPurchase(id, workspaceId);
  revalidateAll();
}
