import SignupForm from '@/components/SignupForm';

export default function SignupPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-bg px-4 py-10">
      <div className="w-full max-w-sm bg-card rounded-xl2 shadow-soft p-8 space-y-4">
        <div className="text-center space-y-1">
          <div className="text-3xl">📝</div>
          <h1 className="text-xl font-semibold text-ink">Solicitar acceso</h1>
          <p className="text-sm text-muted">Completa tus datos para pedir una cuenta</p>
        </div>
        <SignupForm />
      </div>
    </main>
  );
}
