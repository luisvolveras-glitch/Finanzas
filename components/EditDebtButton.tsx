'use client';

import DebtModal, { type EditableDebt } from './DebtModal';

export default function EditDebtButton({ debt }: { debt: EditableDebt }) {
  return (
    <DebtModal
      initial={debt}
      trigger={(open) => (
        <button onClick={open} aria-label="Editar deuda" className="text-muted hover:text-ink px-1">
          ✏️
        </button>
      )}
    />
  );
}
