'use client';

import InvestmentModal, { type EditableInvestment } from './InvestmentModal';

export default function EditInvestmentButton({ investment }: { investment: EditableInvestment }) {
  return (
    <InvestmentModal
      initial={investment}
      trigger={(open) => (
        <button
          onClick={open}
          aria-label="Editar inversión"
          className="text-muted hover:text-ink px-1"
        >
          ✏️
        </button>
      )}
    />
  );
}
