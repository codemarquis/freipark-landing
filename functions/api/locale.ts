// Cloudflare Pages Function — reads the CF-IPCountry header Cloudflare
// already attaches to every request (free, no external geolocation API)
// and maps it to one of the site's supported languages. Called once on
// first page load, before any language preference is stored locally.
//
// German is the site default for anyone not clearly Turkish or from a
// non-German-speaking country — matches the app's own "unrecognized
// locale falls back to German, not English" rule.

const GERMAN_SPEAKING = new Set(['DE', 'AT', 'CH', 'LI']);

export const onRequestGet: PagesFunction = async (context) => {
  const country = context.request.headers.get('CF-IPCountry') ?? '';

  let language: 'de' | 'en' | 'tr' = 'de';
  if (country === 'TR') {
    language = 'tr';
  } else if (country && !GERMAN_SPEAKING.has(country)) {
    language = 'en';
  }

  return new Response(JSON.stringify({ language, country }), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
};
