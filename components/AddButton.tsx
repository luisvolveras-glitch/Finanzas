'use client';

import TransactionModal, { type BudgetItemOption, type DebtOption } from './TransactionModal';

export default function AddButton({
  debts = [],
  budgetItems = [],
}: {
  debts?: DebtOption[];
  budgetItems?: BudgetItemOption[];
}) {
  return (
    <TransactionModal
      debts={debts}
      budgetItems={budgetItems}
      trigger={(open) => (
        <button
          onClick={open}
          aria-label="Agregar movimiento"
          className="fixed bottom-24 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-expense text-2xl text-white shadow-lg hover:brightness-105 transition"
        >
          +
        </button>
      )}
    />
  );
}
