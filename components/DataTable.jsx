'use client';
import { useMemo, useState } from 'react';
import { DASH } from '../lib/format';

const CAP = 500;

/**
 * cols: { key, header, render?, align?, sort?, width?, title? }[]
 * Only columns supplying `sort` are sortable. First click sorts desc.
 * Nulls always sort last. Render caps at 500 rows; exports include every row.
 */
export default function DataTable({
  rows,
  cols,
  maxHeight = 460,
  onRowClick,
  rowKey = (_, i) => i,
  empty = 'No data for the current filters',
  footer,
  caption = true,
}) {
  const [sortKey, setSortKey] = useState(null);
  const [dir, setDir] = useState('desc');

  const sorted = useMemo(() => {
    if (!sortKey) return rows;
    const col = cols.find((c) => c.key === sortKey);
    if (!col?.sort) return rows;
    const sign = dir === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
      const av = col.sort(a);
      const bv = col.sort(b);
      const an = av === null || av === undefined;
      const bn = bv === null || bv === undefined;
      if (an && bn) return 0;
      if (an) return 1;   // nulls last, whichever direction
      if (bn) return -1;
      if (typeof av === 'string' || typeof bv === 'string') {
        return sign * String(av).localeCompare(String(bv));
      }
      return sign * (av - bv);
    });
  }, [rows, cols, sortKey, dir]);

  const shown = sorted.slice(0, CAP);
  const capped = sorted.length > CAP;

  function clickHeader(col) {
    if (!col.sort) return;
    if (sortKey === col.key) setDir(dir === 'desc' ? 'asc' : 'desc');
    else { setSortKey(col.key); setDir('desc'); }
  }

  return (
    <div>
      <div
        className="overflow-auto rounded-lg border"
        style={{ borderColor: 'var(--border)', maxHeight }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr>
              {cols.map((c) => (
                <th
                  key={c.key}
                  onClick={() => clickHeader(c)}
                  title={c.sort ? 'Click to sort' : c.title}
                  className={`whitespace-nowrap px-3 py-2 text-[11px] font-semibold uppercase tracking-wide ${
                    c.align === 'right' ? 'text-right' : 'text-left'
                  } ${c.sort ? 'cursor-pointer select-none' : ''}`}
                  style={{
                    color: 'var(--muted)',
                    borderBottom: '1px solid var(--border)',
                    width: c.width,
                  }}
                >
                  {c.header}
                  {sortKey === c.key && (
                    <span className="ml-1 text-[10px]" aria-hidden="true">
                      {dir === 'desc' ? '▼' : '▲'}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.length === 0 && (
              <tr>
                <td colSpan={cols.length} className="px-3 py-6 text-center" style={{ color: 'var(--muted)' }}>
                  {empty}
                </td>
              </tr>
            )}
            {shown.map((r, i) => (
              <tr
                key={rowKey(r, i)}
                onClick={onRowClick ? () => onRowClick(r) : undefined}
                className={onRowClick ? 'cursor-pointer transition-colors hover:bg-maroon/10' : ''}
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                {cols.map((c) => (
                  <td
                    key={c.key}
                    className={`px-3 py-2 tabular-nums ${c.align === 'right' ? 'text-right' : ''}`}
                  >
                    {c.render ? c.render(r) : (r[c.key] ?? DASH)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          {footer && <tfoot className="sticky bottom-0">{footer}</tfoot>}
        </table>
      </div>

      {caption && (
        <div
          className="mt-2 flex items-center justify-between text-[11px]"
          style={{ color: 'var(--muted)' }}
        >
          <span>
            {sorted.length.toLocaleString('en-US')} row{sorted.length === 1 ? '' : 's'}
            {capped && ' · showing first 500 (export includes all)'}
          </span>
          {onRowClick && <span>Click any row for the full record</span>}
        </div>
      )}
    </div>
  );
}

/** Simple display table, no interaction. */
export function Table({ rows, cols, maxHeight = 360 }) {
  return (
    <DataTable rows={rows} cols={cols} maxHeight={maxHeight} caption={false} empty="No data" />
  );
}
