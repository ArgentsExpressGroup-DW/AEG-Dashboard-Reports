'use client';
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { moneyShort, money, count } from '../lib/format';
import { MAROON } from '../lib/bands';

const AXIS = { fontSize: 11, fill: 'var(--muted)' };
const TIP = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  color: 'var(--text)',
};
const MARGIN = { top: 8, right: 8, left: 8, bottom: 8 };

export function MoneyBar({ data, xKey, yKey, colorKey, name = 'Amount', height = 280 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={MARGIN}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey={xKey} tick={AXIS} interval={0} angle={-12} textAnchor="end" height={54} />
        <YAxis tick={AXIS} tickFormatter={moneyShort} />
        <Tooltip contentStyle={TIP} formatter={(v) => money(v)} />
        <Bar dataKey={yKey} name={name} radius={[3, 3, 0, 0]} fill={MAROON}>
          {colorKey && data.map((d, i) => <Cell key={i} fill={d[colorKey] || MAROON} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CountBar({ data, xKey, yKey, colorKey, name = 'Employees', height = 280 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={MARGIN}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey={xKey} tick={AXIS} interval={0} angle={-12} textAnchor="end" height={54} />
        <YAxis tick={AXIS} allowDecimals={false} />
        <Tooltip contentStyle={TIP} formatter={(v) => count(v)} />
        <Bar dataKey={yKey} name={name} radius={[3, 3, 0, 0]} fill={MAROON}>
          {colorKey && data.map((d, i) => <Cell key={i} fill={d[colorKey] || MAROON} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function BandLine({ data, height = 280 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={MARGIN}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="yr" tick={AXIS} />
        <YAxis tick={AXIS} tickFormatter={moneyShort} />
        <Tooltip contentStyle={TIP} formatter={(v) => money(v)} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line type="monotone" dataKey="current" name="Current scale" stroke={MAROON} strokeWidth={2} dot />
        {/* Spec names charcoal #21201E as chart series 2, but charcoal is invisible on the
            dark surface. var(--text) preserves the token-driven re-theming the spec requires. */}
        <Line type="monotone" dataKey="modelled" name="Modelled" stroke="var(--text)" strokeWidth={2} dot />
      </LineChart>
    </ResponsiveContainer>
  );
}
