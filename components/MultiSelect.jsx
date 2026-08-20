'use client';
import { useEffect, useRef, useState } from 'react';

/** Empty selection means All. Filters combine AND across types, OR within a type. */
export function passes(selected, value) {
  if (selected.length === 0) return true;
  return selected.includes(value ?? '');
}

export default function MultiSelect({ label, options, selected, onChange, width = 190 }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    function onDown(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const summary =
    selected.length === 0 ? 'All' : selected.length === 1 ? selected[0] : `${selected.length} selected`;
  const shown = q ? options.filter((o) => o.toLowerCase().includes(q.toLowerCase())) : options;

  function toggle(o) {
    onChange(selected.includes(o) ? selected.filter((x) => x !== o) : [...selected, o]);
  }

  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
        {label}
      </span>
      <div className="relative" ref={ref} style={{ width }}>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          title={selected.length ? selected.join(', ') : 'All'}
          className="flex w-full items-center justify-between gap-2 rounded-md border px-2 py-1.5 text-left text-sm"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <span className="truncate">{summary}</span>
          <span style={{ color: 'var(--muted)' }} aria-hidden="true">{open ? '▴' : '▾'}</span>
        </button>

        {open && (
          <div
            className="absolute left-0 top-full z-30 mt-1 w-full rounded-md border shadow-lg"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center gap-2 border-b p-2" style={{ borderColor: 'var(--border)' }}>
              <button
                type="button"
                onClick={() => onChange([])}
                className="rounded-md px-2 py-0.5 text-[11px] font-semibold transition-colors"
                style={selected.length === 0
                  ? { background: '#98012E', color: '#fff' }
                  : { color: 'var(--text)' }}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-[11px]"
                style={{ color: 'var(--muted)' }}
              >
                Clear
              </button>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Filter…"
                className="ml-auto w-24 rounded-md border px-1.5 py-0.5 text-[11px] font-normal normal-case outline-none focus:border-maroon"
                style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
              />
            </div>
            <div className="max-h-56 overflow-auto p-1">
              {shown.length === 0 && (
                <div className="px-2 py-2 text-xs" style={{ color: 'var(--muted)' }}>No matches</div>
              )}
              {shown.map((o) => (
                <label
                  key={o}
                  title={o}
                  className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm transition-colors hover:bg-maroon/10"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(o)}
                    onChange={() => toggle(o)}
                    className="accent-maroon"
                  />
                  <span className="truncate">{o}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
