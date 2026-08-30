'use client';

import TransactionModal, {
  type BudgetItemOption,
  type DebtOption,
  type EditableTransaction,
} from './TransactionModal';

export default function EditButton({
  transaction,
  debts = [],
  budgetItems = [],
}: {
  transaction: EditableTransaction;
  debts?: DebtOption[];
  budgetItems?: BudgetItemOption[];
}) {
  return (
    <TransactionModal
      initial={transaction}
      debts={debts}
      budgetItems={budgetItems}
      trigger={(open) => (
        <button
          onClick={open}
          aria-label="Editar movimiento"
          className="text-muted hover:text-ink px-1"
        >
          ✏️
        </button>
      )}
    />
  );
}
