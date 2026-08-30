import { removeDebt } from '@/app/deudas/actions';
import { formatMoney } from '@/lib/format';
import type { Debt, Transaction } from '@/lib/db';
import EditDebtButton from './EditDebtButton';

export default function DebtCard({
  debt,
  paidTotal,
  payments,
}: {
  debt: Debt;
  paidTotal: number;
  payments: Transaction[];
}) {
  const remaining = Math.max(debt.principal_cents - paidTotal, 0);
  const isPaidOff = remaining === 0;

  return (
    <div className="bg-card rounded-xl2 shadow-soft p-6 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-ink truncate">{debt.entity}</p>
          {debt.detail && <p className="text-sm text-muted truncate">{debt.detail}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <EditDebtButton
            debt={{
              id: debt.id,
              entity: debt.entity,
              detail: debt.detail,
              amount: debt.principal_cents / 100,
              interestRate: debt.interest_rate,
              termMonths: debt.term_months,
            }}
          />
          <form action={removeDebt.bind(null, debt.id)}>
            <button aria-label="Eliminar deuda" className="text-muted hover:text-expense px-1">
              🗑️
            </button>
          </form>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        {debt.interest_rate !== null && (
          <span className="rounded-full bg-bg px-3 py-1 font-medium text-muted">
            {debt.interest_rate.toFixed(2)}% interés
          </span>
        )}
        {debt.term_months !== null && (
          <span className="rounded-full bg-bg px-3 py-1 font-medium text-muted">
            Plazo: {debt.term_months} {debt.term_months === 1 ? 'mes' : 'meses'}
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted">Original</p>
          <p className="text-sm font-semibold text-ink">{formatMoney(debt.principal_cents)}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted">Pagado</p>
          <p className="text-sm font-semibold text-income">{formatMoney(paidTotal)}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted">Saldo</p>
          <p className={`text-sm font-semibold ${isPaidOff ? 'text-income' : 'text-expense'}`}>
            {isPaidOff ? '¡Pagada!' : formatMoney(remaining)}
          </p>
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-muted mb-2">Historial de pagos</p>
        {payments.length === 0 ? (
          <p className="text-xs text-muted">
            Aún no hay pagos registrados. Cuando registres un gasto marcado como pago de esta
            deuda, aparecerá aquí.
          </p>
        ) : (
          <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
            {payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-3 py-2 text-xs">
                <div className="min-w-0">
                  <p className="truncate text-ink">{p.detail}</p>
                  <p className="text-muted">{p.date}</p>
                </div>
                <p className="font-medium text-expense">− {formatMoney(p.amount_cents)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
