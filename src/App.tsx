import { type FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StreetPhoto } from './StreetPhoto';
import { SUPPORTED_LANGUAGES, setLanguage, type SupportedLanguage } from './i18n';
import appStoreBadge from './assets/badges/app-store-badge.svg';
import googlePlayBadge from './assets/badges/google-play-badge.png';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

const LANGUAGE_LABEL: Record<SupportedLanguage, string> = {
  de: 'DE',
  en: 'EN',
  tr: 'TR',
};

function LanguageSwitcher() {
  const { i18n } = useTranslation();
  return (
    <div className="flex gap-1.5">
      {SUPPORTED_LANGUAGES.map((lang) => (
        <button
          key={lang}
          type="button"
          onClick={() => setLanguage(lang)}
          className={`rounded-full px-2.5 py-1 text-xs font-bold transition ${
            i18n.language === lang
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
        >
          {LANGUAGE_LABEL[lang]}
        </button>
      ))}
    </div>
  );
}

type Status = 'idle' | 'loading' | 'done' | 'error';

export function WaitlistForm() {
  const { t } = useTranslation();
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
      <p className="text-lg font-medium text-emerald-600">{t('waitlist.success')}</p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
      <input
        type="email"
        required
        placeholder={t('waitlist.emailPlaceholder')}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
      >
        {status === 'loading' ? t('waitlist.joining') : t('waitlist.join')}
      </button>
      {status === 'error' && (
        <p className="w-full text-sm text-red-600">{t('waitlist.error')}</p>
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
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <span className="text-lg font-bold text-slate-900">FreiPark</span>
        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-slate-500 sm:inline">{t('header.tagline')}</span>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 pb-24">
        <section className="grid items-center gap-10 pt-8 sm:grid-cols-2 sm:pt-16">
          <div>
            <h1 className="text-4xl font-bold leading-tight text-slate-900 sm:text-5xl">
              {t('hero.headline')}
            </h1>
            <p className="mt-4 text-lg text-slate-600">{t('hero.subheadline')}</p>

            <div id="waitlist" className="mt-8 scroll-mt-24">
              <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-blue-600">
                {t('waitlist.label')}
              </p>
              <WaitlistForm />
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <StoreBadge src={appStoreBadge} alt={t('stores.appStoreAlt')} height={48} />
              <StoreBadge src={googlePlayBadge} alt={t('stores.googlePlayAlt')} height={62} />
            </div>
            <p className="mt-2 text-xs text-slate-400">{t('stores.launchingSoon')}</p>
          </div>

          <StreetPhoto />
        </section>

        <section className="mt-24 grid gap-8 sm:grid-cols-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{t('features.liveMapTitle')}</h2>
            <p className="mt-2 text-slate-600">{t('features.liveMapBody')}</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{t('features.directionsTitle')}</h2>
            <p className="mt-2 text-slate-600">{t('features.directionsBody')}</p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{t('features.paymentTitle')}</h2>
            <p className="mt-2 text-slate-600">{t('features.paymentBody')}</p>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-500">
        {t('footer.builtIn', { year: new Date().getFullYear() })}
      </footer>
    </div>
  );
}
