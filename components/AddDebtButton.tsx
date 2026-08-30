'use client';

import DebtModal from './DebtModal';

export default function AddDebtButton() {
  return (
    <DebtModal
      trigger={(open) => (
        <button
          onClick={open}
          aria-label="Agregar deuda"
          className="fixed bottom-24 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-expense text-2xl text-white shadow-lg hover:brightness-105 transition"
        >
          +
        </button>
      )}
    />
  );
}
