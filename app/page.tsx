import {
  getAvailableMonths,
  getCategoryTotals,
  getMonthlySummary,
  getTotals,
  listDebts,
  listTransactions,
} from '@/lib/db';
import { currentMonth, formatMoney } from '@/lib/format';
import { getCurrentUser } from '@/lib/session';
import MonthSelector from '@/components/MonthSelector';
import CategoryBars from '@/components/CategoryBars';
import TransactionsList from '@/components/TransactionsList';
import MonthlySummaryTable from '@/components/MonthlySummaryTable';
import CategoryTable from '@/components/CategoryTable';
import AddButton from '@/components/AddButton';
import BottomNav from '@/components/BottomNav';
import AccountHeaderLink from '@/components/AccountHeaderLink';
import { logout } from './login/actions';

export const dynamic = 'force-dynamic';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const params = await searchParams;
  const user = await getCurrentUser();
  const workspaceId = user!.workspace_id;
  const month = params.month || currentMonth();
  const months = getAvailableMonths(workspaceId);
  const totals = getTotals(workspaceId, month);
  const balance = totals.income_cents - totals.expense_cents;
  const transactions = listTransactions(workspaceId, { month, limit: 100 });
  const categoryTotals = getCategoryTotals(workspaceId, month);
  const monthlySummary = getMonthlySummary(workspaceId, 12);
  const debtOptions = listDebts(workspaceId).map((d) => ({
    id: d.id,
    label: d.detail ? `${d.entity} - ${d.detail}` : d.entity,
  }));

  return (
    <main className="min-h-screen pb-32">
      <div className="mx-auto max-w-md px-4 pt-8 space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-ink">Mis Finanzas</h1>
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
            <span className={`h-2 w-2 rounded-full ${balance >= 0 ? 'bg-income' : 'bg-expense'}`} />
            Balance
          </div>
          <p className="mt-1 text-4xl font-bold text-ink">{formatMoney(balance)}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-pillDark px-3 py-1.5 text-sm font-medium text-white">
              − {formatMoney(totals.expense_cents)}
            </span>
            <span className="rounded-full bg-income/10 px-3 py-1.5 text-sm font-medium text-income">
              + {formatMoney(totals.income_cents)}
            </span>
          </div>
        </section>

        <CategoryBars rows={categoryTotals} />

        <section className="space-y-3">
          <h2 className="px-1 text-sm font-medium text-muted">Movimientos</h2>
          <TransactionsList transactions={transactions} debts={debtOptions} />
        </section>

        <section className="space-y-3">
          <h2 className="px-1 text-sm font-medium text-muted">Resumen cruzado</h2>
          <MonthlySummaryTable rows={monthlySummary} />
          <CategoryTable rows={categoryTotals} />
        </section>
      </div>

      <AddButton debts={debtOptions} />
      <BottomNav />
    </main>
  );
}
