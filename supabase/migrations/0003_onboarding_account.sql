-- Facturi — onboarding / tutoriel + suppression de compte

-- Suivi de l'onboarding et du tutoriel, porté par la ligne `companies`
-- (1 par utilisateur). Colonnes additives : le schéma existant n'est pas refait.
alter table public.companies
  add column if not exists onboarding_completed boolean not null default false,
  add column if not exists tutorial_seen boolean not null default false;

-- Suppression de son propre compte : security definer scellé sur auth.uid().
-- Les FK `owner_id ... on delete cascade` propagent la suppression à
-- companies / clients / invoices / invoice_items.
create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_own_account() from public, anon;
grant execute on function public.delete_own_account() to authenticated;
