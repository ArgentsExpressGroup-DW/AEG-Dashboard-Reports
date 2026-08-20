import { Suspense } from 'react';
import LoginForm from './login-form';
import RoutePanel from './route-panel';

export const metadata = { title: 'Sign in — HR Operations & Department Structure' };

const WASH =
  'radial-gradient(120% 90% at 18% 82%, rgba(152,1,46,.34) 0%, rgba(152,1,46,0) 58%),' +
  'linear-gradient(115deg, rgba(33,32,30,.94) 8%, rgba(33,32,30,.5) 52%, rgba(33,32,30,.9) 100%)';

const PROOF = [
  ['205 bands', '7 departments'],
  ['4 facilities', 'One scale'],
  ['Every change', 'Fully traced'],
];

export default function LoginPage() {
  return (
    <main className="min-h-screen w-full lg:grid lg:grid-cols-[1.15fr_1fr]">
      <section className="relative hidden overflow-hidden bg-charcoal lg:block">
        <RoutePanel />
        <div className="absolute inset-0" style={{ background: WASH }} aria-hidden="true" />
        <div className="relative z-10 flex h-full flex-col justify-between p-12 xl:p-16">
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-maroon-bright" aria-hidden="true" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.32em] text-white/50">
              Argents Express Group
            </span>
          </div>

          <div>
            <h2 className="text-[2.75rem] font-bold leading-[1.08] tracking-tight text-white xl:text-5xl">
              Every role.
              <br />
              Every band.
              <br />
              <span className="text-maroon-bright">One structure.</span>
            </h2>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-white/55">
              The department scale, current pay and every salary movement in one place — so
              promotions, raises and cost-of-living adjustments can be judged against the same
              structure.
            </p>
          </div>

          <dl className="grid grid-cols-3 gap-6 border-t border-white/10 pt-8">
            {PROOF.map(([term, detail]) => (
              <div key={term}>
                <dt className="text-sm font-semibold text-white">{term}</dt>
                <dd className="text-[11px] uppercase tracking-wider text-white/40">{detail}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section
        className="flex min-h-screen items-center justify-center px-6 py-12 sm:px-10"
        style={{ background: 'var(--surface)' }}
      >
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </section>
    </main>
  );
}
