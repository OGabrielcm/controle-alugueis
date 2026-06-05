-- Supabase schema inicial para Controle de Aluguéis
create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  building_name text not null,
  property_address text,
  is_rented boolean not null default false,
  tenant_name text,
  tenant_contact text,
  contract_start_date date,
  contract_end_date date,
  has_annual_adjustment boolean not null default false,
  rent_adjustment_base_date date,
  rent_adjustment_index text,
  contract_notes text,
  payment_due_date date,
  is_rent_paid boolean not null default false,
  rent_amount numeric(12,2) not null default 0 check (rent_amount >= 0),
  condo_amount numeric(12,2) not null default 0 check (condo_amount >= 0),
  condo_payment_date date,
  condo_paid_by_tenant boolean not null default false,
  extra_fee_amount numeric(12,2) check (extra_fee_amount is null or extra_fee_amount >= 0),
  extra_fee_paid_by_tenant boolean not null default false,
  unexpected_costs_amount numeric(12,2) check (unexpected_costs_amount is null or unexpected_costs_amount >= 0),
  unexpected_costs_notes text,
  maintenance_amount numeric(12,2) check (maintenance_amount is null or maintenance_amount >= 0),
  maintenance_paid_by_tenant boolean not null default false,
  iptu_amount numeric(12,2) check (iptu_amount is null or iptu_amount >= 0),
  iptu_paid_by_tenant boolean not null default false,
  garbage_fee_amount numeric(12,2) check (garbage_fee_amount is null or garbage_fee_amount >= 0),
  laudemio_amount numeric(12,2) check (laudemio_amount is null or laudemio_amount >= 0),
  contract_url text,
  receiving_bank text,
  has_rent_deposit boolean not null default false,
  source_label text,
  source_reference_month text,
  source_is_outdated boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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

-- MVP solo: anon lê apenas seeds/demo desatualizados marcados com source_is_outdated.
-- Escritas reais devem esperar autenticação/owner_id antes de abrir policies de insert/update/delete.
-- Exemplo futuro: criar policies por usuário/proprietário usando auth.uid().
