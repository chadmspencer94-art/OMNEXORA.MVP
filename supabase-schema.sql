-- SyncTodo — Supabase schema
-- Run this in the Supabase SQL Editor to set up your database.

create extension if not exists "uuid-ossp";

create table todo_lists (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  share_token uuid unique,
  share_mode text not null default 'none' check (share_mode in ('none', 'readonly', 'collaborative')),
  created_at timestamptz not null default now()
);

create table todos (
  id uuid primary key default uuid_generate_v4(),
  text text not null,
  completed boolean not null default false,
  list_id uuid not null references todo_lists(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  position int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_todos_list_id on todos(list_id);
create index idx_todo_lists_owner on todo_lists(owner_id);
create index idx_todo_lists_share_token on todo_lists(share_token);

alter table todo_lists enable row level security;
alter table todos enable row level security;

create policy "Users can read own lists" on todo_lists
  for select using (auth.uid() = owner_id);

create policy "Users can insert own lists" on todo_lists
  for insert with check (auth.uid() = owner_id);

create policy "Users can update own lists" on todo_lists
  for update using (auth.uid() = owner_id);

create policy "Users can delete own lists" on todo_lists
  for delete using (auth.uid() = owner_id);

create policy "Anyone can read shared lists" on todo_lists
  for select using (share_token is not null);

create policy "Users can read todos in own lists" on todos
  for select using (
    exists (select 1 from todo_lists where id = todos.list_id and owner_id = auth.uid())
  );

create policy "Users can read todos in shared lists" on todos
  for select using (
    exists (select 1 from todo_lists where id = todos.list_id and share_token is not null)
  );

create policy "Users can insert todos in own lists" on todos
  for insert with check (
    exists (select 1 from todo_lists where id = todos.list_id and owner_id = auth.uid())
  );

create policy "Users can insert todos in collaborative lists" on todos
  for insert with check (
    exists (select 1 from todo_lists where id = todos.list_id and share_mode = 'collaborative')
  );

create policy "Users can update todos in own lists" on todos
  for update using (
    exists (select 1 from todo_lists where id = todos.list_id and owner_id = auth.uid())
  );

create policy "Users can update todos in collaborative lists" on todos
  for update using (
    exists (select 1 from todo_lists where id = todos.list_id and share_mode = 'collaborative')
  );

create policy "Users can delete todos in own lists" on todos
  for delete using (
    exists (select 1 from todo_lists where id = todos.list_id and owner_id = auth.uid())
  );

alter publication supabase_realtime add table todos;
alter publication supabase_realtime add table todo_lists;
