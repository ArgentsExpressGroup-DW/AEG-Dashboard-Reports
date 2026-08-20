export default function KpiCard({ label, value, basis, sublabel, provisional, dot, title }) {
  return (
    <div
      className="rounded-xl border p-5"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      title={title}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className="text-xs font-semibold uppercase tracking-wide"
          style={{ color: 'var(--muted)' }}
        >
          {label}
        </span>
        {basis && (
          <span
            className="rounded bg-maroon/10 px-1.5 py-0.5 text-[10px] font-semibold"
            style={{ color: 'var(--brand-ink)' }}
          >
            {basis}
          </span>
        )}
      </div>
      <div className="mt-2 flex items-center gap-2 text-2xl font-bold tabular-nums">
        {dot && (
          <span
            className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ background: dot }}
            aria-hidden="true"
          />
        )}
        {value}
      </div>
      {sublabel && (
        <div className="mt-1 text-xs" style={{ color: 'var(--muted)' }}>{sublabel}</div>
      )}
      {provisional && (
        <div className="mt-2 text-[11px] italic" style={{ color: 'var(--muted)' }}>
          Provisional — pending business sign-off
        </div>
      )}
    </div>
  );
}
