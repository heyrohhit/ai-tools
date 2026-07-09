-- AI Prompt Hub — Admin write access (RLS)
--
-- The public site uses the anon/publishable key: everyone can SELECT, and anon
-- may only INSERT well-formed `source='generated'` rows (see schema.sql). There
-- is deliberately NO update/delete access for anon.
--
-- The admin panel signs in through Supabase Auth (email + password, bcrypt-hashed
-- by Supabase). That gives the request an authenticated JWT whose `email` claim
-- we check below. So UPDATE and DELETE are possible ONLY for the admin account —
-- enforced at the database layer, independent of the app code.
--
-- SETUP (one-time):
--   1. Supabase Dashboard → Authentication → Users → "Add user"
--        Email:    rkwebsai@admin.com
--        Password: AdminRkWebs@Ai
--        Auto Confirm User: ON
--      (Supabase stores this bcrypt-hashed in auth.users — never in this repo.)
--   2. Run this whole file in the Supabase SQL editor.
--
-- To change the admin email, update the string in BOTH policies below.

-- ── Admin UPDATE ─────────────────────────────────────────────────────────────
-- Admin may edit any prompt (title, content, metadata, featured flag).
drop policy if exists "Admin can update prompts" on public.prompts;
create policy "Admin can update prompts"
  on public.prompts
  for update
  to authenticated
  using (auth.email() = 'rkwebsai@admin.com')
  with check (auth.email() = 'rkwebsai@admin.com');

-- ── Admin DELETE ─────────────────────────────────────────────────────────────
-- Admin may delete any prompt (e.g. spam / low-quality generations).
drop policy if exists "Admin can delete prompts" on public.prompts;
create policy "Admin can delete prompts"
  on public.prompts
  for delete
  to authenticated
  using (auth.email() = 'rkwebsai@admin.com');

-- Note: the existing "Public read access" and "Anon can insert generated prompts"
-- policies from schema.sql are left untouched. Anon still cannot update or delete
-- anything — those actions require the admin JWT above.
