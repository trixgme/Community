-- Create likes table
create table likes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  post_id uuid references posts(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, post_id)
);

-- Enable RLS
alter table likes enable row level security;

-- RLS Policies for likes
create policy "Likes are viewable by everyone"
on likes for select using (true);

create policy "Users can like posts"
on likes for insert with check (auth.uid() = user_id);

create policy "Users can unlike posts"
on likes for delete using (auth.uid() = user_id);

-- Create indexes for performance
create index likes_user_id_idx on likes(user_id);
create index likes_post_id_idx on likes(post_id);
create index likes_created_at_idx on likes(created_at desc);