'use client';

import BudgetModal from './BudgetModal';

export default function AddBudgetButton() {
  return (
    <BudgetModal
      trigger={(open) => (
        <button
          onClick={open}
          aria-label="Agregar ítem de presupuesto"
          className="fixed bottom-24 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-2xl text-white shadow-lg hover:brightness-105 transition"
        >
          +
        </button>
      )}
    />
  );
}
