-- Facturi — Row Level Security
-- Chaque utilisateur ne voit et ne modifie que ses propres données.

-- Privilèges de base (la RLS restreint ensuite ligne par ligne)
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on
  public.companies, public.clients, public.invoices, public.invoice_items
  to authenticated;
grant execute on function public.create_invoice(jsonb, jsonb) to authenticated;
grant execute on function public.update_invoice(jsonb, jsonb) to authenticated;

-- Activation RLS
alter table public.companies      enable row level security;
alter table public.clients        enable row level security;
alter table public.invoices       enable row level security;
alter table public.invoice_items  enable row level security;

-- companies : propriété directe
drop policy if exists "companies_owner_all" on public.companies;
create policy "companies_owner_all" on public.companies
  for all to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- clients : propriété directe
drop policy if exists "clients_owner_all" on public.clients;
create policy "clients_owner_all" on public.clients
  for all to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- invoices : propriété directe
drop policy if exists "invoices_owner_all" on public.invoices;
create policy "invoices_owner_all" on public.invoices
  for all to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- invoice_items : propriété via la facture parente
drop policy if exists "invoice_items_owner_all" on public.invoice_items;
create policy "invoice_items_owner_all" on public.invoice_items
  for all to authenticated
  using (
    exists (
      select 1 from public.invoices i
      where i.id = invoice_id and i.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.invoices i
      where i.id = invoice_id and i.owner_id = auth.uid()
    )
  );
