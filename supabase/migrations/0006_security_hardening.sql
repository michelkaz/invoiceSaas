-- Facturi — durcissement sécurité (suite à l'audit du linter Supabase)
-- Aucun changement de comportement pour l'application : uniquement des
-- restrictions défensives sur des fonctions déjà internes.

-- set_updated_at() n'avait pas de search_path fixé (search_path mutable :
-- un rôle malveillant pourrait en théorie faire pointer "public" ailleurs
-- dans sa session). Sans risque pratique ici (aucune référence non
-- qualifiée dans le corps de la fonction), mais corrigé par principe.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- handle_new_user() est un trigger sur auth.users (SECURITY DEFINER requis
-- pour écrire dans public.companies depuis ce contexte). Par défaut
-- Postgres/PostgREST exposent aussi toute fonction publique en RPC
-- (/rest/v1/rpc/handle_new_user) : elle échouerait de toute façon hors
-- contexte trigger (pas de `new` disponible), mais on retire l'exécution
-- directe par défense en profondeur — seul le trigger continue de l'appeler.
revoke all on function public.handle_new_user() from public, anon, authenticated;
