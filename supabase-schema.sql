create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  role text not null check (role in ('admin', 'president', 'silver', 'gold', 'platinum', 'visitor')),
  business_name text,
  member_tier text check (member_tier in ('silver', 'gold', 'platinum')),
  paid_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists login_audit (
  id bigserial primary key,
  profile_id uuid references profiles(id) on delete set null,
  email text not null,
  role text not null,
  logged_in_at timestamptz default now()
);

create table if not exists president_statements (
  id bigserial primary key,
  statement text not null,
  updated_by uuid references profiles(id) on delete set null,
  updated_at timestamptz default now()
);

create table if not exists activities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  activity_date date not null,
  category text not null,
  summary text not null,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists promotions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles(id) on delete cascade,
  owner_email text not null,
  tier text not null check (tier in ('silver', 'gold', 'platinum')),
  business_name text not null,
  offer_title text not null,
  website text not null,
  description text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  update_log timestamptz[] default array[]::timestamptz[],
  approved_by uuid references profiles(id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table profiles enable row level security;
alter table login_audit enable row level security;
alter table president_statements enable row level security;
alter table activities enable row level security;
alter table promotions enable row level security;

create policy "Public approved promotions" on promotions
  for select using (status = 'approved' or auth.uid() = owner_id);

create policy "Members manage own promotions" on promotions
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "Public read activities" on activities
  for select using (true);
