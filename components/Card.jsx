export default function Card({ title, subtitle, right, children, className = '' }) {
  return (
    <section
      className={`rounded-xl border p-5 ${className}`}
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      {(title || right) && (
        <div className="flex items-start justify-between gap-3">
          <div>
            {title && <h3 className="text-sm font-semibold">{title}</h3>}
            {subtitle && (
              <p className="mt-0.5 text-xs" style={{ color: 'var(--muted)' }}>{subtitle}</p>
            )}
          </div>
          {right}
        </div>
      )}
      <div className={title || right ? 'mt-4' : ''}>{children}</div>
    </section>
  );
}

export function SectionBanner({ title, subtitle }) {
  return (
    <div className="border-b-2 pb-2" style={{ borderColor: '#98012E' }}>
      <h2 className="text-lg font-bold uppercase tracking-wide">{title}</h2>
      {subtitle && (
        <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>{subtitle}</p>
      )}
    </div>
  );
}
