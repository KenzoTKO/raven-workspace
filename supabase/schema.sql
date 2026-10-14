-- Run this in Supabase SQL Editor.
-- Workspace tables are only accessible to authenticated users.
create extension if not exists pgcrypto;

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null default '',
  category text not null default 'General',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  mode text not null default 'Network-wide',
  status text not null default 'To do' check (status in ('To do', 'Done')),
  priority text not null default 'Normal' check (priority in ('Low', 'Normal', 'High', 'Urgent')),
  created_at timestamptz not null default now()
);

alter table public.documents enable row level security;
alter table public.tasks enable row level security;

-- Authenticated members can collaborate on shared workspace data.
drop policy if exists "Authenticated members can read documents" on public.documents;
create policy "Authenticated members can read documents" on public.documents for select to authenticated using (true);
drop policy if exists "Authenticated members can create documents" on public.documents;
create policy "Authenticated members can create documents" on public.documents for insert to authenticated with check (true);
drop policy if exists "Authenticated members can update documents" on public.documents;
create policy "Authenticated members can update documents" on public.documents for update to authenticated using (true) with check (true);
drop policy if exists "Authenticated members can delete documents" on public.documents;
create policy "Authenticated members can delete documents" on public.documents for delete to authenticated using (true);

drop policy if exists "Authenticated members can read tasks" on public.tasks;
create policy "Authenticated members can read tasks" on public.tasks for select to authenticated using (true);
drop policy if exists "Authenticated members can create tasks" on public.tasks;
create policy "Authenticated members can create tasks" on public.tasks for insert to authenticated with check (true);
drop policy if exists "Authenticated members can update tasks" on public.tasks;
create policy "Authenticated members can update tasks" on public.tasks for update to authenticated using (true) with check (true);
drop policy if exists "Authenticated members can delete tasks" on public.tasks;
create policy "Authenticated members can delete tasks" on public.tasks for delete to authenticated using (true);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
drop trigger if exists documents_set_updated_at on public.documents;
create trigger documents_set_updated_at before update on public.documents for each row execute function public.set_updated_at();
