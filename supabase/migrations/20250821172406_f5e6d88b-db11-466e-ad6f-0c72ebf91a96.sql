
-- Garantir que o bucket 'avatars' existe (não causa erro se já existe)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Leitura pública para o bucket de avatares
create policy if not exists "avatars_public_read"
on storage.objects
for select
using (bucket_id = 'avatars');

-- Upload (INSERT) apenas na pasta do próprio usuário ou admin
create policy if not exists "avatars_insert_own_or_admin"
on storage.objects
for insert
with check (
  bucket_id = 'avatars'
  and (
    name like (auth.uid()::text || '/%')
    or has_role(auth.uid(), 'admin')
  )
);

-- Atualizar (UPDATE) apenas arquivos da sua pasta ou admin
create policy if not exists "avatars_update_own_or_admin"
on storage.objects
for update
using (
  bucket_id = 'avatars'
  and (
    name like (auth.uid()::text || '/%')
    or has_role(auth.uid(), 'admin')
  )
)
with check (
  bucket_id = 'avatars'
  and (
    name like (auth.uid()::text || '/%')
    or has_role(auth.uid(), 'admin')
  )
);

-- Excluir (DELETE) apenas arquivos da sua pasta ou admin
create policy if not exists "avatars_delete_own_or_admin"
on storage.objects
for delete
using (
  bucket_id = 'avatars'
  and (
    name like (auth.uid()::text || '/%')
    or has_role(auth.uid(), 'admin')
  )
);
