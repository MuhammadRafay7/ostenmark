-- ---------------------------------------------------------------------------
-- Inquiries table + row-level security
-- ---------------------------------------------------------------------------
-- Run this once in the Supabase SQL editor (Dashboard → SQL Editor → New query).
-- It is idempotent: running it twice is harmless.
--
-- WHY THIS EXISTS
-- The contact form submits through a server action that uses the *anon* key, so
-- row-level security applies to it like any browser client. With RLS enabled and
-- no INSERT policy, every submission was rejected with
--
--     42501: new row violates row-level security policy for table "inquiries"
--
-- so nothing ever reached /admin/inbox. Reads were failing the same way from the
-- other side: no SELECT policy means the admin inbox gets an empty list rather
-- than an error, which looks identical to "no one has written in".
--
-- THE SHAPE OF THE ACCESS
--   anon          → INSERT only. The public may leave a message and nothing else.
--   authenticated → full access. This is you, signed in at /admin/login.
--
-- anon deliberately has NO select policy: inquiries contain a prospect's name,
-- email and project details, and the anon key ships to every browser. Granting
-- anon SELECT would publish your entire lead list to anyone who opened devtools.
-- ---------------------------------------------------------------------------

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- Backfills the columns the app expects if the table predates them. `read`
-- needs its default, or the form's insert (which never sets it) fails.
alter table public.inquiries add column if not exists read boolean not null default false;
alter table public.inquiries add column if not exists created_at timestamptz not null default now();

-- The inbox lists newest-first and this is the only ordering it uses.
create index if not exists inquiries_created_at_idx
  on public.inquiries (created_at desc);

alter table public.inquiries enable row level security;

-- Legacy policy from an earlier setup. Its WITH CHECK expression rejects anon,
-- which is what produced the 42501 on every submission. Replaced by the insert
-- policy below rather than edited, so the rule is visible in this file.
drop policy if exists "Enable insert for everyone" on public.inquiries;

-- Dropped first so re-running picks up any change to the definitions below.
drop policy if exists "Public can submit an inquiry"      on public.inquiries;
drop policy if exists "Authenticated can read inquiries"  on public.inquiries;
drop policy if exists "Authenticated can update inquiries" on public.inquiries;
drop policy if exists "Authenticated can delete inquiries" on public.inquiries;

-- Write-only for the public: with no USING clause and no select policy, a
-- submitter cannot read back what they or anyone else wrote.
create policy "Public can submit an inquiry"
  on public.inquiries for insert
  to anon, authenticated
  with check (true);

create policy "Authenticated can read inquiries"
  on public.inquiries for select
  to authenticated
  using (true);

-- Powers the read/unread toggle in the admin inbox.
create policy "Authenticated can update inquiries"
  on public.inquiries for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated can delete inquiries"
  on public.inquiries for delete
  to authenticated
  using (true);
