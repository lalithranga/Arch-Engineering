-- ============================================================================
-- MIGRATION: Add multi-image gallery support to an EXISTING database
-- ============================================================================
-- Use this instead of schema.sql if you already ran schema.sql once and
-- just want to ADD the new project_images table without touching anything
-- else (your existing projects/contact_messages rows are untouched).
--
-- Run in: Supabase Dashboard > SQL Editor > New Query > paste this > Run
-- ============================================================================

create table if not exists public.project_images (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects(id) on delete cascade,
  image_path  text not null,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists project_images_project_id_idx on public.project_images(project_id);

alter table public.project_images enable row level security;

create policy "Public can view project images"
  on public.project_images
  for select
  using (true);

create policy "Admins can insert project images"
  on public.project_images
  for insert
  to authenticated
  with check (true);

create policy "Admins can update project images"
  on public.project_images
  for update
  to authenticated
  using (true)
  with check (true);

create policy "Admins can delete project images"
  on public.project_images
  for delete
  to authenticated
  using (true);
