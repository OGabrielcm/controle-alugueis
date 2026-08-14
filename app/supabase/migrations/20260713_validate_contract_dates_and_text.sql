-- Impede novos contratos com datas invertidas e limita textos exibidos pela UI.
-- NOT VALID preserva registros legados até que sejam revisados; novas escritas já são verificadas.

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'properties_contract_dates_ordered'
      and conrelid = 'public.properties'::regclass
  ) then
    alter table public.properties
      add constraint properties_contract_dates_ordered
      check (
        contract_start_date is null
        or contract_end_date is null
        or contract_end_date >= contract_start_date
      ) not valid;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'properties_text_lengths_valid'
      and conrelid = 'public.properties'::regclass
  ) then
    alter table public.properties
      add constraint properties_text_lengths_valid
      check (
        char_length(btrim(building_name)) between 1 and 120
        and (property_address is null or char_length(btrim(property_address)) <= 240)
        and (tenant_name is null or char_length(btrim(tenant_name)) <= 120)
        and (tenant_contact is null or char_length(btrim(tenant_contact)) <= 120)
        and (receiving_bank is null or char_length(btrim(receiving_bank)) <= 120)
        and (rent_adjustment_index is null or char_length(btrim(rent_adjustment_index)) <= 120)
        and (contract_notes is null or char_length(btrim(contract_notes)) <= 2000)
      ) not valid;
  end if;
end
$$;

-- Depois de corrigir os registros legados, validar manualmente:
-- alter table public.properties validate constraint properties_contract_dates_ordered;
-- alter table public.properties validate constraint properties_text_lengths_valid;
