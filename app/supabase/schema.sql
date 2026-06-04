-- Supabase schema inicial para Controle de Aluguéis
create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  building_name text not null,
  is_rented boolean not null default false,
  tenant_name text,
  contract_end_date date,
  payment_due_date date,
  is_current boolean not null default false,
  rent_amount numeric(12,2) not null default 0 check (rent_amount >= 0),
  condo_amount numeric(12,2) not null default 0 check (condo_amount >= 0),
  condo_payment_date date,
  condo_paid_by_tenant boolean not null default false,
  extra_fee_amount numeric(12,2) check (extra_fee_amount is null or extra_fee_amount >= 0),
  extra_fee_paid_by_tenant boolean not null default false,
  unexpected_costs_notes text,
  maintenance_amount numeric(12,2) check (maintenance_amount is null or maintenance_amount >= 0),
  maintenance_paid_by_tenant boolean not null default false,
  iptu_amount numeric(12,2) check (iptu_amount is null or iptu_amount >= 0),
  iptu_paid_by_tenant boolean not null default false,
  laudemio_amount numeric(12,2) check (laudemio_amount is null or laudemio_amount >= 0),
  contract_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.properties enable row level security;

-- MVP solo: mantenha políticas fechadas até autenticação ser definida.
-- Exemplo futuro: criar policies por usuário/proprietário.
