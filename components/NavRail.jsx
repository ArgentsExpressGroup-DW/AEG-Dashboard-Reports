'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const SECTIONS = [
  { id: 'landing', label: null, items: [{ href: '/', name: 'Overview (Master)', icon: '◆' }] },
  {
    id: 'structure',
    label: 'Department Structure',
    items: [
      { href: '/scale', name: 'Salary Scale', icon: '▤' },
      { href: '/outlook', name: 'Department Outlook', icon: '◉' },
    ],
  },
  {
    id: 'analysis',
    label: 'Analysis',
    items: [
      { href: '/quality', name: 'Data Quality', icon: '⚑' },
      { href: '/metrics', name: 'Metrics & Budgets', icon: '◱' },
      { href: '/market', name: 'Market Analysis', icon: '◐' },
    ],
  },
];

const K_COLLAPSED = 'aeg.nav.collapsed';
const K_SECTIONS = 'aeg.nav.sections';

export default function NavRail() {
  const pathname = usePathname();
  const [hydrated, setHydrated] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [closed, setClosed] = useState([]);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(K_COLLAPSED) === '1');
      const raw = localStorage.getItem(K_SECTIONS);
      if (raw) setClosed(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  function toggleRail() {
    const next = !collapsed;
    setCollapsed(next);
    try { localStorage.setItem(K_COLLAPSED, next ? '1' : '0'); } catch {}
  }

  function toggleSection(id) {
    const next = closed.includes(id) ? closed.filter((x) => x !== id) : [...closed, id];
    setClosed(next);
    try { localStorage.setItem(K_SECTIONS, JSON.stringify(next)); } catch {}
  }

  const isActive = (href) => (href === '/' ? pathname === '/' : pathname.startsWith(href));
  const shut = hydrated && collapsed;

  return (
    <nav
      className="shrink-0 border-r transition-all duration-150"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)', width: shut ? 56 : 232 }}
      aria-label="Navigation"
    >
      <div className="flex items-center justify-between px-2 py-2">
        {!shut && (
          <span
            className="px-1 text-[10px] font-semibold uppercase tracking-wide"
            style={{ color: 'var(--muted)' }}
          >
            Navigation
          </span>
        )}
        <button
          type="button"
          onClick={toggleRail}
          aria-label={shut ? 'Expand navigation' : 'Collapse navigation'}
          title={shut ? 'Expand navigation' : 'Collapse navigation'}
          className="rounded-md border px-1.5 py-0.5 text-xs transition-colors hover:border-maroon"
          style={{ borderColor: 'var(--border)' }}
        >
          {shut ? '»' : '«'}
        </button>
      </div>

      {SECTIONS.map((section) => {
        const isShut = closed.includes(section.id);
        return (
          <div key={section.id} className="mb-1">
            {section.label && !shut && (
              <button
                type="button"
                onClick={() => toggleSection(section.id)}
                className="flex w-full items-center justify-between px-3 py-1 text-[11px] font-semibold uppercase tracking-wide transition-colors hover:text-maroon"
                style={{ color: 'var(--muted)' }}
              >
                <span>{section.label}</span>
                <span className="text-[9px]" aria-hidden="true">{isShut ? '▸' : '▾'}</span>
              </button>
            )}
            {section.label && shut && (
              <div className="mx-2 mb-1 border-t" style={{ borderColor: 'var(--border)' }} />
            )}

            {(shut || !isShut) && (
              <div className="space-y-0.5 px-2">
                {section.items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={shut ? item.name : undefined}
                      className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium transition-colors hover:bg-maroon/10 ${
                        shut ? 'justify-center' : ''
                      }`}
                      style={
                        active
                          ? { background: '#98012E18', color: 'var(--brand-ink)', boxShadow: 'inset 2px 0 0 #98012E' }
                          : undefined
                      }
                    >
                      <span className="w-4 shrink-0 text-center text-[13px]" aria-hidden="true">
                        {item.icon}
                      </span>
                      {!shut && <span className="truncate">{item.name}</span>}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
