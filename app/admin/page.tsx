import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import { listApprovedUsers, listPendingUsers } from '@/lib/db';
import { approve, reject } from './actions';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user || !user.is_admin) {
    redirect('/');
  }

  const pending = listPendingUsers();
  const approved = listApprovedUsers();

  return (
    <main className="min-h-screen pb-16">
      <div className="mx-auto max-w-md px-4 pt-8 space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-ink">Solicitudes de acceso</h1>
          <Link href="/" className="text-sm font-medium text-accent">
            Volver
          </Link>
        </div>

        <section className="space-y-3">
          <h2 className="px-1 text-sm font-medium text-muted">Pendientes</h2>
          {pending.length === 0 ? (
            <div className="bg-card rounded-xl2 shadow-soft p-6 text-center text-muted text-sm">
              No hay solicitudes pendientes.
            </div>
          ) : (
            pending.map((u) => (
              <div key={u.id} className="bg-card rounded-xl2 shadow-soft p-5 space-y-2">
                <p className="font-semibold text-ink">
                  {u.first_name} {u.last_name}
                </p>
                <p className="text-sm text-muted">
                  {u.email} · {u.phone}
                </p>
                {u.reason && <p className="text-sm italic text-ink">"{u.reason}"</p>}
                <div className="flex gap-2 pt-2">
                  <form action={approve.bind(null, u.id)}>
                    <button className="rounded-xl bg-income px-4 py-2 text-sm font-medium text-white">
                      Aprobar
                    </button>
                  </form>
                  <form action={reject.bind(null, u.id)}>
                    <button className="rounded-xl bg-expense px-4 py-2 text-sm font-medium text-white">
                      Rechazar
                    </button>
                  </form>
                </div>
              </div>
            ))
          )}
        </section>

        <section className="space-y-3">
          <h2 className="px-1 text-sm font-medium text-muted">Usuarios aprobados</h2>
          <div className="bg-card rounded-xl2 shadow-soft divide-y divide-border">
            {approved.map((u) => (
              <div key={u.id} className="px-5 py-3 text-sm">
                <p className="font-medium text-ink">
                  {u.first_name} {u.last_name} {u.is_admin ? '👑' : ''}
                </p>
                <p className="text-muted">{u.email}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
