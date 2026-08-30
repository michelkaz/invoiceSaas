-- Facturi — localisation RDC : devise CDF + identifiants légaux congolais

-- Devise : autoriser CDF (franc congolais) et en faire la valeur par défaut.
alter table public.companies drop constraint if exists companies_currency_check;
alter table public.companies
  add constraint companies_currency_check
  check (currency in ('XOF', 'XAF', 'CDF'));
alter table public.companies alter column currency set default 'CDF';

alter table public.invoices drop constraint if exists invoices_currency_check;
alter table public.invoices
  add constraint invoices_currency_check
  check (currency in ('XOF', 'XAF', 'CDF'));
alter table public.invoices alter column currency set default 'CDF';

-- Identifiants légaux : NINEA (UEMOA) -> RCCM + NIF + ID NAT (RDC).
alter table public.companies rename column tax_id to rccm;
alter table public.companies
  add column if not exists nif text not null default '',
  add column if not exists id_nat text not null default '';

-- Taux de TVA par défaut : 16 % (standard RDC) au lieu de 18 % (UEMOA).
alter table public.companies alter column default_tva_rate set default 16;
