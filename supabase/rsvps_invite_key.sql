-- Run once if public.rsvps already exists without invite isolation.
-- Existing rows are tagged as 'complete' (groom invite) so the bride link stays empty until new RSVPs arrive.

alter table public.rsvps
  add column if not exists invite_key text;

update public.rsvps
set invite_key = 'complete'
where invite_key is null or invite_key = '';

alter table public.rsvps
  alter column invite_key set default 'complete';

alter table public.rsvps
  alter column invite_key set not null;

create index if not exists rsvps_invite_key_submitted_at_idx
  on public.rsvps (invite_key, submitted_at desc);
