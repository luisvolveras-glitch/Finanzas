'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  AnalysisIcon,
  BudgetIcon,
  DebtIcon,
  InvestmentIcon,
  TransactionIcon,
  type IconProps,
} from './icons/NavIcons';

const TABS: { href: string; label: string; Icon: (props: IconProps) => React.ReactElement }[] = [
  { href: '/presupuesto', label: 'Presupuesto', Icon: BudgetIcon },
  { href: '/deudas', label: 'Deudas', Icon: DebtIcon },
  { href: '/', label: 'Movimientos', Icon: TransactionIcon },
  { href: '/inversiones', label: 'Inversiones', Icon: InvestmentIcon },
  { href: '/analisis', label: 'Análisis', Icon: AnalysisIcon },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex max-w-md items-stretch justify-around px-1 py-2">
        {TABS.map(({ href, label, Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-1 flex-col items-center gap-1 py-1 text-[11px] font-medium"
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-2xl transition-colors ${
                  active ? 'bg-ink text-white' : 'text-muted'
                }`}
              >
                <Icon className="h-5 w-5" />
              </span>
              <span className={active ? 'text-ink' : 'text-muted'}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
