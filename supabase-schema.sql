create extension if not exists pgcrypto;

create or replace function public.current_profile_role()
returns text
language sql
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select public.current_profile_role() = 'admin'
$$;

create or replace function public.is_editor()
returns boolean
language sql
security definer
set search_path = public
as $$
  select public.current_profile_role() in ('admin', 'president')
$$;

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  role text not null default 'visitor' check (role in ('admin', 'president', 'silver', 'gold', 'platinum', 'visitor')),
  business_name text,
  member_tier text check (member_tier in ('silver', 'gold', 'platinum', 'individual-ordinary', 'individual-affiliate')),
  membership_status text not null default 'registered' check (membership_status in ('registered', 'pending_payment', 'paid', 'expired', 'cancelled')),
  avatar_url text,
  phone text,
  position text,
  industry text,
  workplace_details text,
  notification_preferences jsonb not null default '{"atbc_updates": true, "member_promotions": true}'::jsonb,
  paid_at timestamptz,
  membership_expires_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  event_date timestamptz not null,
  location text,
  summary text not null,
  image_url text,
  external_link text,
  details text,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists notification_queue (
  id bigserial primary key,
  profile_id uuid references profiles(id) on delete cascade,
  email text not null,
  notification_type text not null check (notification_type in ('event', 'activity', 'promotion')),
  subject text not null,
  body text,
  sent_at timestamptz,
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
  image_url text,
  external_link text,
  details text,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists promotions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles(id) on delete cascade,
  owner_email text not null,
  owner_name text,
  tier text not null check (tier in ('Silver', 'Gold', 'Platinum')),
  business_name text not null,
  offer_title text not null,
  website text not null,
  description text not null,
  image_url text,
  details text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  update_log timestamptz[] default array[]::timestamptz[],
  approved_by uuid references profiles(id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists membership_payments (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  provider text not null default 'manual',
  provider_reference text,
  amount numeric(12,2) not null,
  currency text not null default 'THB',
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'refunded')),
  billing_name text,
  billing_address text,
  tax_id text,
  created_at timestamptz default now(),
  paid_at timestamptz
);

alter table profiles enable row level security;
alter table login_audit enable row level security;
alter table events enable row level security;
alter table notification_queue enable row level security;
alter table president_statements enable row level security;
alter table activities enable row level security;
alter table promotions enable row level security;
alter table membership_payments enable row level security;

drop policy if exists "Users read own profile" on profiles;
drop policy if exists "Users insert own profile" on profiles;
drop policy if exists "Users update own profile" on profiles;
drop policy if exists "Admin read all profiles" on profiles;
drop policy if exists "Editors read notification recipients" on profiles;
create policy "Users read own profile" on profiles for select using (auth.uid() = id);
create policy "Users insert own profile" on profiles for insert with check (auth.uid() = id);
create policy "Users update own profile" on profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "Admin read all profiles" on profiles for select using (public.is_admin());
create policy "Editors read notification recipients" on profiles for select using (public.is_editor());

drop policy if exists "Public approved promotions" on promotions;
drop policy if exists "Members manage own promotions" on promotions;
drop policy if exists "Admin manage all promotions" on promotions;
create policy "Public approved promotions" on promotions for select using (status = 'approved' or auth.uid() = owner_id or public.is_admin());
create policy "Members manage own promotions" on promotions for insert with check (auth.uid() = owner_id and public.current_profile_role() in ('silver', 'gold', 'platinum'));
create policy "Members update own promotions" on promotions for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "Members delete own promotions" on promotions for delete using (auth.uid() = owner_id);
create policy "Admin manage all promotions" on promotions for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Public read activities" on activities;
drop policy if exists "Editors manage activities" on activities;
create policy "Public read activities" on activities for select using (true);
create policy "Editors manage activities" on activities for all using (public.is_editor()) with check (public.is_editor());

drop policy if exists "Public read events" on events;
drop policy if exists "Editors manage events" on events;
create policy "Public read events" on events for select using (true);
create policy "Editors manage events" on events for all using (public.is_editor()) with check (public.is_editor());

drop policy if exists "Public read latest statement" on president_statements;
drop policy if exists "President manage statements" on president_statements;
create policy "Public read latest statement" on president_statements for select using (true);
create policy "President manage statements" on president_statements for all using (public.is_editor()) with check (public.is_editor());

drop policy if exists "Users read own notifications" on notification_queue;
drop policy if exists "Admins manage notifications" on notification_queue;
create policy "Users read own notifications" on notification_queue for select using (auth.uid() = profile_id);
create policy "Admins manage notifications" on notification_queue for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Users read own payments" on membership_payments;
drop policy if exists "Admins manage payments" on membership_payments;
create policy "Users read own payments" on membership_payments for select using (auth.uid() = profile_id);
create policy "Admins manage payments" on membership_payments for all using (public.is_admin()) with check (public.is_admin());

insert into storage.buckets (id, name, public)
values
  ('profile-images', 'profile-images', true),
  ('activity-images', 'activity-images', true),
  ('promotion-images', 'promotion-images', true)
on conflict (id) do nothing;
