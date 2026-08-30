'use client';

import TransactionModal, { type EditableTransaction } from './TransactionModal';

export default function EditButton({ transaction }: { transaction: EditableTransaction }) {
  return (
    <TransactionModal
      initial={transaction}
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
