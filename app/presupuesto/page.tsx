import Link from 'next/link';
import { getAvailableMonths, getBudgetRows, getTotals } from '@/lib/db';
import { addMonths, currentMonth, formatMoney, monthLabel, monthWindow } from '@/lib/format';
import { getCurrentUser } from '@/lib/session';
import AddBudgetButton from '@/components/AddBudgetButton';
import BudgetTable from '@/components/BudgetTable';
import MonthSelector from '@/components/MonthSelector';
import BottomNav from '@/components/BottomNav';
import AccountHeaderLink from '@/components/AccountHeaderLink';
import { logout } from '../login/actions';

export const dynamic = 'force-dynamic';

export default async function PresupuestoPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const params = await searchParams;
  const user = await getCurrentUser();
  const workspaceId = user!.workspace_id;
  const month = params.month || currentMonth();
  const nextMonth = addMonths(month, 1);

  // El presupuesto se repite mes a mes aunque todavía no haya movimientos
  // registrados en ese mes, así que el selector no puede depender solo de
  // getAvailableMonths (que solo ve meses con movimientos reales). Se arma
  // una ventana amplia de meses navegables alrededor de hoy, sumando
  // cualquier mes con movimientos que quede fuera de esa ventana.
  const months = Array.from(
    new Set([...monthWindow(currentMonth(), 12, 12), ...getAvailableMonths(workspaceId)])
  ).sort((a, b) => (a < b ? 1 : -1));

  const rows = getBudgetRows(workspaceId, month);
  const totalBudgeted = rows.reduce((sum, r) => sum + r.amountCents, 0);
  const totalPaid = rows.reduce((sum, r) => sum + r.paidCents, 0);
  const totalPending = totalBudgeted - totalPaid;
  const totalIncome = getTotals(workspaceId, month).income_cents;

  return (
    <main className="min-h-screen pb-32">
      <div className="mx-auto max-w-md px-4 pt-8 space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-ink">Presupuesto</h1>
          <div className="flex items-center gap-2">
            <MonthSelector month={month} months={months} />
            <AccountHeaderLink isAdmin={user!.is_admin === 1} />
            <form action={logout}>
              <button className="text-muted text-lg" aria-label="Cerrar sesión">
                ⏻
              </button>
            </form>
          </div>
        </div>

        <section className="bg-card rounded-xl2 shadow-soft p-6">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted">
            <span className="h-2 w-2 rounded-full bg-accent" />
            Pendiente por pagar este mes
          </div>
          <p className="mt-1 text-4xl font-bold text-ink">{formatMoney(totalPending)}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-pillDark px-3 py-1.5 text-sm font-medium text-white">
              Presupuestado {formatMoney(totalBudgeted)}
            </span>
            <span className="rounded-full bg-income/10 px-3 py-1.5 text-sm font-medium text-income">
              Pagado {formatMoney(totalPaid)}
            </span>
            <span className="rounded-full bg-accent/10 px-3 py-1.5 text-sm font-medium text-accent">
              Ingresos {formatMoney(totalIncome)}
            </span>
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between px-1 gap-2">
            <h2 className="text-sm font-medium text-muted">Gastos fijos y deudas</h2>
            <a
              href={`/api/export/presupuesto?month=${month}`}
              className="shrink-0 rounded-full bg-accent px-3 py-1.5 text-xs font-medium text-white hover:brightness-105 transition"
            >
              Exportar a Excel ⬇
            </a>
          </div>
          <div className="flex justify-end px-1">
            <Link
              href={`/presupuesto?month=${nextMonth}`}
              className="shrink-0 rounded-full bg-pillDark px-3 py-1.5 text-xs font-medium text-white hover:brightness-105 transition"
            >
              Duplicar para {monthLabel(nextMonth)} →
            </Link>
          </div>
          <BudgetTable rows={rows} />
        </section>
      </div>

      <AddBudgetButton />
      <BottomNav />
    </main>
  );
}
