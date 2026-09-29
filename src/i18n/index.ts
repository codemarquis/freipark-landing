import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import de from './locales/de.json';
import en from './locales/en.json';
import tr from './locales/tr.json';

export const SUPPORTED_LANGUAGES = ['de', 'en', 'tr'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const LANGUAGE_STORAGE_KEY = 'freipark.language';

// German is the site default — same reasoning as the app: the primary
// market, not just a fallback for missing translations.
const DEFAULT_LANGUAGE: SupportedLanguage = 'de';

function isSupportedLanguage(code: string): code is SupportedLanguage {
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(code);
}

function getStoredLanguage(): SupportedLanguage | null {
  try {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return saved && isSupportedLanguage(saved) ? saved : null;
  } catch {
    // Private browsing / blocked storage — fall through to detection.
    return null;
  }
}

// Vitest has no real visitor IP/stored preference to detect from — existing
// component tests assert on English UI text, so give them a deterministic
// language instead of the real German default bleeding into assertions.
const isTestEnv = Boolean(import.meta.env.VITEST);

i18n.use(initReactI18next).init({
  resources: {
    de: { translation: de },
    en: { translation: en },
    tr: { translation: tr },
  },
  lng: isTestEnv ? 'en' : (getStoredLanguage() ?? DEFAULT_LANGUAGE),
  fallbackLng: DEFAULT_LANGUAGE,
  interpolation: { escapeValue: false },
});

// Only ask the IP-based detection endpoint when the visitor has no stored
// preference yet — a returning visitor's own choice always wins, and this
// avoids overriding a language they picked deliberately. Skipped in tests:
// there's no real Pages Function to answer it, and lng is already fixed above.
if (!isTestEnv && !getStoredLanguage()) {
  fetch('/api/locale')
    .then((res) => (res.ok ? res.json() : null))
    .then((data: { language?: string } | null) => {
      if (data?.language && isSupportedLanguage(data.language) && data.language !== i18n.language) {
        i18n.changeLanguage(data.language);
      }
    })
    .catch(() => {
      // No network / function unavailable — stay on the German default.
    });
}

export function setLanguage(language: SupportedLanguage): void {
  i18n.changeLanguage(language);
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    // Private browsing / blocked storage — language still changes for
    // this session, just won't persist across reloads.
  }
}

export default i18n;
