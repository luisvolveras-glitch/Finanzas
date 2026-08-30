import { NextRequest, NextResponse } from 'next/server';
import { checkApiToken } from '@/lib/auth';
import { addTransaction, getAdminWorkspaceId, getTotals, listTransactions } from '@/lib/db';
import { resolveCategoryId } from '@/lib/categories';
import { toCents, todayISO } from '@/lib/format';

export const dynamic = 'force-dynamic';

function unauthorized() {
  return NextResponse.json({ ok: false, error: 'No autorizado' }, { status: 401 });
}

function noAdminWorkspace() {
  return NextResponse.json(
    { ok: false, error: 'Todavía no hay una cuenta admin configurada en la app' },
    { status: 500 }
  );
}

export async function POST(req: NextRequest) {
  if (!checkApiToken(req.headers.get('authorization'))) {
    return unauthorized();
  }

  const workspaceId = getAdminWorkspaceId();
  if (!workspaceId) return noAdminWorkspace();

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'JSON inválido' }, { status: 400 });
  }

  const type = String(body.type || '').toLowerCase();
  if (type !== 'income' && type !== 'expense') {
    return NextResponse.json(
      { ok: false, error: "El campo 'type' debe ser 'income' o 'expense'" },
      { status: 400 }
    );
  }

  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json(
      { ok: false, error: "El campo 'amount' debe ser un número mayor a 0" },
      { status: 400 }
    );
  }

  const detail = String(body.detail || '').trim();
  if (!detail) {
    return NextResponse.json(
      { ok: false, error: "El campo 'detail' es obligatorio" },
      { status: 400 }
    );
  }

  const category = resolveCategoryId(type, body.category ? String(body.category) : undefined);
  const date = body.date ? String(body.date).slice(0, 10) : todayISO();

  const tx = addTransaction({
    type,
    amountCents: toCents(amount),
    detail,
    category,
    date,
    debtId: null,
    budgetItemId: null,
    workspaceId,
    currency: 'COP',
  });

  const totals = getTotals(workspaceId);

  return NextResponse.json({
    ok: true,
    transaction: {
      id: tx.id,
      type: tx.type,
      amount: tx.amount_cents / 100,
      detail: tx.detail,
      category: tx.category,
      date: tx.date,
    },
    balance: (totals.income_cents - totals.expense_cents) / 100,
  });
}

export async function GET(req: NextRequest) {
  if (!checkApiToken(req.headers.get('authorization'))) {
    return unauthorized();
  }

  const workspaceId = getAdminWorkspaceId();
  if (!workspaceId) return noAdminWorkspace();

  const { searchParams } = new URL(req.url);
  const month = searchParams.get('month') || undefined;
  const limitParam = searchParams.get('limit');
  const limit = limitParam ? Number(limitParam) : 20;

  const transactions = listTransactions(workspaceId, { month, limit });
  const totals = getTotals(workspaceId, month);

  return NextResponse.json({
    ok: true,
    totals: {
      income: totals.income_cents / 100,
      expense: totals.expense_cents / 100,
      balance: (totals.income_cents - totals.expense_cents) / 100,
    },
    transactions: transactions.map((t) => ({
      id: t.id,
      type: t.type,
      amount: t.amount_cents / 100,
      detail: t.detail,
      category: t.category,
      date: t.date,
    })),
  });
}
