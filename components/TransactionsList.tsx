import { removeTransaction } from '@/app/actions';
import { getCategory } from '@/lib/categories';
import { formatByCurrency } from '@/lib/format';
import type { Transaction } from '@/lib/db';
import type { BudgetItemOption, DebtOption } from './TransactionModal';
import EditButton from './EditButton';

export default function TransactionsList({
  transactions,
  debts = [],
  budgetItems = [],
}: {
  transactions: Transaction[];
  debts?: DebtOption[];
  budgetItems?: BudgetItemOption[];
}) {
  if (transactions.length === 0) {
    return (
      <div className="bg-card rounded-xl2 shadow-soft p-6 text-center text-muted text-sm">
        No hay movimientos este mes todavía. Usa el botón + para agregar el primero.
      </div>
    );
  }

  const debtsById = new Map(debts.map((d) => [d.id, d.label]));
  const budgetItemsById = new Map(budgetItems.map((b) => [b.id, b.label]));

  return (
    <div className="bg-card rounded-xl2 shadow-soft divide-y divide-border">
      {transactions.map((tx) => {
        const cat = getCategory(tx.category);
        const isIncome = tx.type === 'income';
        const debtLabel = tx.debt_id ? debtsById.get(tx.debt_id) : undefined;
        const budgetLabel = tx.budget_item_id ? budgetItemsById.get(tx.budget_item_id) : undefined;
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
              {budgetLabel && (
                <p className="text-xs text-accent truncate">🔗 Presupuesto: {budgetLabel}</p>
              )}
            </div>
            <p className={`font-semibold ${isIncome ? 'text-income' : 'text-expense'}`}>
              {isIncome ? '+' : '-'}
              {formatByCurrency(tx.amount_cents, tx.currency)}
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
                  budgetItemId: tx.budget_item_id,
                  currency: tx.currency,
                }}
                debts={debts}
                budgetItems={budgetItems}
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
