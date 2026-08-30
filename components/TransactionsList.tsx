import { removeTransaction } from '@/app/actions';
import { getCategory } from '@/lib/categories';
import { formatMoney } from '@/lib/format';
import type { Transaction } from '@/lib/db';
import type { DebtOption } from './TransactionModal';
import EditButton from './EditButton';

export default function TransactionsList({
  transactions,
  debts = [],
}: {
  transactions: Transaction[];
  debts?: DebtOption[];
}) {
  if (transactions.length === 0) {
    return (
      <div className="bg-card rounded-xl2 shadow-soft p-6 text-center text-muted text-sm">
        No hay movimientos este mes todavía. Usa el botón + para agregar el primero.
      </div>
    );
  }

  const debtsById = new Map(debts.map((d) => [d.id, d.label]));

  return (
    <div className="bg-card rounded-xl2 shadow-soft divide-y divide-border">
      {transactions.map((tx) => {
        const cat = getCategory(tx.category);
        const isIncome = tx.type === 'income';
        const debtLabel = tx.debt_id ? debtsById.get(tx.debt_id) : undefined;
        return (
          <div key={tx.id} className="flex items-center gap-3 px-5 py-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bg text-lg">
              {cat.icon}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-ink">{tx.detail}</p>
              <p className="text-xs text-muted">
                {cat.label} · {tx.date}
              </p>
              {debtLabel && (
                <p className="text-xs text-expense truncate">🔗 Pago de deuda: {debtLabel}</p>
              )}
            </div>
            <p className={`font-semibold ${isIncome ? 'text-income' : 'text-expense'}`}>
              {isIncome ? '+' : '-'}
              {formatMoney(tx.amount_cents)}
            </p>
            <div className="flex items-center gap-1">
              <EditButton
                transaction={{
                  id: tx.id,
                  type: tx.type,
                  amount: tx.amount_cents / 100,
                  detail: tx.detail,
                  category: tx.category,
                  date: tx.date,
                  debtId: tx.debt_id,
                }}
                debts={debts}
              />
              <form action={removeTransaction.bind(null, tx.id)}>
                <button aria-label="Eliminar movimiento" className="text-muted hover:text-expense px-1">
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
