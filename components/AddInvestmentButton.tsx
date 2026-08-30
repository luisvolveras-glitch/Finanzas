'use client';

import InvestmentModal from './InvestmentModal';

export default function AddInvestmentButton() {
  return (
    <InvestmentModal
      trigger={(open) => (
        <button
          onClick={open}
          aria-label="Agregar inversión"
          className="fixed bottom-24 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-2xl text-white shadow-lg hover:brightness-105 transition"
        >
          +
        </button>
      )}
    />
  );
}
