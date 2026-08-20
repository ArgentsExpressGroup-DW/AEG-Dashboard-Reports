'use client';
import { useMemo, useState } from 'react';
import Card from './Card';
import KpiCard from './KpiCard';
import { Pill, Group } from './Pill';
import MultiSelect, { passes } from './MultiSelect';
import DataTable from './DataTable';
import { money, count } from '../lib/format';
import { BAND_COLOR, SEVERITY } from '../lib/bands';
import { exportRowsToXlsx } from '../lib/export';

const SEV_ORDER = { high: 0, medium: 1, low: 2 };
const SEV_STYLE = {
  high: { color: BAND_COLOR.red, word: 'High' },
  medium: { color: BAND_COLOR.orange, word: 'Medium' },
  low: { color: BAND_COLOR.yellow, word: 'Low' },
};

export default function QualityClient({ issues, viol }) {
  const [sev, setSev] = useState('');
  const [depts, setDepts] = useState([]);
  const [q, setQ] = useState('');

  const deptOpts = useMemo(() => [...new Set(viol.map((v) => v.dept))].sort(), [viol]);

  const shownIssues = useMemo(
    () =>
      issues
        .filter((i) => (!sev || i.sev === sev))
        .filter((i) => {
          const needle = q.trim().toLowerCase();
          return !needle || `${i.entity} ${i.detail} ${i.category}`.toLowerCase().includes(needle);
        })
        .sort((a, b) => SEV_ORDER[a.sev] - SEV_ORDER[b.sev]),
    [issues, sev, q]
  );

  const shownViol = useMemo(
    () => viol.filter((v) => passes(depts, v.dept)).sort((a, b) => b.overlap - a.overlap),
    [viol, depts]
  );

  const tally = { high: 0, medium: 0, low: 0 };
  issues.forEach((i) => tally[i.sev] += 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Data Quality</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
          Everything found while loading the Master Department Scale Structure and the two Paylocity
          reports. Each item is tracked in the database rather than mentioned once and lost.
        </p>
      </div>

      <Card title="Filters" subtitle="Severity, department scope for ceiling breaks, and a text search.">
        <div className="flex flex-wrap items-end gap-3">
          <Group label="Severity">
            {[['', 'All'], ['high', 'High'], ['medium', 'Medium'], ['low', 'Low']].map(([v, l]) => (
              <Pill key={v} active={sev === v} onClick={() => setSev(v)} compact>{l}</Pill>
            ))}
          </Group>
          <MultiSelect label="Department (breaks)" options={deptOpts} selected={depts} onChange={setDepts} />
          <label className="flex min-w-[180px] flex-1 flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
              Search
            </span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Issue, department, facility…"
              className="rounded-md border px-2 py-1.5 text-sm font-normal normal-case outline-none focus:border-maroon focus:ring-2 focus:ring-maroon/20"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
            />
          </label>
          <button
            type="button"
            onClick={() =>
              exportRowsToXlsx('data-quality.xlsx', 'Data Quality', [
                ...shownIssues.map((i) => ({
                  Type: 'Data issue',
                  Severity: SEV_STYLE[i.sev].word,
                  Category: i.category,
                  Subject: i.entity,
                  Detail: i.detail,
                })),
                ...shownViol.map((v) => ({
                  Type: 'Ceiling-rule break',
                  Severity: 'Medium',
                  Category: 'ceiling_rule',
                  Subject: `${v.dept} — ${v.role} at ${v.fac}`,
                  Detail: `YR3 ${v.yr3} vs ${v.next} YR1 ${v.nextYr1}; overlap ${v.overlap}`,
                })),
              ])
            }
            className="rounded-md px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-maroon-bright"
            style={{ background: '#98012E' }}
          >
            Export .xlsx
          </button>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Open issues" value={count(issues.length)} sublabel="Tracked in data_quality_issues" />
        <KpiCard label="High severity" value={count(tally.high)} dot={BAND_COLOR.red} sublabel="Blocking accurate assessment" />
        <KpiCard label="Medium" value={count(tally.medium)} dot={BAND_COLOR.orange} sublabel="Worth a decision" />
        <KpiCard label="Ceiling breaks" value={count(viol.length)} dot={SEVERITY.watch} sublabel="YR3 at or above the next YR1" />
      </div>

      <Card
        title="Open data issues"
        subtitle={`${count(shownIssues.length)} of ${count(issues.length)} shown. Severity reflects how much it blocks assessment, not how hard it is to fix.`}
      >
        <div className="space-y-2">
          {shownIssues.length === 0 && (
            <div className="text-sm" style={{ color: 'var(--muted)' }}>No issues match the current filters.</div>
          )}
          {shownIssues.map((i, n) => (
            <div key={n} className="rounded-lg border px-4 py-3" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-start gap-3">
                <span
                  className="mt-1.5 inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: SEV_STYLE[i.sev].color }}
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">{i.entity}</span>
                    <span
                      className="rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                      style={{ background: '#98012E18', color: 'var(--brand-ink)' }}
                    >
                      {i.category}
                    </span>
                    <span className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
                      {SEV_STYLE[i.sev].word}
                    </span>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
                    {i.detail}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card
        title="Ceiling-rule breaks"
        subtitle="A role's YR3 must stay below the next role's YR1, so a title change and a pay rise can land together."
      >
        <DataTable
          rows={shownViol}
          maxHeight={460}
          cols={[
            { key: 'dept', header: 'Department', sort: (r) => r.dept },
            { key: 'fac', header: 'Location', sort: (r) => r.fac },
            { key: 'role', header: 'Role', sort: (r) => r.role },
            { key: 'yr3', header: 'YR3', align: 'right', sort: (r) => r.yr3, render: (r) => money(r.yr3) },
            { key: 'next', header: 'Next role', sort: (r) => r.next },
            { key: 'nextYr1', header: 'Next YR1', align: 'right', sort: (r) => r.nextYr1, render: (r) => money(r.nextYr1) },
            {
              key: 'overlap', header: 'Overlap', align: 'right', sort: (r) => r.overlap,
              render: (r) => (
                <span className="font-semibold" style={{ color: BAND_COLOR.red }}>{money(r.overlap)}</span>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
