'use client';
import { useMemo } from 'react';
import Link from 'next/link';
import Card, { SectionBanner } from './Card';
import KpiCard from './KpiCard';
import DataTable from './DataTable';
import Insights from './Insights';
import { MoneyBar, CountBar } from './Charts';
import { useEmployeeDetail } from './EmployeeDrawer';
import { money, moneyShort, percent, count, days, mdy, DASH } from '../lib/format';
import { ALIGN, ALIGN_RULE, BAND_COLOR } from '../lib/bands';
import { employeeInsights } from '../lib/insights';

export default function LandingClient({ emps, scale, viol, issues, asOf }) {
  const detail = useEmployeeDetail();

  const current = emps.reduce((a, e) => a + e.salary, 0);
  const previous = emps.reduce((a, e) => a + (e.previous ?? e.salary), 0);
  const tally = { ok: 0, above: 0, below: 0, none: 0 };
  emps.forEach((e) => tally[e.flag] += 1);
  const flagged = emps.filter((e) => e.review).length;
  const withDays = emps.filter((e) => e.daysSince !== null);
  const avgDays = withDays.length
    ? Math.round(withDays.reduce((a, e) => a + e.daysSince, 0) / withDays.length)
    : null;
  const banded = scale.filter((s) => s.banded).length;

  const insights = useMemo(() => employeeInsights(emps), [emps]);

  const byLoc = useMemo(() => {
    const m = {};
    for (const e of emps) {
      const l = (m[e.fac] ||= { name: e.fac.split(',')[0], total: 0, n: 0 });
      l.total += e.salary;
      l.n += 1;
    }
    return Object.values(m).sort((a, b) => b.total - a.total);
  }, [emps]);

  const alignBars = useMemo(
    () =>
      ['ok', 'above', 'below', 'none'].map((k) => ({
        name: ALIGN[k].label,
        n: tally[k],
        fill: ALIGN[k].color,
      })),
    [tally.ok, tally.above, tally.below, tally.none]
  );

  const byDept = useMemo(() => {
    const m = {};
    for (const e of emps) {
      const d = (m[e.dept] ||= { dept: e.dept, n: 0, total: 0, ok: 0, above: 0, below: 0, none: 0, flagged: 0 });
      d.n += 1;
      d.total += e.salary;
      d[e.flag] += 1;
      if (e.review) d.flagged += 1;
    }
    return Object.values(m).sort((a, b) => b.total - a.total);
  }, [emps]);

  const exceptions = useMemo(
    () =>
      emps
        .filter((e) => e.flag === 'below' || e.flag === 'above')
        .sort((a, b) => {
          const ga = a.flag === 'below' ? a.y[0] - a.salary : a.salary - a.y[4];
          const gb = b.flag === 'below' ? b.y[0] - b.salary : b.salary - b.y[4];
          return gb - ga;
        }),
    [emps]
  );

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-xl font-bold">Operations Overview</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
          The whole picture in one place: headcount and payroll, how pay sits against the published
          scale, and where the structure itself needs attention. Paylocity extract of {mdy(asOf)}.
        </p>
      </div>

      <section className="space-y-6">
        <SectionBanner
          title="Workforce"
          subtitle="Headcount and payroll from the Annual Salary Report."
        />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
          <KpiCard label="Total employees" value={count(emps.length)} sublabel={`Across ${count(byLoc.length)} facilities`} />
          <KpiCard label="Current annual" value={money(current)} basis="Paylocity" sublabel="Sum of annual salary" />
          <KpiCard
            label="Previous annual"
            value={money(previous)}
            sublabel={previous ? `${percent((current / previous - 1) * 100)} growth` : DASH}
            title="Employees with no salary history contribute their current salary to both totals, so growth is understated."
          />
          <KpiCard label="Scale roles" value={count(scale.length)} sublabel={`${count(banded)} with a published band`} />
          <KpiCard label="Total revenue" value={DASH} sublabel="Coming soon" />
          <KpiCard label="Salary % of rev." value={DASH} sublabel="Coming soon" />
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <Card title="Payroll by location" subtitle="Current annual salary, all employees.">
            <MoneyBar data={byLoc} xKey="name" yKey="total" name="Annual salary" />
          </Card>
          <Card title="By department" subtitle="Headcount and payroll. Rollup rows are not clickable.">
            <DataTable
              rows={byDept}
              maxHeight={300}
              caption={false}
              cols={[
                { key: 'dept', header: 'Department', sort: (r) => r.dept },
                { key: 'n', header: 'Staff', align: 'right', sort: (r) => r.n, render: (r) => count(r.n) },
                { key: 'total', header: 'Annual', align: 'right', sort: (r) => r.total, render: (r) => money(r.total) },
                { key: 'avg', header: 'Average', align: 'right', sort: (r) => r.total / r.n, render: (r) => money(r.total / r.n) },
                { key: 'flagged', header: 'Flagged', align: 'right', sort: (r) => r.flagged, render: (r) => count(r.flagged) },
              ]}
            />
          </Card>
        </div>
      </section>

      <section className="space-y-6">
        <SectionBanner
          title="Pay-band alignment"
          subtitle="Every employee measured against the band published for their role at their facility."
        />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <KpiCard label="Within band" value={count(tally.ok)} dot={ALIGN.ok.color} sublabel="Between YR1 and YR5" title={ALIGN_RULE} />
          <KpiCard label="Above band" value={count(tally.above)} dot={ALIGN.above.color} sublabel="Over YR5, no headroom left" title={ALIGN_RULE} />
          <KpiCard label="Below band" value={count(tally.below)} dot={ALIGN.below.color} sublabel="Under YR1" title={ALIGN_RULE} />
          <KpiCard label="No scale defined" value={count(tally.none)} dot={ALIGN.none.color} sublabel="No published band for the title" title={ALIGN_RULE} />
          <KpiCard
            label="Flagged for review"
            value={count(flagged)}
            dot={flagged > emps.length / 2 ? BAND_COLOR.red : BAND_COLOR.orange}
            sublabel={avgDays ? `Average ${count(avgDays)} days since change` : 'No change in over 365 days'}
          />
        </div>

        <Card title="Written Insights" subtitle="What the alignment numbers are saying.">
          <Insights items={insights} />
        </Card>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <Card title="Alignment distribution" subtitle="Colour is paired with a label — never the sole carrier.">
            <CountBar data={alignBars} xKey="name" yKey="n" colorKey="fill" name="Employees" />
          </Card>
          <Card
            title="Exceptions"
            subtitle="Everyone outside their band, widest gap first. Click a row for the full record."
          >
            <DataTable
              rows={exceptions}
              maxHeight={300}
              rowKey={(r) => r.id}
              onRowClick={(r) => detail.open(r)}
              empty="Everyone with a band sits inside it."
              cols={[
                { key: 'name', header: 'Employee', sort: (r) => r.name },
                { key: 'title', header: 'Job title', sort: (r) => r.title },
                { key: 'salary', header: 'Current', align: 'right', sort: (r) => r.salary, render: (r) => money(r.salary) },
                {
                  key: 'gap', header: 'Gap', align: 'right',
                  sort: (r) => (r.flag === 'below' ? r.y[0] - r.salary : r.salary - r.y[4]),
                  render: (r) => (
                    <span style={{ color: ALIGN[r.flag].color }}>
                      {r.flag === 'below' ? `−${money(r.y[0] - r.salary)}` : `+${money(r.salary - r.y[4])}`}
                    </span>
                  ),
                },
                {
                  key: 'flag', header: 'Alignment',
                  render: (r) => (
                    <span className="flex items-center gap-1.5 whitespace-nowrap" title={ALIGN_RULE}>
                      <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: ALIGN[r.flag].color }} aria-hidden="true" />
                      {ALIGN[r.flag].label}
                    </span>
                  ),
                },
                { key: 'daysSince', header: 'Since change', align: 'right', sort: (r) => r.daysSince, render: (r) => (r.daysSince === null ? DASH : days(r.daysSince)) },
              ]}
            />
          </Card>
        </div>
      </section>

      <section className="space-y-6">
        <SectionBanner
          title="Structure integrity"
          subtitle="Whether the scale itself holds together, independently of who is paid what."
        />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard label="Ceiling-rule breaks" value={count(viol.length)} dot={BAND_COLOR.orange} sublabel="YR3 at or above the next YR1" />
          <KpiCard label="Rows with no band" value={count(scale.length - banded)} dot={BAND_COLOR.none} sublabel="Exist in the structure, carry no values" />
          <KpiCard label="Open data issues" value={count(issues.length)} dot={issues.some((i) => i.sev === 'high') ? BAND_COLOR.red : BAND_COLOR.orange} sublabel="Tracked in the database" />
          <KpiCard label="Unfilled roles" value={count(scale.filter((s) => s.headcount === 0).length)} sublabel="Banded roles with nobody in them" />
        </div>
        <Card
          title="Widest ceiling breaks"
          subtitle="Where YR3 has overtaken the next role's YR1, so a promotion cannot come with a raise."
          right={
            <Link href="/quality" className="text-xs font-semibold hover:underline" style={{ color: 'var(--brand-ink)' }}>
              All {count(viol.length)} breaks →
            </Link>
          }
        >
          <DataTable
            rows={viol.slice(0, 8)}
            maxHeight={300}
            caption={false}
            cols={[
              { key: 'dept', header: 'Department' },
              { key: 'fac', header: 'Location' },
              { key: 'role', header: 'Role' },
              { key: 'yr3', header: 'YR3', align: 'right', render: (r) => money(r.yr3) },
              { key: 'next', header: 'Next role' },
              { key: 'nextYr1', header: 'Next YR1', align: 'right', render: (r) => money(r.nextYr1) },
              {
                key: 'overlap', header: 'Overlap', align: 'right',
                render: (r) => <span className="font-semibold" style={{ color: BAND_COLOR.red }}>{money(r.overlap)}</span>,
              },
            ]}
          />
        </Card>
      </section>
    </div>
  );
}
