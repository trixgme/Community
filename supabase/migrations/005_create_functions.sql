-- Function to handle likes count updates
create or replace function handle_likes_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update posts set likes_count = likes_count + 1 where id = NEW.post_id;
    return NEW;
  elsif TG_OP = 'DELETE' then
    update posts set likes_count = likes_count - 1 where id = OLD.post_id;
    return OLD;
  end if;
  return null;
end;
$$ language plpgsql;

-- Trigger for likes count
create trigger likes_count_trigger
after insert or delete on likes
for each row execute procedure handle_likes_count();

-- Function to handle comments count updates
create or replace function handle_comments_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update posts set comments_count = comments_count + 1 where id = NEW.post_id;
    return NEW;
  elsif TG_OP = 'DELETE' then
    update posts set comments_count = comments_count - 1 where id = OLD.post_id;
    return OLD;
  end if;
  return null;
end;
$$ language plpgsql;

-- Trigger for comments count
create trigger comments_count_trigger
after insert or delete on comments
for each row execute procedure handle_comments_count();

-- Function to handle updated_at timestamp
create or replace function handle_updated_at()
returns trigger as $$
begin
  NEW.updated_at = timezone('utc'::text, now());
  return NEW;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger profiles_updated_at_trigger
before update on profiles
for each row execute procedure handle_updated_at();

create trigger posts_updated_at_trigger
before update on posts
for each row execute procedure handle_updated_at();

create trigger comments_updated_at_trigger
before update on comments
for each row execute procedure handle_updated_at();