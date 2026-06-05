-- Prepara o MVP privado com ownership por usuário autenticado.
-- Mantém a leitura demo anon existente e não abre escrita pública.

alter table public.properties
add column if not exists owner_id uuid references auth.users(id) on delete cascade;

create index if not exists properties_owner_id_idx
on public.properties(owner_id);

alter table public.properties enable row level security;

grant select on table public.properties to anon;
grant select, insert, update, delete on table public.properties to authenticated;
grant select, insert, update, delete on table public.properties to service_role;

drop policy if exists properties_demo_read_outdated on public.properties;
create policy properties_demo_read_outdated
on public.properties
for select
to anon
using (source_is_outdated is true);

drop policy if exists properties_owner_select on public.properties;
create policy properties_owner_select
on public.properties
for select
to authenticated
using (owner_id = (select auth.uid()));

drop policy if exists properties_owner_insert on public.properties;
create policy properties_owner_insert
on public.properties
for insert
to authenticated
with check (owner_id = (select auth.uid()));

drop policy if exists properties_owner_update on public.properties;
create policy properties_owner_update
on public.properties
for update
to authenticated
using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));

drop policy if exists properties_owner_delete on public.properties;
create policy properties_owner_delete
on public.properties
for delete
to authenticated
using (owner_id = (select auth.uid()));
