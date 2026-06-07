-- Create profiles table
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  is_admin boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create organizations table
create table organizations (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  type text not null check (type in ('School', 'Nonprofit', 'Business')),
  description text,
  school_district text,
  created_by uuid references auth.users not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create organization_members table
create table organization_members (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid references organizations on delete cascade not null,
  email text not null,
  user_id uuid references auth.users,
  status text default 'invited' check (status in ('invited', 'active')),
  role text default 'member' check (role in ('admin', 'member')),
  invited_at timestamp with time zone default timezone('utc'::text, now()),
  joined_at timestamp with time zone,
  unique(organization_id, email)
);

-- Enable RLS on all tables
alter table profiles enable row level security;
alter table organizations enable row level security;
alter table organization_members enable row level security;

-- Profiles policies
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Organizations policies
create policy "Admins can create organizations"
  on organizations for insert
  with check (auth.uid() = created_by);

create policy "Admins can view own organizations"
  on organizations for select
  using (auth.uid() = created_by);

create policy "Admins can update own organizations"
  on organizations for update
  using (auth.uid() = created_by);

-- Organization members policies
create policy "Admins can view members of own orgs"
  on organization_members for select
  using (
    exists (
      select 1 from organizations
      where id = organization_members.organization_id
      and created_by = auth.uid()
    )
  );

create policy "Admins can insert members to own orgs"
  on organization_members for insert
  with check (
    exists (
      select 1 from organizations
      where id = organization_members.organization_id
      and created_by = auth.uid()
    )
  );

-- Auto create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, is_admin)
  values (new.id, new.raw_user_meta_data->>'full_name', true);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();