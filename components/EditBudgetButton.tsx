'use client';

import BudgetModal, { type EditableBudgetItem } from './BudgetModal';

export default function EditBudgetButton({ item }: { item: EditableBudgetItem }) {
  return (
    <BudgetModal
      initial={item}
      trigger={(open) => (
        <button onClick={open} aria-label="Editar ítem" className="text-muted hover:text-ink px-1">
          ✏️
        </button>
      )}
    />
  );
}
