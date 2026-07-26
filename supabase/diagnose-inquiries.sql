-- Diagnostic for "new row violates row-level security policy" on inquiries.
-- Run in the Supabase SQL editor and share the output. Reads only; changes nothing.

-- 1. Which project is this? Compare the ref against NEXT_PUBLIC_SUPABASE_URL.
select current_database() as db, current_setting('request.jwt.claim.iss', true) as issuer;

-- 2. Every policy on the table.
--    `permissive` = 'RESTRICTIVE' on ANY row is the smoking gun: restrictive
--    policies AND together with the permissive ones, so one of them refusing
--    blocks the insert no matter how many permissive policies allow it.
select
  policyname,
  permissive,
  cmd,
  roles,
  qual        as using_expression,
  with_check  as with_check_expression
from pg_policies
where schemaname = 'public' and tablename = 'inquiries'
order by cmd, policyname;

-- 3. Is RLS on, and is it FORCED? (forced applies it to the table owner too.)
select relrowsecurity as rls_enabled, relforcerowsecurity as rls_forced
from pg_class
where oid = 'public.inquiries'::regclass;

-- 4. Table-level grants. The anon role needs INSERT here as well as a policy;
--    without the grant the error reads "permission denied" instead, but check
--    it anyway so we can rule it out in one pass.
select grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public' and table_name = 'inquiries'
  and grantee in ('anon', 'authenticated', 'public')
order by grantee, privilege_type;

-- 5. Confirm the table really is in the schema PostgREST serves.
select table_schema, table_name
from information_schema.tables
where table_name = 'inquiries';
