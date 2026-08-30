'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/presupuesto', label: 'Presupuesto', icon: '🧾' },
  { href: '/deudas', label: 'Deudas', icon: '📉' },
  { href: '/', label: 'Movimientos', icon: '💳' },
  { href: '/inversiones', label: 'Inversiones', icon: '📈' },
  { href: '/analisis', label: 'Análisis', icon: '💡' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex max-w-md items-stretch justify-around px-2">
        {TABS.map((tab) => {
          const active = tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition ${
                active ? 'text-accent' : 'text-muted'
              }`}
            >
              <span className="text-lg leading-none">{tab.icon}</span>
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
