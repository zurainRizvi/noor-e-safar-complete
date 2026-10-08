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

## RSVP with Supabase

Guest replies are saved through `RSVPService` in `src/services/rsvp.ts`. With Supabase configured, every Confirm RSVP writes to a shared `rsvps` table (WhatsApp is still optional). Without Supabase, responses stay in the browser’s local storage only.

### 1. Create the table

In Supabase → SQL Editor, run [`supabase/rsvps.sql`](supabase/rsvps.sql). If the table already existed, also run [`supabase/rsvps_invite_key.sql`](supabase/rsvps_invite_key.sql) so each invite link keeps its own guest list (`invite_key = 'complete'` for this site). That creates `public.rsvps` and anon insert/select policies for the frontend admin panel.

### 2. Environment variables

Copy `.env.example` to `.env.local` and set:

```bash
NEXT_PUBLIC_RSVP_ADAPTER=supabase
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_ADMIN_PASSWORD=your_private_password
```

Use only the public anon key in the browser; never expose a service-role key.

### 3. View responses

On the RSVP card, tap the muted **admin** label in the bottom-right corner, enter the admin password, then review attending / declining lists and total guest headcount. **Refresh** reloads from Supabase; **Reset list** clears every saved response (confirm first). If the table already existed before reset support was added, also run [`supabase/rsvps_allow_delete.sql`](supabase/rsvps_allow_delete.sql).

This is frontend-only: the password gate is the practical barrier. Anyone with the anon key can also query the table if they know how.

## Vercel deployment

1. Push this folder to a Git repository.
2. Import the repository in Vercel and select the Next.js preset.
3. Add the Supabase and admin password environment variables for production.
4. Deploy, verify the preview URL on iPhone Safari, Android Chrome, and WhatsApp’s in-app browser.
5. Confirm final map, calendar, music, RSVP, social preview, and noindex/access-control choices before sharing.

No copyrighted photos or commercial music are included.
