-- CollabTodo Database Schema
-- Run this in your Supabase SQL Editor to set up the database.

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- Profiles table (synced from auth.users via trigger)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  display_name text,
  avatar_url text,
  created_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Todo lists
create table if not exists public.todo_lists (
  id uuid default uuid_generate_v4() primary key,
  name text not null default 'My Todos',
  user_id uuid references auth.users on delete cascade not null,
  share_token text unique default encode(gen_random_bytes(16), 'hex'),
  is_public boolean default false not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.todo_lists enable row level security;

create policy "Users can view own lists"
  on public.todo_lists for select using (auth.uid() = user_id);

create policy "Anyone can view public lists"
  on public.todo_lists for select using (is_public = true);

create policy "Users can create own lists"
  on public.todo_lists for insert with check (auth.uid() = user_id);

create policy "Users can update own lists"
  on public.todo_lists for update using (auth.uid() = user_id);

create policy "Users can delete own lists"
  on public.todo_lists for delete using (auth.uid() = user_id);

-- Todos
create table if not exists public.todos (
  id uuid default uuid_generate_v4() primary key,
  text text not null,
  completed boolean default false not null,
  list_id uuid references public.todo_lists on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  position integer default 0 not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.todos enable row level security;

create policy "Users can view own todos"
  on public.todos for select using (auth.uid() = user_id);

create policy "Anyone can view todos in public lists"
  on public.todos for select using (
    exists (
      select 1 from public.todo_lists
      where id = todos.list_id and is_public = true
    )
  );

create policy "Users can create todos in own lists"
  on public.todos for insert with check (auth.uid() = user_id);

create policy "Users can update own todos"
  on public.todos for update using (auth.uid() = user_id);

create policy "Users can delete own todos"
  on public.todos for delete using (auth.uid() = user_id);

-- Indexes
create index if not exists idx_todos_list_id on public.todos (list_id);
create index if not exists idx_todos_user_id on public.todos (user_id);
create index if not exists idx_todo_lists_user_id on public.todo_lists (user_id);
create index if not exists idx_todo_lists_share_token on public.todo_lists (share_token);

-- Updated_at trigger
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_todos_updated_at
  before update on public.todos
  for each row execute procedure public.update_updated_at();

create trigger update_todo_lists_updated_at
  before update on public.todo_lists
  for each row execute procedure public.update_updated_at();

-- Enable realtime
alter publication supabase_realtime add table public.todos;
alter publication supabase_realtime add table public.todo_lists;
