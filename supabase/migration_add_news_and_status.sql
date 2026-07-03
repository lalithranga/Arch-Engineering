-- ============================================================================
-- MIGRATION: Add project status, detail-page fields, + News & Media module
-- ============================================================================
-- Use this if you already ran schema.sql (and possibly already ran
-- migration_add_project_images.sql) and just want to ADD:
--   1. A `status` column on the existing `projects` table
--   2. `client`, `completion_date`, `project_manager` columns (for the
--      project detail page) on `projects`
--   3. A new `news_posts` table + its RLS policies
-- Your existing projects/contact_messages/project_images rows are
-- untouched. Existing projects will default to status = 'completed' —
-- edit each one in the Admin Dashboard afterward to mark any that are
-- still "Ongoing", and to fill in the new detail fields.
--
-- Run in: Supabase Dashboard > SQL Editor > New Query > paste this > Run
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Add new columns to projects (safe to re-run — skips existing columns)
-- ----------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'projects' and column_name = 'status'
  ) then
    alter table public.projects add column status text not null default 'completed';
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'projects' and column_name = 'client'
  ) then
    alter table public.projects add column client text;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'projects' and column_name = 'completion_date'
  ) then
    alter table public.projects add column completion_date text;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'projects' and column_name = 'project_manager'
  ) then
    alter table public.projects add column project_manager text;
  end if;
end $$;

-- ----------------------------------------------------------------------------
-- 2. News & Media table
-- ----------------------------------------------------------------------------
create table if not exists public.news_posts (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  summary      text not null,
  body         text not null,
  image_path   text,                -- optional — a news post can be text-only
  published_at timestamptz not null default now(),
  created_at   timestamptz not null default now()
);

alter table public.news_posts enable row level security;

create policy "Public can view news posts"
  on public.news_posts
  for select
  using (true);

create policy "Admins can insert news posts"
  on public.news_posts
  for insert
  to authenticated
  with check (true);

create policy "Admins can update news posts"
  on public.news_posts
  for update
  to authenticated
  using (true)
  with check (true);

create policy "Admins can delete news posts"
  on public.news_posts
  for delete
  to authenticated
  using (true);
