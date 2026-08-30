import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mis Finanzas',
  description: 'Control de ingresos y gastos personales',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-bg text-ink antialiased">{children}</body>
    </html>
  );
}
