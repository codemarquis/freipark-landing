import { type FormEvent, useState } from 'react';
import { StreetPhoto } from './StreetPhoto';
import appStoreBadge from './assets/badges/app-store-badge.svg';
import googlePlayBadge from './assets/badges/google-play-badge.png';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

type Status = 'idle' | 'loading' | 'done' | 'error';

export function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/waitlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({ email }),
      });
      // 201 = inserted; 409 = duplicate email (unique constraint) — both
      // mean the visitor is on the list, so treat as success either way.
      if (res.ok || res.status === 409) {
        setStatus('done');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  if (status === 'done') {
    return (
      <p className="text-lg font-medium text-emerald-600">
        You're on the list — we'll email you when FreiPark launches in Berlin.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
      <input
        type="email"
        required
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
      >
        {status === 'loading' ? 'Joining…' : 'Join the waitlist'}
      </button>
      {status === 'error' && (
        <p className="w-full text-sm text-red-600">Something went wrong — please try again.</p>
      )}
    </form>
  );
}

function StoreBadge({ src, alt, height }: { src: string; alt: string; height: number }) {
  return (
    <a href="#waitlist" className="inline-block transition hover:opacity-80" aria-label={alt}>
      <img src={src} alt={alt} height={height} style={{ height, width: 'auto' }} />
    </a>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <span className="text-lg font-bold text-slate-900">FreiPark</span>
        <span className="text-sm text-slate-500">Berlin · street parking, found fast</span>
      </header>

      <main className="mx-auto max-w-5xl px-6 pb-24">
        <section className="grid items-center gap-10 pt-8 sm:grid-cols-2 sm:pt-16">
          <div>
            <h1 className="text-4xl font-bold leading-tight text-slate-900 sm:text-5xl">
              Find free street parking in Berlin, before you circle the block.
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              FreiPark shows free, paid, and permit-zone spots on the map in real time. No booking,
              no surprises — just where to park, right now.
            </p>

            <div id="waitlist" className="mt-8 scroll-mt-24">
              <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-blue-600">
                Get early access
              </p>
              <WaitlistForm />
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <StoreBadge src={appStoreBadge} alt="Download on the App Store" height={48} />
              <StoreBadge src={googlePlayBadge} alt="Get it on Google Play" height={62} />
            </div>
            <p className="mt-2 text-xs text-slate-400">Launching soon — join the waitlist to be first to know.</p>
          </div>

          <StreetPhoto />
        </section>

        <section className="mt-24 grid gap-8 sm:grid-cols-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Live spot map</h2>
            <p className="mt-2 text-slate-600">
              Free, paid, and permit-zone spots, updated as you move around the city.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">One-tap directions</h2>
            <p className="mt-2 text-slate-600">
              Route straight to an open spot — no detours through app menus.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Pay where you already do</h2>
            <p className="mt-2 text-slate-600">
              Paid spots hand off to EasyPark or ParkNow — FreiPark never touches your payment.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-500">
        Built in Berlin with ❤️. © {new Date().getFullYear()} FreiPark.
      </footer>
    </div>
  );
}
