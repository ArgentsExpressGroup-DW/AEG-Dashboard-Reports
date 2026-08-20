'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { money, mdy, count, DASH } from '../lib/format';
import { ALIGN, BAND_COLOR } from '../lib/bands';

const Ctx = createContext(null);
export const useEmployeeDetail = () => useContext(Ctx);

/** Mounted once in the dashboard layout so any table row on any tab can open it. */
export function EmployeeDetailProvider({ children }) {
  const [emp, setEmp] = useState(null);
  const open = useCallback((e) => setEmp(e), []);
  const close = useCallback(() => setEmp(null), []);
  const value = useMemo(() => ({ open, close }), [open, close]);

  useEffect(() => {
    if (!emp) return;
    const onKey = (e) => e.key === 'Escape' && close();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [emp, close]);

  return (
    <Ctx.Provider value={value}>
      {children}
      {emp && <Drawer emp={emp} onClose={close} />}
    </Ctx.Provider>
  );
}

function MiniKpi({ label, value, dot }) {
  return (
    <div className="rounded-lg border px-3 py-2" style={{ borderColor: 'var(--border)' }}>
      <div className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
        {label}
      </div>
      <div className="flex items-center gap-1.5 text-base font-bold tabular-nums">
        {dot && <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: dot }} aria-hidden="true" />}
        {value}
      </div>
    </div>
  );
}

function Drawer({ emp, onClose }) {
  const a = ALIGN[emp.flag];
  const history = [...emp.history].reverse();

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      style={{ background: 'rgba(0,0,0,0.45)' }}
      onClick={onClose}
    >
      <div
        className="flex h-full w-full max-w-4xl flex-col overflow-hidden shadow-2xl"
        style={{ background: 'var(--surface)' }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={`Employee detail — ${emp.name}`}
      >
        <div
          className="flex items-start justify-between gap-4 border-b px-5 py-3"
          style={{ borderColor: 'var(--border)', borderLeft: '3px solid #98012E' }}
        >
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
              Employee detail
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">{emp.name}</span>
              <span
                className="rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                style={{ background: '#98012E18', color: 'var(--brand-ink)' }}
              >
                {emp.dept}
              </span>
            </div>
            <div className="text-sm" style={{ color: 'var(--muted)' }}>
              {emp.title} · {emp.fac}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-md border px-2 py-1 text-sm transition-colors hover:border-maroon"
            style={{ borderColor: 'var(--border)' }}
          >
            Close ✕
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-auto px-5 py-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <MiniKpi label="Current salary" value={money(emp.salary)} />
            <MiniKpi label="Previous salary" value={money(emp.previous)} />
            <MiniKpi label="Alignment" value={a.label} dot={a.color} />
            <MiniKpi label="YR bucket" value={emp.bucket} />
          </div>

          {emp.review && (
            <div
              className="rounded-lg border px-3 py-2 text-sm"
              style={{ borderColor: '#E08A1E', background: '#E08A1E12', color: 'var(--text)' }}
            >
              <strong>Flagged for review.</strong>{' '}
              {emp.daysSince === null
                ? 'No salary history exists for this employee, so time since last change cannot be established.'
                : `Last salary change was ${count(emp.daysSince)} days ago — over the 365-day review threshold.`}
            </div>
          )}

          {emp.y ? (
            <div>
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
                Scale band
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                {emp.y.map((v, i) => {
                  const hit =
                    (i === 0 && emp.salary < v) ||
                    (emp.salary >= v && (i === 4 || emp.salary < emp.y[i + 1]));
                  return (
                    <MiniKpi
                      key={i}
                      label={`YR${i + 1}`}
                      value={money(v)}
                      dot={hit ? a.color : undefined}
                    />
                  );
                })}
              </div>
            </div>
          ) : (
            <div
              className="rounded-lg border px-3 py-2 text-sm"
              style={{ borderColor: BAND_COLOR.none, background: '#9AA0A612', color: 'var(--text)' }}
            >
              <strong>No scale defined.</strong> This job title has no published band in the Master
              Department Scale Structure, so alignment cannot be assessed.
            </div>
          )}

          <div>
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
              Salary history
            </div>
            {history.length === 0 ? (
              <div className="text-sm" style={{ color: 'var(--muted)' }}>
                No salary history in the Paylocity report for this employee.
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border" style={{ borderColor: 'var(--border)' }}>
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      {['Effective', 'Type', 'From', 'To', 'Change'].map((h, i) => (
                        <th
                          key={h}
                          className={`whitespace-nowrap px-3 py-2 text-[11px] font-semibold uppercase tracking-wide ${
                            i > 1 ? 'text-right' : 'text-left'
                          }`}
                          style={{ color: 'var(--muted)', borderBottom: '1px solid var(--border)' }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((h, i) => {
                      const delta = h.from === null ? null : h.to - h.from;
                      return (
                        <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td className="px-3 py-2 tabular-nums">{mdy(h.date)}</td>
                          <td className="px-3 py-2">{h.type}</td>
                          <td className="px-3 py-2 text-right tabular-nums">{money(h.from)}</td>
                          <td className="px-3 py-2 text-right tabular-nums">{money(h.to)}</td>
                          <td
                            className="px-3 py-2 text-right font-semibold tabular-nums"
                            style={{ color: delta > 0 ? BAND_COLOR.green : 'var(--muted)' }}
                          >
                            {delta === null ? DASH : delta > 0 ? `+${money(delta)}` : money(delta)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <MiniKpi label="Employee ID" value={count(emp.id)} />
            <MiniKpi label="Location code" value={emp.loc} />
            <MiniKpi label="Last change" value={mdy(emp.lastChange)} />
            <MiniKpi label="Days since" value={emp.daysSince === null ? DASH : count(emp.daysSince)} />
          </div>
        </div>
      </div>
    </div>
  );
}
