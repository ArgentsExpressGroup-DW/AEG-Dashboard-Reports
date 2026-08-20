import Card from './Card';

export default function ComingSoon({ title, lead, blocks }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">{title}</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>{lead}</p>
      </div>
      {blocks.map((b) => (
        <Card key={b.title} title={b.title} subtitle={b.subtitle}>
          <div
            className="rounded-lg border px-3 py-2 text-sm"
            style={{ borderColor: '#E08A1E', background: '#E08A1E12' }}
          >
            <strong style={{ color: '#8A6D2F' }}>Waiting on input.</strong>{' '}
            <span style={{ color: 'var(--text)' }}>{b.blocked}</span>
          </div>
          <ul className="mt-4 space-y-1.5 text-sm" style={{ color: 'var(--muted)' }}>
            {b.planned.map((p) => (
              <li key={p} className="flex gap-2">
                <span className="text-maroon" aria-hidden="true">·</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </Card>
      ))}
    </div>
  );
}
