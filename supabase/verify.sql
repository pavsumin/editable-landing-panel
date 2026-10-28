-- Run as postgres in the Supabase SQL Editor after applying the migration.
-- These statements inspect configuration only and never modify website content.
select relrowsecurity from pg_class where oid = 'public.content'::regclass;
select grantee, privilege_type from information_schema.role_table_grants
where table_schema = 'public' and table_name in ('content','elp_login_attempts')
order by table_name, grantee, privilege_type;
select schemaname, tablename, policyname, roles, cmd, qual, with_check
from pg_policies where schemaname = 'public' and tablename in ('content','elp_login_attempts');
select has_table_privilege('anon','public.content','SELECT') as anon_can_read,
       has_table_privilege('anon','public.content','INSERT') as anon_can_insert,
       has_table_privilege('anon','public.content','UPDATE') as anon_can_update,
       has_table_privilege('anon','public.content','DELETE') as anon_can_delete,
       has_table_privilege('anon','public.content','TRUNCATE') as anon_can_truncate;
select has_function_privilege('anon','public.elp_consume_login_attempt(text)','EXECUTE') as anon_can_throttle,
       has_function_privilege('service_role','public.elp_consume_login_attempt(text)','EXECUTE') as server_can_throttle;
select id, public, file_size_limit, allowed_mime_types from storage.buckets where id = 'images';
-- Review ALL storage write policies. A policy for another bucket may be permissive globally.
select policyname, roles, cmd, qual, with_check from pg_policies where schemaname='storage' and tablename='objects';
