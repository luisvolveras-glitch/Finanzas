'use client';

import TransactionModal, {
  type BudgetItemOption,
  type CardLinkOption,
  type DebtOption,
  type EditableTransaction,
} from './TransactionModal';

export default function EditButton({
  transaction,
  debts = [],
  budgetItems = [],
  cards = [],
}: {
  transaction: EditableTransaction;
  debts?: DebtOption[];
  budgetItems?: BudgetItemOption[];
  cards?: CardLinkOption[];
}) {
  return (
    <TransactionModal
      initial={transaction}
      debts={debts}
      budgetItems={budgetItems}
      cards={cards}
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
