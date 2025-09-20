-- Create comments table
create table comments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  post_id uuid references posts(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table comments enable row level security;

-- RLS Policies for comments
create policy "Comments are viewable by everyone"
on comments for select using (true);

create policy "Users can create comments"
on comments for insert with check (auth.uid() = user_id);

create policy "Users can update own comments"
on comments for update using (auth.uid() = user_id);

create policy "Users can delete own comments"
on comments for delete using (auth.uid() = user_id);

-- Create indexes for performance
create index comments_user_id_idx on comments(user_id);
create index comments_post_id_idx on comments(post_id);
create index comments_created_at_idx on comments(created_at desc);