'use client';

import TransactionModal, { type DebtOption, type EditableTransaction } from './TransactionModal';

export default function EditButton({
  transaction,
  debts = [],
}: {
  transaction: EditableTransaction;
  debts?: DebtOption[];
}) {
  return (
    <TransactionModal
      initial={transaction}
      debts={debts}
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
