create extension if not exists pgcrypto;

create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  manufacturer text,
  model_year integer,
  type text not null check (type in ('motorcycle','car')),
  base_power numeric not null default 0,
  base_weight numeric not null default 0,
  base_grip numeric not null default 0,
  base_braking numeric not null default 0,
  base_handling numeric not null default 0,
  model_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.parts (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  slot text not null,
  name text not null,
  category text not null,
  price integer not null default 0,
  weight_delta numeric not null default 0,
  power_delta numeric not null default 0,
  grip_delta numeric not null default 0,
  braking_delta numeric not null default 0,
  handling_delta numeric not null default 0,
  model_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.builds (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  name text not null default 'Untitled Build',
  state jsonb not null default '{}'::jsonb,
  stats jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.repairs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  completed boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.test_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  build_id uuid references public.builds(id) on delete set null,
  telemetry jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.vehicles enable row level security;
alter table public.parts enable row level security;
alter table public.builds enable row level security;
alter table public.repairs enable row level security;
alter table public.test_runs enable row level security;

create policy "vehicles are public" on public.vehicles for select using (true);
create policy "parts are public" on public.parts for select using (true);
create policy "users manage own builds" on public.builds for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users manage own repairs" on public.repairs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users manage own test runs" on public.test_runs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

insert into public.vehicles (name, manufacturer, model_year, type, base_power, base_weight, base_grip, base_braking, base_handling)
select 'Ninja 650', 'Kawasaki', 2021, 'motorcycle', 68, 196, 82, 80, 78
where not exists (select 1 from public.vehicles where name = 'Ninja 650' and model_year = 2021);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists builds_updated_at on public.builds;
create trigger builds_updated_at before update on public.builds for each row execute function public.set_updated_at();

drop trigger if exists repairs_updated_at on public.repairs;
create trigger repairs_updated_at before update on public.repairs for each row execute function public.set_updated_at();
