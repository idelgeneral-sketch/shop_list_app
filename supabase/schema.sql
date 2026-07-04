-- Family Shopping List — Supabase schema
-- Run this whole file once in the Supabase SQL editor (Project → SQL Editor → New query).

create extension if not exists "uuid-ossp";

-- ---------- Tables ----------

create table if not exists stores (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  order_index int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists items (
  id uuid primary key default uuid_generate_v4(),
  store_id uuid not null references stores(id) on delete cascade,
  name text not null,
  quantity text not null default '1',
  is_purchased boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  purchased_at timestamptz
);

create table if not exists product_suggestions (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  usage_count int not null default 1,
  last_used_at timestamptz not null default now()
);

create index if not exists items_store_id_idx on items(store_id);
create index if not exists product_suggestions_name_idx on product_suggestions using gin (name gin_trgm_ops);

create extension if not exists pg_trgm;

-- ---------- updated_at trigger ----------

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists items_set_updated_at on items;
create trigger items_set_updated_at
  before update on items
  for each row execute function set_updated_at();

-- ---------- Row Level Security ----------
-- This app has no login/auth (per spec: "No authentication, no users, no permissions").
-- Everyone who has the Supabase anon key (i.e. anyone who has your deployed app URL)
-- can read and write. That's fine for a private family app, but do not put anything
-- sensitive in this database, and don't publish the anon key outside the app itself.

alter table stores enable row level security;
alter table items enable row level security;
alter table product_suggestions enable row level security;

drop policy if exists "public full access" on stores;
create policy "public full access" on stores
  for all using (true) with check (true);

drop policy if exists "public full access" on items;
create policy "public full access" on items
  for all using (true) with check (true);

drop policy if exists "public full access" on product_suggestions;
create policy "public full access" on product_suggestions
  for all using (true) with check (true);

-- ---------- Realtime ----------
-- Enable realtime replication for live sync across family members' devices.

alter publication supabase_realtime add table stores;
alter publication supabase_realtime add table items;
