# FreiPark Landing

Waitlist landing page for [FreiPark](https://github.com/codemarquis/freipark) — Berlin street parking, found fast.

Vite + React + TypeScript + Tailwind. Signups POST to the FreiPark self-hosted
Supabase's `waitlist` table (RLS: anon can insert only).

## Develop

```bash
npm install
npm run dev
```

Requires a `.env` with:

```
VITE_SUPABASE_URL=https://supabase.freipark.com
VITE_SUPABASE_ANON_KEY=<anon key, same one used by the mobile app>
```

## Deploy

Cloudflare Pages, connected to this repo:

- Build command: `npm run build`
- Output directory: `dist`
- Environment variables: same two as above
