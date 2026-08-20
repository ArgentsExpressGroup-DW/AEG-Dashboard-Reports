import { cache } from 'react';
import { createClient } from '@supabase/supabase-js';
import { CFG } from './config';

// Server-only client. Uses the secret key, which bypasses RLS.
// Never import this from a client component.
export function db() {
  return createClient(CFG.url, CFG.key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

const FLAG = { green: 'ok', orange: 'above', red: 'below', grey: 'none' };
const num = (v) => (v === null || v === undefined ? null : Number(v));

/** One fetch per request, shared across layout and page. */
export const loadDashboard = cache(async () => {
  const s = db();
  const [scale, emps, hist, viol, issues] = await Promise.all([
    s.from('v_scale_tab1').select('*'),
    s.from('v_employee_alignment').select('*'),
    s.from('salary_history')
      .select('employee_id,start_date,change_type,new_annual,old_annual')
      .order('start_date'),
    s.from('v_scale_ceiling_violations').select('*'),
    s.from('data_quality_issues').select('*').eq('resolved', false).order('id'),
  ]);
  const bad = [scale, emps, hist, viol, issues].find((r) => r.error);
  if (bad) throw new Error(bad.error.message);

  const byEmp = {};
  for (const h of hist.data) (byEmp[h.employee_id] ||= []).push(h);

  return {
    asOf: emps.data[0]?.report_date ?? null,
    scale: scale.data.map((r) => ({
      id: r.id,
      dept: r.department,
      fac: r.facility_name,
      loc: r.location_code,
      role: r.role_short,
      roleFull: r.role_title,
      fam: r.role_family,
      lvl: r.role_level,
      expBase: num(r.experience_base),
      expPrem: num(r.experience_premium),
      baseHr: num(r.base_hr),
      premHr: num(r.premium_hr),
      y: [r.yr1, r.yr2, r.yr3, r.yr4, r.yr5].map(num),
      y6: num(r.yr6),
      banded: r.is_populated,
      headcount: r.headcount,
    })),
    emps: emps.data.map((e) => ({
      id: e.employee_id,
      name: e.full_name,
      dept: e.department,
      fac: e.facility_name,
      loc: e.location_code,
      title: e.job_title,
      salary: num(e.annual_salary),
      previous: num(e.previous_annual),
      bucket: e.yr_bucket,
      flag: FLAG[e.alignment_flag] ?? 'none',
      y: e.yr1 === null ? null : [e.yr1, e.yr2, e.yr3, e.yr4, e.yr5].map(num),
      lastChange: e.last_change_date,
      daysSince: num(e.days_since_change),
      review: e.review_flag,
      history: (byEmp[e.employee_id] || []).map((h) => ({
        date: h.start_date,
        type: h.change_type,
        to: num(h.new_annual),
        from: num(h.old_annual),
      })),
    })),
    viol: viol.data.map((v) => ({
      dept: v.department, fac: v.facility_name, role: v.role_short,
      yr3: num(v.yr3), next: v.next_role, nextYr1: num(v.next_yr1), overlap: num(v.overlap),
    })),
    issues: issues.data.map((i) => ({
      sev: i.severity, category: i.category,
      entity: i.entity || i.category, detail: i.detail,
    })),
  };
});
