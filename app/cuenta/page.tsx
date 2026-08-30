import { redirect } from 'next/navigation';
import { listAllUsers, listPendingUsers } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';
import ChangePasswordForm from '@/components/ChangePasswordForm';
import AdminResetPasswordButton from '@/components/AdminResetPasswordButton';
import BottomNav from '@/components/BottomNav';
import { adminApprove, adminBlock, adminReject, adminUnblock } from './actions';
import { logout } from '../login/actions';

export const dynamic = 'force-dynamic';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  approved: 'Aprobado',
  rejected: 'Rechazado',
};

export default async function CuentaPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const pending = user.is_admin ? listPendingUsers() : [];
  const others = user.is_admin
    ? listAllUsers().filter((u) => u.id !== user.id && u.status !== 'pending')
    : [];

  return (
    <main className="min-h-screen pb-32">
      <div className="mx-auto max-w-md px-4 pt-8 space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-ink">Mi cuenta</h1>
          <form action={logout}>
            <button className="text-muted text-lg" aria-label="Cerrar sesión">
              ⏻
            </button>
          </form>
        </div>

        <section className="bg-card rounded-xl2 shadow-soft p-6 space-y-1">
          <p className="font-semibold text-ink">
            {user.first_name} {user.last_name}
          </p>
          <p className="text-sm text-muted">{user.email}</p>
          {user.phone && <p className="text-sm text-muted">{user.phone}</p>}
          <span className="mt-2 inline-block rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
            {user.is_admin ? 'Administrador' : 'Usuario'}
          </span>
        </section>

        <section className="bg-card rounded-xl2 shadow-soft p-6 space-y-3">
          <h2 className="text-sm font-medium text-muted">Cambiar mi contraseña</h2>
          <ChangePasswordForm />
        </section>

        {user.is_admin === 1 && (
          <>
            <section className="space-y-3">
              <h2 className="px-1 text-sm font-medium text-muted">Solicitudes pendientes</h2>
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
                    {u.reason && <p className="text-sm italic text-ink">&quot;{u.reason}&quot;</p>}
                    <div className="flex gap-2 pt-2">
                      <form action={adminApprove.bind(null, u.id)}>
                        <button className="rounded-full bg-income px-4 py-2 text-sm font-medium text-white">
                          Aprobar
                        </button>
                      </form>
                      <form action={adminReject.bind(null, u.id)}>
                        <button className="rounded-full bg-expense px-4 py-2 text-sm font-medium text-white">
                          Rechazar
                        </button>
                      </form>
                    </div>
                  </div>
                ))
              )}
            </section>

            <section className="space-y-3">
              <h2 className="px-1 text-sm font-medium text-muted">Usuarios</h2>
              {others.length === 0 ? (
                <div className="bg-card rounded-xl2 shadow-soft p-6 text-center text-muted text-sm">
                  Todavía no hay más usuarios.
                </div>
              ) : (
                <div className="bg-card rounded-xl2 shadow-soft divide-y divide-border">
                  {others.map((u) => (
                    <div key={u.id} className="p-5 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-ink">
                            {u.first_name} {u.last_name}
                          </p>
                          <p className="truncate text-sm text-muted">{u.email}</p>
                        </div>
                        <div className="flex shrink-0 flex-wrap justify-end gap-1">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                              u.status === 'approved'
                                ? 'bg-income/10 text-income'
                                : 'bg-expense/10 text-expense'
                            }`}
                          >
                            {STATUS_LABELS[u.status] ?? u.status}
                          </span>
                          {u.is_blocked === 1 && (
                            <span className="rounded-full bg-expense/10 px-2 py-0.5 text-xs font-medium text-expense">
                              Bloqueado
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {u.is_blocked === 1 ? (
                          <form action={adminUnblock.bind(null, u.id)}>
                            <button className="rounded-full bg-income px-3 py-1.5 text-xs font-medium text-white">
                              Desbloquear
                            </button>
                          </form>
                        ) : (
                          <form action={adminBlock.bind(null, u.id)}>
                            <button className="rounded-full bg-expense px-3 py-1.5 text-xs font-medium text-white">
                              Bloquear
                            </button>
                          </form>
                        )}
                        <AdminResetPasswordButton userId={u.id} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
