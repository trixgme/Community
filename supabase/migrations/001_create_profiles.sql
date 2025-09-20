-- Create profiles table
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  full_name text,
  avatar_url text,
  bio text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table profiles enable row level security;

-- RLS Policies for profiles
create policy "Public profiles are viewable by everyone"
on profiles for select using (true);

create policy "Users can update own profile"
on profiles for update using (auth.uid() = id);

create policy "Users can insert their own profile"
on profiles for insert with check (auth.uid() = id);

-- Create indexes for performance
create index profiles_username_idx on profiles(username);
create index profiles_created_at_idx on profiles(created_at);