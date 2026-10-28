-- Non-destructive upgrade: preserves existing content keys and values, including legacy keys.
begin;

create table if not exists public.content (key text primary key, value text);
alter table public.content add column if not exists updated_at timestamptz not null default now();
alter table public.content enable row level security;
revoke all on public.content from public, anon, authenticated;
grant select on public.content to anon, authenticated;
grant all on public.content to service_role;

-- This package owns the content table's policies. Remove old permissive policies.
do $$ declare p record; begin
  for p in select policyname from pg_policies where schemaname = 'public' and tablename = 'content'
  loop execute format('drop policy %I on public.content', p.policyname); end loop;
end $$;
create policy elp_public_read on public.content for select to anon, authenticated using (true);

create or replace function public.elp_touch_content() returns trigger
language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end;
$$;
revoke all on function public.elp_touch_content() from public, anon, authenticated;
drop trigger if exists elp_content_updated_at on public.content;
create trigger elp_content_updated_at before update on public.content
for each row execute function public.elp_touch_content();

create table if not exists public.elp_login_attempts (
  bucket text primary key,
  window_start timestamptz not null,
  attempts integer not null
);
alter table public.elp_login_attempts enable row level security;
revoke all on public.elp_login_attempts from public, anon, authenticated;
grant all on public.elp_login_attempts to service_role;

-- Atomic and shared across server instances. Both per-client and account-wide limits.
create or replace function public.elp_consume_login_attempt(bucket_key text) returns boolean
language plpgsql security definer set search_path = '' as $$
declare client_count integer; account_count integer;
begin
  if bucket_key !~ '^[a-f0-9]{64}$' then raise exception 'Invalid bucket'; end if;
  delete from public.elp_login_attempts where window_start < now() - interval '1 day';
  insert into public.elp_login_attempts as t values ('account', now(), 1)
  on conflict (bucket) do update set
    attempts = case when t.window_start < now() - interval '15 minutes' then 1 else t.attempts + 1 end,
    window_start = case when t.window_start < now() - interval '15 minutes' then now() else t.window_start end
  returning attempts into account_count;
  insert into public.elp_login_attempts as t values (bucket_key, now(), 1)
  on conflict (bucket) do update set
    attempts = case when t.window_start < now() - interval '15 minutes' then 1 else t.attempts + 1 end,
    window_start = case when t.window_start < now() - interval '15 minutes' then now() else t.window_start end
  returning attempts into client_count;
  return client_count <= 10 and account_count <= 100;
end;
$$;
revoke all on function public.elp_consume_login_attempt(text) from public, anon, authenticated;
grant execute on function public.elp_consume_login_attempt(text) to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('images', 'images', true, 5242880, array['image/webp','image/jpeg','image/png','image/avif'])
on conflict (id) do nothing;
-- Existing bucket settings/policies are intentionally not overwritten. Inspect separately.
commit;
