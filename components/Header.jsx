import { dataAsOf } from '../lib/format';
import ThemeToggle from './ThemeToggle';

export default function Header({ asOf, user }) {
  return (
    <header
      className="flex items-center justify-between border-b px-5 py-3"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <div>
        <div className="text-sm font-bold tracking-tight" style={{ color: 'var(--brand-ink)' }}>
          ARGENTS EXPRESS GROUP
        </div>
        <div className="text-xs" style={{ color: 'var(--muted)' }}>
          HR Operations &amp; Department Structure
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span
          className="hidden rounded-md border px-2 py-1 text-xs sm:inline-block"
          style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
          title="The date of the Paylocity extract currently loaded"
        >
          Data as of: <strong style={{ color: 'var(--text)' }}>{dataAsOf(asOf)}</strong>
        </span>
        {user?.name && (
          <span className="hidden text-xs md:inline-block" style={{ color: 'var(--muted)' }}>
            {user.name} · {user.role}
          </span>
        )}
        <ThemeToggle />
        <form method="post" action="/api/logout">
          <button
            type="submit"
            className="rounded-md border px-2 py-1 text-sm transition-colors hover:border-maroon"
            style={{ borderColor: 'var(--border)' }}
          >
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
