-- Supabase Storage para PDFs de contratos
-- Execute depois de criar/configurar o projeto Supabase real.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'property-contracts',
  'property-contracts',
  true,
  10485760,
  array['application/pdf']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- MVP solo: o app ainda não tem autenticação nem owner_id.
-- Antes de usar em produção, substitua policies abertas por regras por usuário/proprietário.
-- Exemplo futuro desejado:
-- - usuário autenticado só faz upload em uma pasta própria;
-- - tabela properties guarda contract_url/contract_storage_path;
-- - URLs privadas devem usar signed URLs em vez de bucket público.
