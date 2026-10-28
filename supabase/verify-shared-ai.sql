-- Optional operator verification after migration 002; read-only.
select relrowsecurity from pg_class where oid = 'public.elp_ai_budget'::regclass;
select has_table_privilege('anon','public.elp_ai_budget','SELECT') as anon_can_read_budget,
       has_table_privilege('anon','public.elp_ai_budget','INSERT') as anon_can_insert_budget,
       has_table_privilege('authenticated','public.elp_ai_budget','UPDATE') as signed_in_can_update_budget;
select has_function_privilege('anon','public.elp_consume_ai_request(text)','EXECUTE') as anon_can_reserve,
       has_function_privilege('service_role','public.elp_consume_ai_request(text)','EXECUTE') as server_can_reserve;
select day, requests from public.elp_ai_budget where bucket='global';
