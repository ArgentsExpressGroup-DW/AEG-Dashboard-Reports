'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { login } from './actions';

const LOGO = '/argents-logo.jpg';

export default function LoginForm() {
  const params = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [logoOk, setLogoOk] = useState(true);

  useEffect(() => {
    if (params.get('error')) setError('Your session has expired. Please sign in again.');
  }, [params]);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const next = params.get('next');
    const fd = new FormData();
    fd.set('email', email.trim().toLowerCase());
    fd.set('password', password);
    fd.set('next', next && next.startsWith('/') ? next : '/');
    const res = await login(fd);
    // A successful login redirects server-side and never returns.
    setLoading(false);
    setPassword('');
    setError(res?.error || 'Something went wrong. Please try again.');
  }

  return (
    <div className="w-full max-w-[400px]">
      {/* The logo asset is a JPG on white, so it sits on an explicit white
          plate to stay clean in dark mode. */}
      <div className="mb-10 inline-block rounded-md bg-white px-3 py-2">
        {logoOk ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={LOGO}
            alt="Argents"
            className="h-11 w-[248px] object-contain object-left"
            onError={() => setLogoOk(false)}
          />
        ) : (
          <div className="flex h-11 w-[248px] items-center">
            <span className="text-[26px] font-bold uppercase leading-none tracking-tight text-maroon">
              Argents
            </span>
          </div>
        )}
      </div>

      <h1 className="text-2xl font-bold tracking-tight">Sign in</h1>
      <p className="mt-1.5 text-sm" style={{ color: 'var(--muted)' }}>
        HR Operations &amp; Department Structure
      </p>

      <form className="mt-8 space-y-5" onSubmit={onSubmit} noValidate>
        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em]"
            style={{ color: 'var(--muted)' }}
          >
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            required
            autoFocus
            placeholder="you@argents.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border px-3.5 py-2.5 text-[15px] outline-none transition focus:border-maroon focus:ring-2 focus:ring-maroon/20"
            style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em]"
            style={{ color: 'var(--muted)' }}
          >
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={show ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border px-3.5 py-2.5 pr-16 text-[15px] outline-none transition focus:border-maroon focus:ring-2 focus:ring-maroon/20"
              style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              aria-label={show ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold uppercase tracking-wider transition-colors hover:text-maroon"
              style={{ color: 'var(--muted)' }}
            >
              {show ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-md border-l-2 border-maroon bg-maroon/5 px-3.5 py-3 text-sm"
            style={{ color: 'var(--text)' }}
          >
            <svg viewBox="0 0 20 20" className="mt-0.5 h-4 w-4 shrink-0 fill-maroon" aria-hidden="true">
              <path d="M10 1.6 18.7 17H1.3L10 1.6Zm0 5.2a.9.9 0 0 0-.9 1v3.6a.9.9 0 0 0 1.8 0V7.8a.9.9 0 0 0-.9-1Zm0 8.6a1.1 1.1 0 1 0 0-2.2 1.1 1.1 0 0 0 0 2.2Z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !email || !password}
          className="group flex w-full items-center justify-center gap-2 rounded-md bg-maroon px-4 py-3 text-[15px] font-semibold text-white transition hover:bg-maroon-bright disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Signing in…
            </>
          ) : (
            <>
              Sign in
              <svg viewBox="0 0 20 20" className="h-4 w-4 fill-current transition-transform group-hover:translate-x-0.5" aria-hidden="true">
                <path d="M10.6 4.4 9.4 5.6 13 9.2H3v1.6h10l-3.6 3.6 1.2 1.2 5.6-5.6-5.6-5.6Z" />
              </svg>
            </>
          )}
        </button>
      </form>

      <p
        className="mt-8 border-t pt-5 text-xs leading-relaxed"
        style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
      >
        Access is granted by the HR administrator. Passwords are set manually and are never reset
        automatically — contact HR Operations if you need yours changed.
      </p>
    </div>
  );
}
