-- Supabase Storage para documentos de contratos (PDF/DOCX)
-- Execute depois de criar/configurar o projeto Supabase real.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'property-contracts',
  'property-contracts',
  true,
  10485760,
  array[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- MVP privado/familiar: usuário autenticado só gerencia contratos de imóveis que ele possui.
drop policy if exists "property contracts are readable by owners" on storage.objects;
drop policy if exists "property contract owners can upload" on storage.objects;
drop policy if exists "property contract owners can update" on storage.objects;
drop policy if exists "property contract owners can delete" on storage.objects;

create policy "property contracts are readable by owners"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'property-contracts'
  and exists (
    select 1
    from public.properties
    where properties.id::text = (storage.foldername(storage.objects.name))[1]
      and properties.owner_id = auth.uid()
  )
);

create policy "property contract owners can upload"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'property-contracts'
  and exists (
    select 1
    from public.properties
    where properties.id::text = (storage.foldername(storage.objects.name))[1]
      and properties.owner_id = auth.uid()
  )
);

create policy "property contract owners can update"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'property-contracts'
  and exists (
    select 1
    from public.properties
    where properties.id::text = (storage.foldername(storage.objects.name))[1]
      and properties.owner_id = auth.uid()
  )
)
with check (
  bucket_id = 'property-contracts'
  and exists (
    select 1
    from public.properties
    where properties.id::text = (storage.foldername(storage.objects.name))[1]
      and properties.owner_id = auth.uid()
  )
);

create policy "property contract owners can delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'property-contracts'
  and exists (
    select 1
    from public.properties
    where properties.id::text = (storage.foldername(storage.objects.name))[1]
      and properties.owner_id = auth.uid()
  )
);
