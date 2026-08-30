export type IconProps = { className?: string };

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  viewBox: '0 0 24 24',
};

export function BudgetIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M6 3h9l3 3v15a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
      <path d="M15 3v3h3" />
      <path d="M8 10h6" />
      <path d="M8 13.5h4" />
      <circle cx="15.5" cy="17" r="2.3" />
      <path d="m14.6 17 .6.7 1.2-1.4" />
    </svg>
  );
}

export function DebtIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <path d="M6.5 9.5 10 13l2.5-2.5L17.5 15.5" />
      <path d="M14 15.5h3.5V12" />
    </svg>
  );
}

export function CreditCardIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      <path d="M2.5 9.5h19" />
      <path d="M6 15h4" />
    </svg>
  );
}

export function TransactionIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <rect x="2.5" y="5.5" width="14" height="9.5" rx="2.2" />
      <path d="M5 9.2h9" />
      <rect x="7.5" y="9" width="14" height="9.5" rx="2.2" />
      <path d="M10 12.7h9" />
    </svg>
  );
}

export function InvestmentIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M4 20V13" />
      <path d="M9.5 20V9" />
      <path d="M15 20v-7" />
      <path d="M20 20V5" />
      <path d="m4 11 5-5 4 3 7-7" />
      <path d="M15 2h5v5" />
    </svg>
  );
}

export function AnalysisIcon({ className }: IconProps) {
  return (
    <svg className={className} {...base}>
      <path d="M5 19V13" />
      <path d="M10 19V9" />
      <path d="M15 19v-4" />
      <circle cx="16" cy="8" r="4.2" />
      <path d="m19.2 11.2 2.3 2.3" />
    </svg>
  );
}
