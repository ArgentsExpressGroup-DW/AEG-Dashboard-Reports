'use client';
import { useState } from 'react';
import { SEVERITY } from '../lib/bands';

const WORD = { alert: 'Alert', watch: 'Watch', info: 'Info' };

export default function Insights({ items }) {
  const [open, setOpen] = useState(0);
  if (!items.length) {
    return <div className="text-sm" style={{ color: 'var(--muted)' }}>Nothing to flag for the current filters.</div>;
  }
  return (
    <div className="space-y-2">
      {items.map((it, i) => (
        <div key={i} className="rounded-lg border" style={{ borderColor: 'var(--border)' }}>
          <button
            type="button"
            onClick={() => setOpen(open === i ? -1 : i)}
            className="flex w-full items-center gap-3 px-4 py-3 text-left"
          >
            <span
              className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: SEVERITY[it.sev] }}
              aria-hidden="true"
            />
            <span className="flex-1 text-sm font-medium">{it.title}</span>
            <span className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
              {WORD[it.sev]}
            </span>
            <span style={{ color: 'var(--muted)' }} aria-hidden="true">{open === i ? '−' : '+'}</span>
          </button>
          {open === i && (
            <div className="px-4 pb-4 text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
              {it.body}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
