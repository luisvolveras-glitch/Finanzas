import { removeTransaction } from '@/app/actions';
import { getCategory } from '@/lib/categories';
import { formatMoney } from '@/lib/format';
import type { Transaction } from '@/lib/db';
import EditButton from './EditButton';

export default function TransactionsList({ transactions }: { transactions: Transaction[] }) {
  if (transactions.length === 0) {
    return (
      <div className="bg-card rounded-xl2 shadow-soft p-6 text-center text-muted text-sm">
        No hay movimientos este mes todavía. Usa el botón + para agregar el primero.
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl2 shadow-soft divide-y divide-border">
      {transactions.map((tx) => {
        const cat = getCategory(tx.category);
        const isIncome = tx.type === 'income';
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
                }}
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
