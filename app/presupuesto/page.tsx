import { getBudgetTotal, listBudgetItems } from '@/lib/db';
import { formatMoney } from '@/lib/format';
import AddBudgetButton from '@/components/AddBudgetButton';
import BudgetTable from '@/components/BudgetTable';
import BottomNav from '@/components/BottomNav';
import { logout } from '../login/actions';

export const dynamic = 'force-dynamic';

export default function PresupuestoPage() {
  const items = listBudgetItems();
  const total = getBudgetTotal();

  return (
    <main className="min-h-screen pb-32">
      <div className="mx-auto max-w-md px-4 pt-8 space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-ink">Presupuesto</h1>
          <form action={logout}>
            <button className="text-muted text-lg" aria-label="Cerrar sesión">
              ⏻
            </button>
          </form>
        </div>

        <section className="bg-card rounded-xl2 shadow-soft p-6">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted">
            <span className="h-2 w-2 rounded-full bg-accent" />
            Total presupuestado al mes
          </div>
          <p className="mt-1 text-4xl font-bold text-ink">{formatMoney(total)}</p>
        </section>

        <section className="space-y-3">
          <h2 className="px-1 text-sm font-medium text-muted">Gastos fijos y deudas</h2>
          <BudgetTable items={items} />
        </section>
      </div>

      <AddBudgetButton />
      <BottomNav />
    </main>
  );
}
