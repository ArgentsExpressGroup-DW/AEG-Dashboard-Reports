'use client';
import { useMemo, useState } from 'react';
import Card from './Card';
import KpiCard from './KpiCard';
import { Pill, Group } from './Pill';
import MultiSelect, { passes } from './MultiSelect';
import DataTable from './DataTable';
import Insights from './Insights';
import { BandLine } from './Charts';
import { money, moneyShort, percent, count, DASH } from '../lib/format';
import { scaleInsights } from '../lib/insights';
import { exportRowsToXlsx } from '../lib/export';

const PRESETS = [0, 2, 3, 5];

export default function ScaleClient({ scale, viol }) {
  const [depts, setDepts] = useState([]);
  const [facs, setFacs] = useState([]);
  const [six, setSix] = useState(false);
  const [pct, setPct] = useState(0);
  const [q, setQ] = useState('');

  const deptOpts = useMemo(() => [...new Set(scale.map((s) => s.dept))].sort(), [scale]);
  const facOpts = useMemo(() => [...new Set(scale.map((s) => s.fac))].sort(), [scale]);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return scale
      .filter(
        (s) =>
          passes(depts, s.dept) &&
          passes(facs, s.fac) &&
          (!needle || `${s.dept} ${s.fac} ${s.role}`.toLowerCase().includes(needle))
      )
      .sort(
        (a, b) =>
          a.dept.localeCompare(b.dept) ||
          a.fac.localeCompare(b.fac) ||
          (a.lvl >= 8) - (b.lvl >= 8) ||
          (a.lvl >= 8 && b.lvl >= 8
            ? a.lvl - b.lvl
            : a.fam.localeCompare(b.fam) || a.lvl - b.lvl)
      );
  }, [scale, depts, facs, q]);

  const k = 1 + Number(pct) / 100;
  const banded = rows.filter((s) => s.banded);
  const yrCount = six ? 6 : 5;
  const bandOf = (s) => (six ? [...s.y, s.y6] : s.y);

  const entryNow = banded.reduce((a, s) => a + s.y[0], 0);
  const entryNew = entryNow * k;
  const topNow = banded.reduce((a, s) => a + (six ? s.y6 ?? s.y[4] : s.y[4]), 0);

  const violInScope = useMemo(
    () => viol.filter((v) => passes(depts, v.dept) && passes(facs, v.fac)),
    [viol, depts, facs]
  );
  const insights = useMemo(() => scaleInsights(rows, violInScope), [rows, violInScope]);

  // Average band across the filtered selection, current vs modelled.
  const curve = useMemo(() => {
    if (!banded.length) return [];
    return Array.from({ length: yrCount }, (_, i) => {
      const vals = banded.map((s) => bandOf(s)[i]).filter((v) => v !== null && v !== undefined);
      const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
      return { yr: `YR${i + 1}`, current: avg, modelled: avg === null ? null : avg * k };
    });
  }, [banded, yrCount, k, six]);

  const byDept = useMemo(() => {
    const m = {};
    for (const s of rows) {
      const e = (m[s.dept] ||= { dept: s.dept, roles: 0, banded: 0, min: null, max: null, staff: 0 });
      e.roles += 1;
      e.staff += s.headcount;
      if (s.banded) {
        e.banded += 1;
        e.min = e.min === null ? s.y[0] : Math.min(e.min, s.y[0]);
        const top = six ? s.y6 ?? s.y[4] : s.y[4];
        e.max = e.max === null ? top : Math.max(e.max, top);
      }
    }
    return Object.values(m).sort((a, b) => (b.max ?? 0) - (a.max ?? 0));
  }, [rows, six]);

  const yrCols = Array.from({ length: yrCount }, (_, i) => ({
    key: `yr${i + 1}`,
    header: `YR${i + 1}`,
    align: 'right',
    sort: (r) => (r.banded ? bandOf(r)[i] * k : null),
    render: (r) => (r.banded ? money(bandOf(r)[i] * k) : DASH),
  }));

  const stepCols = Array.from({ length: yrCount - 1 }, (_, i) => ({
    key: `step${i + 2}`,
    header: `Step ${i + 2}`,
    align: 'right',
    title: 'Increase over the prior year. Unchanged by the modelled percentage — a flat uplift moves every year equally.',
    render: (r) => {
      if (!r.banded) return DASH;
      const b = bandOf(r);
      if (!b[i]) return DASH;
      return <span style={{ color: 'var(--muted)' }}>{percent(((b[i + 1] - b[i]) / b[i]) * 100)}</span>;
    },
  }));

  const cols = [
    { key: 'dept', header: 'Department', sort: (r) => r.dept },
    { key: 'fac', header: 'Location', sort: (r) => r.fac },
    {
      key: 'role',
      header: 'Role',
      sort: (r) => r.lvl,
      render: (r) => (
        <span className="whitespace-nowrap">
          {r.role}
          {!r.banded && (
            <span
              className="ml-1.5 rounded px-1.5 py-0.5 text-[10px] font-semibold"
              style={{ background: 'var(--border)', color: 'var(--muted)' }}
              title="This role exists in the structure but carries no salary values"
            >
              no band
            </span>
          )}
        </span>
      ),
    },
    { key: 'exp', header: 'Exp.', align: 'right', render: (r) => (r.expBase === null ? DASH : `${r.expBase}–${r.expPrem}`) },
    { key: 'baseHr', header: 'Base $/hr', align: 'right', sort: (r) => r.baseHr, render: (r) => (r.baseHr === null ? DASH : money(r.baseHr)) },
    { key: 'staff', header: 'Staff', align: 'right', sort: (r) => r.headcount, render: (r) => count(r.headcount) },
    ...yrCols,
    ...stepCols,
  ];

  function exportAll() {
    exportRowsToXlsx(
      `salary-scale${pct ? `-plus-${pct}pct` : ''}.xlsx`,
      'Salary Scale',
      rows.map((r) => {
        const b = r.banded ? bandOf(r) : [];
        const out = {
          Department: r.dept,
          Location: r.fac,
          Role: r.role,
          'Experience (years)': r.expBase === null ? '' : `${r.expBase}-${r.expPrem}`,
          'Base Hourly Rate': r.baseHr ?? '',
          'Employees In Role': r.headcount,
          'Band Published': r.banded ? 'Published' : 'No band',
        };
        for (let i = 0; i < yrCount; i += 1) {
          out[`YR${i + 1}`] = r.banded && b[i] !== null ? Number((b[i] * k).toFixed(2)) : '';
        }
        return out;
      })
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Department Salary Scale</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
          The published band for every role at every facility. YR1 is the entry band, YR3 the
          promotion mark, and YR3 must stay below the next role&rsquo;s YR1 so a title change and a
          pay rise can land together.
        </p>
      </div>

      {/* Range control — governs this page */}
      <div className="overflow-hidden rounded-xl border" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <div
          className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3"
          style={{ borderColor: 'var(--border)', borderLeft: '3px solid #98012E' }}
        >
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
              Viewing · {six ? 'Analysis scale, YR1–YR6' : 'Current scale, YR1–YR5'}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">
                {Number(pct) === 0 ? 'As published' : `Modelled ${pct > 0 ? '+' : ''}${pct}%`}
              </span>
              {six && (
                <span
                  className="rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                  style={{ background: '#B08D5722', color: '#8A6D2F' }}
                  title="YR6 is a proposed extension of the ladder, not an approved band."
                >
                  Proposed
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-1 rounded-lg border p-1" style={{ borderColor: 'var(--border)' }}>
            {PRESETS.map((p) => (
              <Pill key={p} active={Number(pct) === p} onClick={() => setPct(p)} compact
                title={p === 0 ? 'Show the scale exactly as published' : `Model a flat ${p}% uplift`}>
                {p === 0 ? 'As published' : `+${p}%`}
              </Pill>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-4 px-4 py-3">
          <Group label="Years shown" filled>
            <Pill active={!six} onClick={() => setSix(false)} compact>YR1–YR5</Pill>
            <Pill active={six} onClick={() => setSix(true)} compact title="Adds YR6 as a linear continuation of the ladder">
              Add YR6
            </Pill>
          </Group>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
              Custom %
            </span>
            <input
              type="number"
              step="0.5"
              min="-20"
              max="50"
              value={pct}
              onChange={(e) => setPct(e.target.value === '' ? 0 : Number(e.target.value))}
              className="w-24 rounded-md border px-2 py-1.5 text-sm outline-none focus:border-maroon focus:ring-2 focus:ring-maroon/20"
              style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
            />
          </div>
        </div>
      </div>

      <Card title="Filters" subtitle="Department and location scope, plus a role search.">
        <div className="flex flex-wrap items-end gap-3">
          <MultiSelect label="Department" options={deptOpts} selected={depts} onChange={setDepts} />
          <MultiSelect label="Location" options={facOpts} selected={facs} onChange={setFacs} width={200} />
          <label className="flex min-w-[180px] flex-1 flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
              Search
            </span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Role, department, location…"
              className="rounded-md border px-2 py-1.5 text-sm font-normal normal-case outline-none focus:border-maroon focus:ring-2 focus:ring-maroon/20"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
            />
          </label>
          <button
            type="button"
            onClick={exportAll}
            className="rounded-md px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-maroon-bright"
            style={{ background: '#98012E' }}
          >
            Export .xlsx
          </button>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Roles in view" value={count(rows.length)} sublabel={`${count(banded.length)} with a published band`} />
        <KpiCard label="Published bands" value={count(banded.length)} basis="Scale" sublabel={`${count(rows.length - banded.length)} carry no values`} />
        <KpiCard label="Staff in roles" value={count(rows.reduce((a, s) => a + s.headcount, 0))} sublabel="Matched to a band" />
        <KpiCard label="Entry cost" value={moneyShort(entryNow)} basis="One per role" sublabel="Sum of every YR1 in view" title="Scale cost, not payroll — assumes exactly one person at YR1 in every role." />
        <KpiCard
          label={Number(pct) === 0 ? 'Modelled entry cost' : `Entry cost ${pct > 0 ? '+' : ''}${pct}%`}
          value={Number(pct) === 0 ? DASH : moneyShort(entryNew)}
          sublabel={Number(pct) === 0 ? 'Set a percentage to model' : `${pct > 0 ? '+' : ''}${money(entryNew - entryNow)} against published`}
        />
        <KpiCard label={six ? 'Ceiling cost (YR6)' : 'Ceiling cost (YR5)'} value={moneyShort(topNow * k)} sublabel="Top of every band in view" />
      </div>

      <Card title="Written Insights" subtitle="What the scale in view is saying.">
        <Insights items={insights} />
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card title="Average band shape" subtitle="Mean of every published band in view, current against modelled.">
          {curve.length ? <BandLine data={curve} /> : <div className="text-sm" style={{ color: 'var(--muted)' }}>No published bands in view.</div>}
        </Card>
        <Card title="By department" subtitle="Band floor and ceiling across the roles in view.">
          <DataTable
            rows={byDept}
            maxHeight={300}
            caption={false}
            cols={[
              { key: 'dept', header: 'Department', sort: (r) => r.dept },
              { key: 'roles', header: 'Roles', align: 'right', sort: (r) => r.roles, render: (r) => count(r.roles) },
              { key: 'banded', header: 'Banded', align: 'right', sort: (r) => r.banded, render: (r) => count(r.banded) },
              { key: 'staff', header: 'Staff', align: 'right', sort: (r) => r.staff, render: (r) => count(r.staff) },
              { key: 'min', header: 'Floor', align: 'right', sort: (r) => r.min, render: (r) => money(r.min === null ? null : r.min * k) },
              { key: 'max', header: 'Ceiling', align: 'right', sort: (r) => r.max, render: (r) => money(r.max === null ? null : r.max * k) },
            ]}
          />
        </Card>
      </div>

      <Card
        title="Salary scale"
        subtitle={`Every role at every facility. ${Number(pct) === 0 ? 'Figures as published.' : `Figures include the modelled ${pct > 0 ? '+' : ''}${pct}% uplift.`}`}
      >
        <DataTable rows={rows} cols={cols} maxHeight={560} rowKey={(r) => r.id} />
      </Card>
    </div>
  );
}
