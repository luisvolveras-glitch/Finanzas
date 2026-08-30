import { removeInvestment } from '@/app/inversiones/actions';
import { getInvestmentCategory } from '@/lib/investmentCategories';
import { formatByCurrency } from '@/lib/format';
import type { Investment } from '@/lib/db';
import EditInvestmentButton from './EditInvestmentButton';

export default function InvestmentsList({ investments }: { investments: Investment[] }) {
  if (investments.length === 0) {
    return (
      <div className="bg-card rounded-xl2 shadow-soft p-6 text-center text-muted text-sm">
        Aún no has registrado inversiones o ahorros. Usa el botón + para agregar el primero.
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl2 shadow-soft divide-y divide-border">
      {investments.map((inv) => {
        const cat = getInvestmentCategory(inv.category);
        return (
          <div key={inv.id} className="flex items-center gap-3 px-5 py-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bg text-lg">
              {cat.icon}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-ink">{inv.name}</p>
              <p className="text-xs text-muted">
                {cat.label} · {inv.date}
                {inv.interest_rate !== null ? ` · ${inv.interest_rate.toFixed(2)}% anual` : ''}
              </p>
            </div>
            <p className="font-semibold text-accent">
              {formatByCurrency(inv.amount_cents, inv.currency)}
            </p>
            <div className="flex items-center gap-1">
              <EditInvestmentButton
                investment={{
                  id: inv.id,
                  category: inv.category,
                  name: inv.name,
                  amount: inv.amount_cents / 100,
                  interestRate: inv.interest_rate,
                  date: inv.date,
                  currency: inv.currency,
                }}
              />
              <form action={removeInvestment.bind(null, inv.id)}>
                <button aria-label="Eliminar inversión" className="text-muted hover:text-expense px-1">
                  🗑️
                </button>
              </form>
            </div>
          </div>
        );
      })}
    </div>
  );
}
