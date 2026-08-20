import { money, count } from './format';

/** Computed from the FILTERED rows, so insights re-narrate as the user filters. */
export function employeeInsights(rows) {
  const out = [];
  if (!rows.length) return out;

  const below = rows.filter((e) => e.flag === 'below');
  const above = rows.filter((e) => e.flag === 'above');
  const none = rows.filter((e) => e.flag === 'none');
  const stale = rows.filter((e) => e.review);
  const noHist = rows.filter((e) => e.daysSince === null);

  if (below.length) {
    const worst = [...below].sort((a, b) => a.salary - a.y[0] - (b.salary - b.y[0]))[0];
    out.push({
      sev: 'alert',
      title: `${count(below.length)} paid below the bottom of their band`,
      body: `${below.map((e) => e.name).join(', ')}. The widest gap is ${worst.name} at ${money(worst.salary)} against a YR1 of ${money(worst.y[0])} — ${money(worst.y[0] - worst.salary)} short. Either the band is wrong for this role or the title is.`,
    });
  }

  if (stale.length) {
    const withDays = rows.filter((e) => e.daysSince !== null);
    const avg = withDays.length
      ? Math.round(withDays.reduce((a, e) => a + e.daysSince, 0) / withDays.length)
      : null;
    out.push({
      sev: stale.length > rows.length / 2 ? 'alert' : 'watch',
      title: `${count(stale.length)} of ${count(rows.length)} flagged for review`,
      body: `${count(noHist.length)} have no salary history at all; the rest have had no change in over 365 days.${
        avg ? ` Average time since last change across those with history is ${count(avg)} days.` : ''
      } This is a retention exposure as much as a pay-equity one.`,
    });
  }

  if (above.length) {
    out.push({
      sev: 'watch',
      title: `${count(above.length)} paid above the top of their band`,
      body: `${above.map((e) => `${e.name} (${money(e.salary)} vs YR5 ${money(e.y[4])})`).join('; ')}. Being over YR5 removes the headroom the scale is meant to provide, so the next raise has nowhere to sit without a title change.`,
    });
  }

  if (none.length) {
    const cost = none.reduce((a, e) => a + e.salary, 0);
    out.push({
      sev: 'info',
      title: `${count(none.length)} employees have no band to measure against`,
      body: `${money(cost)} of payroll sits outside the scale entirely — Admin, Drivers, Sales and warehouse roles have no published band. These are counted in every total but excluded from alignment.`,
    });
  }

  return out;
}

export function scaleInsights(rows, viol) {
  const out = [];
  const blank = rows.filter((s) => !s.banded);
  if (viol.length) {
    const worst = viol[0];
    out.push({
      sev: 'alert',
      title: `${count(viol.length)} ceiling-rule breaks in the scale`,
      body: `A role's YR3 should stay below the next role's YR1 so a title change and a raise can land together. The widest break is ${worst.dept} ${worst.role} at ${worst.fac}: YR3 is ${money(worst.yr3)} against ${worst.next} starting at ${money(worst.nextYr1)} — an overlap of ${money(worst.overlap)}.`,
    });
  }
  if (blank.length) {
    out.push({
      sev: 'watch',
      title: `${count(blank.length)} scale rows have no published band`,
      body: `These rows exist in the structure but carry no salary values, so nobody in them can be assessed. Import at Tacoma and Hilton Head account for most of them, plus Customer Care Manager I at all four facilities.`,
    });
  }
  return out;
}
