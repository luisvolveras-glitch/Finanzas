import { NextRequest, NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { getBudgetPayments, getBudgetRows, getTotals } from '@/lib/db';
import { currentMonth, monthLabel } from '@/lib/format';
import { getCurrentUser } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }
  const workspaceId = user.workspace_id;

  const { searchParams } = new URL(req.url);
  const month = searchParams.get('month') || currentMonth();

  const rows = getBudgetRows(workspaceId, month);
  const payments = getBudgetPayments(workspaceId, month);
  const totalIncome = getTotals(workspaceId, month).income_cents;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Mis Finanzas';
  workbook.created = new Date();

  const presupuestoSheet = workbook.addWorksheet('Presupuesto');
  presupuestoSheet.columns = [
    { header: 'Nombre', key: 'name', width: 24 },
    { header: 'Detalle', key: 'detail', width: 32 },
    { header: 'Día / frecuencia', key: 'frequency', width: 20 },
    { header: 'Presupuestado', key: 'budgeted', width: 16 },
    { header: 'Pagado', key: 'paid', width: 16 },
    { header: 'Pendiente', key: 'pending', width: 16 },
  ];
  presupuestoSheet.getRow(1).font = { bold: true };
  for (const row of rows) {
    presupuestoSheet.addRow({
      name: row.name,
      detail: row.detail,
      frequency: row.frequency,
      budgeted: row.amountCents / 100,
      paid: row.paidCents / 100,
      pending: Math.max(0, row.amountCents - row.paidCents) / 100,
    });
  }
  const totalBudgeted = rows.reduce((sum, r) => sum + r.amountCents, 0);
  const totalPaid = rows.reduce((sum, r) => sum + r.paidCents, 0);
  const totalRow = presupuestoSheet.addRow({
    name: 'Total',
    budgeted: totalBudgeted / 100,
    paid: totalPaid / 100,
    pending: Math.max(0, totalBudgeted - totalPaid) / 100,
  });
  totalRow.font = { bold: true };
  presupuestoSheet.getColumn('budgeted').numFmt = '#,##0.00';
  presupuestoSheet.getColumn('paid').numFmt = '#,##0.00';
  presupuestoSheet.getColumn('pending').numFmt = '#,##0.00';

  const pagosSheet = workbook.addWorksheet('Pagos');
  pagosSheet.columns = [
    { header: 'Fecha', key: 'date', width: 14 },
    { header: 'Corresponde a', key: 'target', width: 24 },
    { header: 'Detalle del movimiento', key: 'detail', width: 32 },
    { header: 'Monto', key: 'amount', width: 16 },
  ];
  pagosSheet.getRow(1).font = { bold: true };
  for (const payment of payments) {
    pagosSheet.addRow({
      date: payment.date,
      target: payment.target,
      detail: payment.detail,
      amount: payment.amount_cents / 100,
    });
  }
  pagosSheet.getColumn('amount').numFmt = '#,##0.00';

  const resumenSheet = workbook.addWorksheet('Resumen');
  resumenSheet.columns = [
    { header: 'Concepto', key: 'concept', width: 28 },
    { header: 'Valor', key: 'value', width: 18 },
  ];
  resumenSheet.getRow(1).font = { bold: true };
  resumenSheet.addRow({ concept: 'Mes', value: monthLabel(month) });
  resumenSheet.addRow({ concept: 'Ingresos registrados', value: totalIncome / 100 });
  resumenSheet.addRow({ concept: 'Total presupuestado', value: totalBudgeted / 100 });
  resumenSheet.addRow({ concept: 'Total pagado', value: totalPaid / 100 });
  resumenSheet.addRow({ concept: 'Total pendiente', value: Math.max(0, totalBudgeted - totalPaid) / 100 });
  resumenSheet.getColumn('value').numFmt = '#,##0.00';

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="presupuesto-${month}.xlsx"`,
    },
  });
}
