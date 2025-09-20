-- Create storage buckets
insert into storage.buckets (id, name, public)
values
  ('avatars', 'avatars', true),
  ('posts', 'posts', true);

-- Storage policies for avatars bucket
create policy "Avatar images are publicly accessible"
on storage.objects for select using (bucket_id = 'avatars');

create policy "Users can upload their own avatar"
on storage.objects for insert with check (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can update their own avatar"
on storage.objects for update using (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can delete their own avatar"
on storage.objects for delete using (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage policies for posts bucket
create policy "Post images are publicly accessible"
on storage.objects for select using (bucket_id = 'posts');

create policy "Users can upload post images"
on storage.objects for insert with check (
  bucket_id = 'posts' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can delete their own post images"
on storage.objects for delete using (
  bucket_id = 'posts' AND
  auth.uid()::text = (storage.foldername(name))[1]
);