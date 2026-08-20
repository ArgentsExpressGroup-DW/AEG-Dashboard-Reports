'use client';

export function Pill({ active, onClick, children, title, compact }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-pressed={active}
      className={`rounded-md font-semibold transition-colors ${
        compact ? 'px-2.5 py-1 text-sm' : 'px-3 py-1.5 text-sm'
      }`}
      style={active ? { background: '#98012E', color: '#fff' } : { background: 'transparent', color: 'var(--text)' }}
    >
      {children}
    </button>
  );
}

export function Group({ label, children, filled }) {
  return (
    <div className="flex flex-col gap-1">
      <span
        className="text-[10px] font-semibold uppercase tracking-wide"
        style={{ color: 'var(--muted)' }}
      >
        {label}
      </span>
      <div
        className="inline-flex flex-wrap gap-1 rounded-lg border p-1"
        style={{ borderColor: 'var(--border)', background: filled ? 'var(--bg)' : 'transparent' }}
      >
        {children}
      </div>
    </div>
  );
}
