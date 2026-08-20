'use client';
import { useMemo, useState } from 'react';
import Card from './Card';
import KpiCard from './KpiCard';
import { Pill, Group } from './Pill';
import MultiSelect, { passes } from './MultiSelect';
import DataTable from './DataTable';
import Insights from './Insights';
import { MoneyBar } from './Charts';
import { useEmployeeDetail } from './EmployeeDrawer';
import { money, moneyShort, percent, count, mdy, days, DASH } from '../lib/format';
import { ALIGN, ALIGN_RULE, BAND_COLOR } from '../lib/bands';
import { employeeInsights } from '../lib/insights';
import { exportRowsToXlsx } from '../lib/export';

const FLAGS = [
  ['', 'All'],
  ['ok', 'Within band'],
  ['above', 'Above band'],
  ['below', 'Below band'],
  ['none', 'No scale'],
];

function AlignCell({ flag }) {
  const a = ALIGN[flag];
  return (
    <span className="flex items-center gap-1.5 whitespace-nowrap" title={ALIGN_RULE}>
      <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: a.color }} aria-hidden="true" />
      {a.label}
    </span>
  );
}

export default function OutlookClient({ emps }) {
  const detail = useEmployeeDetail();
  const [depts, setDepts] = useState([]);
  const [facs, setFacs] = useState([]);
  const [flag, setFlag] = useState('');
  const [review, setReview] = useState(false);
  const [q, setQ] = useState('');

  const deptOpts = useMemo(() => [...new Set(emps.map((e) => e.dept))].sort(), [emps]);
  const facOpts = useMemo(() => [...new Set(emps.map((e) => e.fac))].sort(), [emps]);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return emps
      .filter(
        (e) =>
          passes(depts, e.dept) &&
          passes(facs, e.fac) &&
          (!flag || e.flag === flag) &&
          (!review || e.review) &&
          (!needle || `${e.name} ${e.title} ${e.dept}`.toLowerCase().includes(needle))
      )
      .sort((a, b) => b.salary - a.salary);
  }, [emps, depts, facs, flag, review, q]);

  const current = rows.reduce((a, e) => a + e.salary, 0);
  const previous = rows.reduce((a, e) => a + (e.previous ?? e.salary), 0);
  const withHist = rows.filter((e) => e.previous !== null).length;
  const tally = { ok: 0, above: 0, below: 0, none: 0 };
  rows.forEach((e) => tally[e.flag] += 1);
  const flagged = rows.filter((e) => e.review).length;

  const insights = useMemo(() => employeeInsights(rows), [rows]);

  const byDept = useMemo(() => {
    const m = {};
    for (const e of rows) {
      const d = (m[e.dept] ||= { dept: e.dept, n: 0, total: 0, ok: 0, above: 0, below: 0, none: 0, flagged: 0 });
      d.n += 1;
      d.total += e.salary;
      d[e.flag] += 1;
      if (e.review) d.flagged += 1;
    }
    return Object.values(m).sort((a, b) => b.total - a.total);
  }, [rows]);

  const byLoc = useMemo(() => {
    const m = {};
    for (const e of rows) {
      const l = (m[e.fac] ||= { name: e.fac.split(',')[0], total: 0, n: 0 });
      l.total += e.salary;
      l.n += 1;
    }
    return Object.values(m).sort((a, b) => b.total - a.total);
  }, [rows]);

  function exportAll() {
    exportRowsToXlsx('department-outlook.xlsx', 'Department Outlook',
      rows.map((e) => ({
        'Employee Name': e.name,
        Department: e.dept,
        Location: e.fac,
        'Job Title': e.title,
        'Current Annual Salary': e.salary,
        'Previous Annual Salary': e.previous ?? '',
        'YR Bucket': e.bucket,
        Alignment: ALIGN[e.flag].label,
        'Band YR1': e.y ? e.y[0] : '',
        'Band YR5': e.y ? e.y[4] : '',
        'Last Salary Change': e.lastChange ? mdy(e.lastChange) : '',
        'Days Since Change': e.daysSince ?? '',
        'Review Flag': e.review ? 'FLAGGED' : 'Not flagged',
      })));
  }

  const cols = [
    { key: 'name', header: 'Employee', sort: (r) => r.name },
    { key: 'dept', header: 'Department', sort: (r) => r.dept },
    { key: 'fac', header: 'Location', sort: (r) => r.fac, render: (r) => r.fac.split(',')[0] },
    { key: 'title', header: 'Job title', sort: (r) => r.title },
    { key: 'salary', header: 'Current', align: 'right', sort: (r) => r.salary, render: (r) => money(r.salary) },
    { key: 'previous', header: 'Previous', align: 'right', sort: (r) => r.previous, render: (r) => money(r.previous) },
    {
      key: 'delta', header: 'Change', align: 'right',
      sort: (r) => (r.previous === null ? null : r.salary - r.previous),
      render: (r) =>
        r.previous === null ? DASH : (
          <span style={{ color: r.salary > r.previous ? BAND_COLOR.green : 'var(--muted)' }}>
            {r.salary > r.previous ? '+' : ''}{money(r.salary - r.previous)}
          </span>
        ),
    },
    { key: 'y1', header: 'YR1', align: 'right', sort: (r) => (r.y ? r.y[0] : null), render: (r) => (r.y ? money(r.y[0]) : DASH) },
    { key: 'y5', header: 'YR5', align: 'right', sort: (r) => (r.y ? r.y[4] : null), render: (r) => (r.y ? money(r.y[4]) : DASH) },
    { key: 'bucket', header: 'YR bucket', sort: (r) => r.bucket },
    { key: 'flag', header: 'Alignment', sort: (r) => ALIGN[r.flag].label, render: (r) => <AlignCell flag={r.flag} /> },
    {
      key: 'daysSince', header: 'Since change', align: 'right', sort: (r) => r.daysSince,
      title: 'Days since the last salary movement. Over 365 days raises a review flag.',
      render: (r) => (
        <span style={{ color: r.review ? BAND_COLOR.orange : undefined }}>
          {r.daysSince === null ? DASH : days(r.daysSince)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Department Outlook</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
          Every employee against the band published for their role at their facility. A row is
          flagged when pay falls outside the band, or when no salary change has been recorded in over
          365 days.
        </p>
      </div>

      <Card title="Filters" subtitle="Alignment, review state, department, location and employee search.">
        <div className="space-y-3">
          <div className="flex flex-wrap items-end gap-3">
            <Group label="Alignment">
              {FLAGS.map(([v, label]) => (
                <Pill key={v} active={flag === v} onClick={() => setFlag(v)} compact title={ALIGN_RULE}>
                  {label}
                </Pill>
              ))}
            </Group>
            <Group label="Review state">
              <Pill active={!review} onClick={() => setReview(false)} compact>Everyone</Pill>
              <Pill active={review} onClick={() => setReview(true)} compact title="No salary change recorded in over 365 days">
                Flagged only
              </Pill>
            </Group>
          </div>
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
                placeholder="Employee, job title, department…"
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
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Employees" value={count(rows.length)} sublabel={`${count(tally.none)} without a band`} />
        <KpiCard label="Current annual" value={money(current)} basis="Paylocity" sublabel="Sum of annual salary" />
        <KpiCard
          label="Previous annual"
          value={money(previous)}
          sublabel={
            previous
              ? `${percent(((current / previous - 1) * 100))} growth · ${count(withHist)} of ${count(rows.length)} have history`
              : DASH
          }
          title="Employees with no salary history contribute their current salary to both totals, so growth is understated."
        />
        <KpiCard label="Within band" value={count(tally.ok)} dot={ALIGN.ok.color} sublabel={`${count(tally.above)} above · ${count(tally.below)} below`} />
        <KpiCard
          label="Flagged for review"
          value={count(flagged)}
          dot={flagged ? BAND_COLOR.orange : BAND_COLOR.green}
          sublabel="No change in over 365 days"
        />
        <KpiCard label="Total revenue" value={DASH} sublabel="Coming soon" />
      </div>

      <Card title="Written Insights" subtitle="What the numbers above are saying, for the current filters.">
        <Insights items={insights} />
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card title="Payroll by location" subtitle="Current annual salary for the filtered selection.">
          {byLoc.length ? <MoneyBar data={byLoc} xKey="name" yKey="total" name="Annual salary" />
            : <div className="text-sm" style={{ color: 'var(--muted)' }}>No employees match.</div>}
        </Card>
        <Card title="By department" subtitle="Headcount, payroll and alignment. Rollup rows are not clickable.">
          <DataTable
            rows={byDept}
            maxHeight={300}
            caption={false}
            cols={[
              { key: 'dept', header: 'Department', sort: (r) => r.dept },
              { key: 'n', header: 'Staff', align: 'right', sort: (r) => r.n, render: (r) => count(r.n) },
              { key: 'total', header: 'Annual', align: 'right', sort: (r) => r.total, render: (r) => money(r.total) },
              { key: 'ok', header: 'In band', align: 'right', sort: (r) => r.ok, render: (r) => count(r.ok) },
              { key: 'below', header: 'Below', align: 'right', sort: (r) => r.below, render: (r) => count(r.below) },
              { key: 'above', header: 'Above', align: 'right', sort: (r) => r.above, render: (r) => count(r.above) },
              { key: 'flagged', header: 'Flagged', align: 'right', sort: (r) => r.flagged, render: (r) => count(r.flagged) },
            ]}
          />
        </Card>
      </div>

      <Card title="Employees" subtitle="One row per person. Click a row for the full salary history.">
        <DataTable
          rows={rows}
          cols={cols}
          maxHeight={560}
          rowKey={(r) => r.id}
          onRowClick={(r) => detail.open(r)}
        />
      </Card>
    </div>
  );
}
