'use client';
import { useEffect, useState } from 'react';

const KEY = 'aeg-theme';

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'));
    setReady(true);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    try { localStorage.setItem(KEY, next ? 'dark' : 'light'); } catch {}
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle light/dark mode"
      title="Toggle light/dark mode"
      className="rounded-md border px-2 py-1 text-sm transition-colors hover:border-maroon"
      style={{ borderColor: 'var(--border)' }}
    >
      {ready ? (dark ? '☀ Light' : '☾ Dark') : '☾ Dark'}
    </button>
  );
}
