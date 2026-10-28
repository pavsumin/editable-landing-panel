-- Only the operator hosting the optional shared AI service needs this migration.
-- No website content rows or existing login protection are changed.
begin;
create table if not exists public.elp_ai_budget (
  bucket text primary key,
  day date not null,
  requests integer not null
);
alter table public.elp_ai_budget enable row level security;
revoke all on public.elp_ai_budget from public, anon, authenticated;
grant all on public.elp_ai_budget to service_role;

-- Fixed conservative bounds: 3 requests/client/day, 20 total/day (UTC).
-- Reserve before generation, including failed provider calls. Never a provider-quota guarantee.
create or replace function public.elp_consume_ai_request(client_bucket text) returns boolean
language plpgsql security definer set search_path = '' as $$
declare today date := (now() at time zone 'UTC')::date;
        client_requests integer;
        total_requests integer;
begin
  if client_bucket !~ '^[a-f0-9]{64}$' then raise exception 'Invalid bucket'; end if;
  -- Serialize reservations across instances so requests cannot race past the global cap.
  perform pg_advisory_xact_lock(732682019);
  delete from public.elp_ai_budget where day < today;
  select requests into total_requests from public.elp_ai_budget where bucket='global' and day=today;
  select requests into client_requests from public.elp_ai_budget where bucket=client_bucket and day=today;
  if coalesce(total_requests,0) >= 20 or coalesce(client_requests,0) >= 3 then return false; end if;
  insert into public.elp_ai_budget as t values ('global',today,1)
  on conflict (bucket) do update set requests=t.requests+1, day=today;
  insert into public.elp_ai_budget as t values (client_bucket,today,1)
  on conflict (bucket) do update set requests=t.requests+1, day=today;
  return true;
end;
$$;
revoke all on function public.elp_consume_ai_request(text) from public, anon, authenticated;
grant execute on function public.elp_consume_ai_request(text) to service_role;
commit;
