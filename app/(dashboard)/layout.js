import { redirect } from 'next/navigation';
import { getSession } from '../../lib/session';
import { loadDashboard } from '../../lib/db';
import { missingEnv } from '../../lib/config';
import Header from '../../components/Header';
import NavRail from '../../components/NavRail';
import { EmployeeDetailProvider } from '../../components/EmployeeDrawer';

export const dynamic = 'force-dynamic';

function Config({ missing }) {
  return (
    <div className="mx-auto max-w-2xl p-10">
      <h1 className="text-xl font-bold">Configuration required</h1>
      <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>
        The app deployed, but these environment variables are not set in Vercel. Add them under
        Project → Settings → Environment Variables, then redeploy.
      </p>
      <ul className="mt-4 space-y-2 text-sm">
        {missing.map((m) => (
          <li key={m}>
            <code className="rounded px-1.5 py-0.5" style={{ background: 'var(--border)' }}>{m}</code>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
        SUPABASE_SECRET_KEY must not carry the NEXT_PUBLIC_ prefix — that would expose it to every
        visitor. SESSION_SECRET can be any long random string.
      </p>
    </div>
  );
}

export default async function DashboardLayout({ children }) {
  const missing = missingEnv();
  if (missing.length) return <Config missing={missing} />;

  const session = await getSession();
  if (!session) redirect('/login');

  // A freshness lookup must never break the shell.
  let asOf = null;
  try {
    asOf = (await loadDashboard()).asOf;
  } catch {
    asOf = null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header asOf={asOf} user={{ name: session.name, role: session.role }} />
      <EmployeeDetailProvider>
        <div className="flex flex-1">
          <NavRail />
          <main className="min-w-0 flex-1 p-6">{children}</main>
        </div>
      </EmployeeDetailProvider>
    </div>
  );
}
