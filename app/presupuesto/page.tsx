import {
  getAvailableMonths,
  getBudgetItemPaidTotal,
  getDebtPaidTotalForMonth,
  getDebtPaidTotalUpToMonth,
  listBudgetItems,
  listDebts,
} from '@/lib/db';
import { currentMonth, formatMoney } from '@/lib/format';
import { getCurrentUser } from '@/lib/session';
import AddBudgetButton from '@/components/AddBudgetButton';
import BudgetTable, { type BudgetRow } from '@/components/BudgetTable';
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
  const months = getAvailableMonths(workspaceId);

  const items = listBudgetItems(workspaceId);
  const debts = listDebts(workspaceId);

  const itemRows: BudgetRow[] = items.map((item) => ({
    key: `item-${item.id}`,
    name: item.name,
    detail: item.detail,
    frequency: item.frequency,
    amountCents: item.amount_cents,
    paidCents: getBudgetItemPaidTotal(item.id, workspaceId, month),
    itemId: item.id,
  }));

  const debtRows: BudgetRow[] = debts
    .map((debt): BudgetRow | null => {
      const paidUpToMonth = getDebtPaidTotalUpToMonth(debt.id, workspaceId, month);
      const remaining = debt.principal_cents - paidUpToMonth;
      if (remaining <= 0) return null;
      return {
        key: `debt-${debt.id}`,
        name: debt.entity,
        detail: debt.detail,
        frequency: 'Deuda',
        amountCents: remaining,
        paidCents: getDebtPaidTotalForMonth(debt.id, workspaceId, month),
      };
    })
    .filter((r): r is BudgetRow => r !== null);

  const rows = [...itemRows, ...debtRows];
  const totalBudgeted = rows.reduce((sum, r) => sum + r.amountCents, 0);
  const totalPaid = rows.reduce((sum, r) => sum + r.paidCents, 0);
  const totalPending = totalBudgeted - totalPaid;

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
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="px-1 text-sm font-medium text-muted">Gastos fijos y deudas</h2>
          <BudgetTable rows={rows} />
        </section>
      </div>

      <AddBudgetButton />
      <BottomNav />
    </main>
  );
}
