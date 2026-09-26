# Noor-e-Safar

A cinematic, mobile-first Pakistani Muslim wedding invitation prototype built with Next.js, TypeScript, Tailwind CSS, and Framer Motion.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. For production verification, run `npm run lint`, `npm run typecheck`, and `npm run build`.

## Customize

- `src/config/wedding.ts`: names, families, wording, events, dates, venues, map links, story, gallery, RSVP, WhatsApp, music, social preview, and optional sections.
- `src/config/translations.ts`: English and Urdu/RTL labels. Missing production translations should fall back to English.
- `src/config/theme.ts`: shared and event palettes, fonts, motion, particles, radii, and shadows.
- `public/gallery`: replace the abstract local SVG placeholders with optimized, licensed or personally owned WebP/AVIF images and update their paths in the config.
- `public/audio/placeholder.mp3`: replace with a licensed or personally owned track using the same filename, or update `musicPath`. Audio starts only after guest interaction.
- `public/social-preview.svg`: replace the sample social card after names are final.

Do not put real secrets in client code. The prototype is marked `noindex`, but a public URL is not private without access control.

## Urdu and RTL

The language switch changes the document reading direction to RTL and uses the local Amiri font. Add complete Urdu values in `src/config/translations.ts`; presentation components do not contain translations.

## RSVP and Supabase phase

The prototype saves one response to the browser’s local storage through the `RSVPService` interface in `src/services/rsvp.ts`. It is device-local and is not a real guest database.

For production, create a Supabase `rsvps` table, enable Row Level Security, add an insert-only policy with rate limiting or CAPTCHA where appropriate, validate and sanitize fields server-side, and replace `LocalRSVPService` with a Supabase adapter. Use only `NEXT_PUBLIC_SUPABASE_URL` and the public anon key in the browser; never expose a service-role key. Keep private values in `.env.local`.

## Vercel deployment

1. Push this folder to a Git repository.
2. Import the repository in Vercel and select the Next.js preset.
3. Add production environment variables only when the Supabase phase begins.
4. Deploy, verify the preview URL on iPhone Safari, Android Chrome, and WhatsApp’s in-app browser.
5. Confirm final map, calendar, music, RSVP, social preview, and noindex/access-control choices before sharing.

No copyrighted photos or commercial music are included.
