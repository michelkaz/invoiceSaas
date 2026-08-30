-- Facturi — logo d'entreprise + photo de profil : colonne + bucket de stockage

alter table public.companies
  add column if not exists logo_url text;

-- Bucket public (lecture ouverte : les logos apparaissent sur les factures
-- envoyées aux clients et dans le PDF). Écriture réservée au propriétaire.
insert into storage.buckets (id, name, public)
values ('assets', 'assets', true)
on conflict (id) do update set public = true;

-- Chemin attendu : assets/<auth.uid()>/<fichier>
drop policy if exists "assets_read" on storage.objects;
create policy "assets_read" on storage.objects
  for select using (bucket_id = 'assets');

drop policy if exists "assets_insert_own" on storage.objects;
create policy "assets_insert_own" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'assets'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "assets_update_own" on storage.objects;
create policy "assets_update_own" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'assets'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "assets_delete_own" on storage.objects;
create policy "assets_delete_own" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'assets'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
