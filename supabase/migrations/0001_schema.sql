-- Facturi — schéma initial (migration Supabase)
-- FCFA : montants stockés en entiers (bigint). Clés primaires : text
-- (identifiants opaques côté application, générés par crypto.randomUUID()).

-- ─────────────────────────────────────────────────────────────────────────────
-- Enum de statut de facture
-- ─────────────────────────────────────────────────────────────────────────────
do $$
begin
  if not exists (select 1 from pg_type where typname = 'invoice_status') then
    create type public.invoice_status as enum
      ('brouillon', 'envoyee', 'payee', 'en_retard');
  end if;
end
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- Entreprise : une ligne par utilisateur
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.companies (
  id                text primary key default gen_random_uuid()::text,
  owner_id          uuid not null unique references auth.users (id) on delete cascade,
  name              text not null default '',
  legal_name        text not null default '',
  address           text not null default '',
  city              text not null default '',
  country           text not null default '',
  phone             text not null default '',
  email             text not null default '',
  tax_id            text not null default '',
  currency          text not null default 'XOF' check (currency in ('XOF', 'XAF')),
  default_tva_rate  numeric not null default 18,
  invoice_prefix    text not null default 'FAC',
  payment_terms_days integer not null default 30,
  bank_details      text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Clients
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.clients (
  id          text primary key default gen_random_uuid()::text,
  owner_id    uuid not null references auth.users (id) on delete cascade,
  name        text not null,
  email       text not null default '',
  phone       text not null default '',
  address     text not null default '',
  created_at  timestamptz not null default now()
);
create index if not exists clients_owner_idx on public.clients (owner_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- Factures — totaux figés à l'écriture (subtotal / tva_amount / total)
-- Suppression d'un client bloquée s'il reste des factures (on delete restrict).
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.invoices (
  id          text primary key default gen_random_uuid()::text,
  owner_id    uuid not null references auth.users (id) on delete cascade,
  number      text not null,
  client_id   text not null references public.clients (id) on delete restrict,
  status      public.invoice_status not null default 'brouillon',
  issue_date  date not null,
  due_date    date not null,
  currency    text not null default 'XOF' check (currency in ('XOF', 'XAF')),
  tva_rate    numeric not null default 18,
  subtotal    bigint not null default 0,
  tva_amount  bigint not null default 0,
  total       bigint not null default 0,
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (owner_id, number)
);
create index if not exists invoices_owner_idx on public.invoices (owner_id);
create index if not exists invoices_client_idx on public.invoices (client_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- Lignes de facture
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.invoice_items (
  id          text primary key default gen_random_uuid()::text,
  invoice_id  text not null references public.invoices (id) on delete cascade,
  description text not null default '',
  quantity    numeric not null default 1,
  unit_price  bigint not null default 0,
  position    integer not null default 0
);
create index if not exists invoice_items_invoice_idx on public.invoice_items (invoice_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- updated_at automatique
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists companies_set_updated_at on public.companies;
create trigger companies_set_updated_at
  before update on public.companies
  for each row execute function public.set_updated_at();

drop trigger if exists invoices_set_updated_at on public.invoices;
create trigger invoices_set_updated_at
  before update on public.invoices
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- À l'inscription : créer l'entreprise (valeurs par défaut) de l'utilisateur
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.companies (owner_id)
  values (new.id)
  on conflict (owner_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────────
-- RPC : écriture atomique d'une facture + ses lignes
-- L'application fournit id, numéro et totaux déjà calculés (figés).
-- security invoker : la RLS s'applique (owner_id = auth.uid()).
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.create_invoice(p_invoice jsonb, p_items jsonb)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  insert into public.invoices (
    id, owner_id, number, client_id, status, issue_date, due_date,
    currency, tva_rate, subtotal, tva_amount, total, notes
  )
  values (
    p_invoice ->> 'id',
    auth.uid(),
    p_invoice ->> 'number',
    p_invoice ->> 'clientId',
    (p_invoice ->> 'status')::public.invoice_status,
    (p_invoice ->> 'issueDate')::date,
    (p_invoice ->> 'dueDate')::date,
    coalesce(p_invoice ->> 'currency', 'XOF'),
    (p_invoice ->> 'tvaRate')::numeric,
    (p_invoice ->> 'subtotal')::bigint,
    (p_invoice ->> 'tvaAmount')::bigint,
    (p_invoice ->> 'total')::bigint,
    nullif(p_invoice ->> 'notes', '')
  );

  insert into public.invoice_items (id, invoice_id, description, quantity, unit_price, position)
  select
    coalesce(it ->> 'id', gen_random_uuid()::text),
    p_invoice ->> 'id',
    coalesce(it ->> 'description', ''),
    coalesce((it ->> 'quantity')::numeric, 0),
    coalesce((it ->> 'unitPrice')::bigint, 0),
    (ord - 1)::int
  from jsonb_array_elements(p_items) with ordinality as t(it, ord);
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- RPC : mise à jour atomique d'une facture + remplacement de ses lignes
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function public.update_invoice(p_invoice jsonb, p_items jsonb)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  update public.invoices set
    client_id  = p_invoice ->> 'clientId',
    status     = (p_invoice ->> 'status')::public.invoice_status,
    issue_date = (p_invoice ->> 'issueDate')::date,
    due_date   = (p_invoice ->> 'dueDate')::date,
    currency   = coalesce(p_invoice ->> 'currency', currency),
    tva_rate   = (p_invoice ->> 'tvaRate')::numeric,
    subtotal   = (p_invoice ->> 'subtotal')::bigint,
    tva_amount = (p_invoice ->> 'tvaAmount')::bigint,
    total      = (p_invoice ->> 'total')::bigint,
    notes      = nullif(p_invoice ->> 'notes', '')
  where id = p_invoice ->> 'id'
    and owner_id = auth.uid();

  if not found then
    raise exception 'Facture introuvable ou accès refusé';
  end if;

  delete from public.invoice_items where invoice_id = p_invoice ->> 'id';

  insert into public.invoice_items (id, invoice_id, description, quantity, unit_price, position)
  select
    coalesce(it ->> 'id', gen_random_uuid()::text),
    p_invoice ->> 'id',
    coalesce(it ->> 'description', ''),
    coalesce((it ->> 'quantity')::numeric, 0),
    coalesce((it ->> 'unitPrice')::bigint, 0),
    (ord - 1)::int
  from jsonb_array_elements(p_items) with ordinality as t(it, ord);
end;
$$;
