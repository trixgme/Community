-- Create posts table
create table posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  content text not null,
  image_url text,
  likes_count integer default 0,
  comments_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table posts enable row level security;

-- RLS Policies for posts
create policy "Posts are viewable by everyone"
on posts for select using (true);

create policy "Users can create posts"
on posts for insert with check (auth.uid() = user_id);

create policy "Users can update own posts"
on posts for update using (auth.uid() = user_id);

create policy "Users can delete own posts"
on posts for delete using (auth.uid() = user_id);

-- Create indexes for performance
create index posts_user_id_idx on posts(user_id);
create index posts_created_at_idx on posts(created_at desc);
create index posts_likes_count_idx on posts(likes_count desc);