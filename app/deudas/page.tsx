import { getDebtPaidTotal, getDebtPayments, listDebts } from '@/lib/db';
import { formatMoney } from '@/lib/format';
import AddDebtButton from '@/components/AddDebtButton';
import DebtCard from '@/components/DebtCard';
import BottomNav from '@/components/BottomNav';
import { logout } from '../login/actions';

export const dynamic = 'force-dynamic';

export default function DeudasPage() {
  const debts = listDebts();
  const rows = debts.map((debt) => {
    const paidTotal = getDebtPaidTotal(debt.id);
    const payments = getDebtPayments(debt.id);
    const remaining = Math.max(debt.principal_cents - paidTotal, 0);
    return { debt, paidTotal, payments, remaining };
  });
  const totalPending = rows.reduce((sum, r) => sum + r.remaining, 0);

  return (
    <main className="min-h-screen pb-32">
      <div className="mx-auto max-w-md px-4 pt-8 space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-ink">Deudas</h1>
          <form action={logout}>
            <button className="text-muted text-lg" aria-label="Cerrar sesión">
              ⏻
            </button>
          </form>
        </div>

        <section className="bg-card rounded-xl2 shadow-soft p-6">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted">
            <span className="h-2 w-2 rounded-full bg-expense" />
            Deuda total pendiente
          </div>
          <p className="mt-1 text-4xl font-bold text-ink">{formatMoney(totalPending)}</p>
          <p className="mt-2 text-xs text-muted">
            El saldo se descuenta solo cuando registras un gasto en Movimientos marcado como pago
            de esa deuda.
          </p>
        </section>

        <section className="space-y-3">
          {rows.length === 0 ? (
            <div className="bg-card rounded-xl2 shadow-soft p-6 text-center text-muted text-sm">
              Aún no has agregado deudas. Usa el botón + para agregar la primera.
            </div>
          ) : (
            rows.map(({ debt, paidTotal, payments }) => (
              <DebtCard key={debt.id} debt={debt} paidTotal={paidTotal} payments={payments} />
            ))
          )}
        </section>
      </div>

      <AddDebtButton />
      <BottomNav />
    </main>
  );
}
