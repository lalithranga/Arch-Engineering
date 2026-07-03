-- ============================================================================
-- Arch Engineering Pvt Ltd — Supabase Schema + RLS Policies
-- ============================================================================
-- Run this entire file once in: Supabase Dashboard > SQL Editor > New Query
-- It is idempotent-ish (uses IF NOT EXISTS where possible) but written to
-- be run against a fresh project. Review before running on a live DB.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. TABLES
-- ----------------------------------------------------------------------------

create table if not exists public.projects (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  category         text not null,
  location         text not null,
  description      text not null,
  status           text not null default 'completed', -- 'ongoing' | 'completed'
  client           text,              -- shown on the project detail page (optional)
  completion_date  text,              -- free text, e.g. "Dec 2024" or "Expected 2027" (optional)
  project_manager  text,              -- shown on the project detail page (optional)
  image_path       text not null,     -- path INSIDE the private bucket — the "cover" image
                                       -- used for card thumbnails. Full gallery in project_images.
  created_at       timestamptz not null default now()
);

-- One project can have several photos, shown as a rotating carousel on the
-- public card. sort_order controls display sequence (0 = first slide).
-- Deleting a project cascades to its images automatically (ON DELETE CASCADE),
-- so the admin doesn't have to clean up gallery rows by hand.
create table if not exists public.project_images (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects(id) on delete cascade,
  image_path  text not null,        -- path INSIDE the private bucket, e.g. "projects/123-tower-2.jpg"
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists project_images_project_id_idx on public.project_images(project_id);

-- News & Media posts — admin-authored updates shown on the public site.
-- Single cover image per post (no gallery needed for a news item).
create table if not exists public.news_posts (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  summary     text not null,        -- short teaser shown on the public card
  body        text not null,        -- full article text
  image_path  text,                 -- optional — a news post can be text-only
  published_at timestamptz not null default now(),
  created_at  timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  phone      text,
  message    text not null,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 2. ENABLE ROW LEVEL SECURITY
-- ----------------------------------------------------------------------------
-- RLS is OFF by default on new tables, which means anyone with the anon
-- key (i.e. everyone, since it ships in the browser bundle) could read
-- AND write every row. Turning this on makes Postgres deny ALL access
-- by default until a POLICY explicitly grants it back.

alter table public.projects enable row level security;
alter table public.project_images enable row level security;
alter table public.contact_messages enable row level security;
alter table public.news_posts enable row level security;

-- ----------------------------------------------------------------------------
-- 3. POLICIES — projects
-- ----------------------------------------------------------------------------

-- Anyone (including logged-out visitors) can READ project rows.
-- `using (true)` = no row-level restriction on SELECT.
create policy "Public can view projects"
  on public.projects
  for select
  using (true);

-- Only an authenticated user can INSERT a project row.
-- `auth.role() = 'authenticated'` is true for any signed-in Supabase user —
-- since this app provisions admin accounts manually, "authenticated"
-- effectively means "admin" here. If you later add non-admin authenticated
-- users (e.g. client portal logins), tighten this to a role/claim check.
create policy "Admins can insert projects"
  on public.projects
  for insert
  to authenticated
  with check (true);

create policy "Admins can update projects"
  on public.projects
  for update
  to authenticated
  using (true)
  with check (true);

create policy "Admins can delete projects"
  on public.projects
  for delete
  to authenticated
  using (true);

-- ----------------------------------------------------------------------------
-- 3b. POLICIES — project_images
-- ----------------------------------------------------------------------------
-- Same read/write split as `projects`: anyone can view gallery rows (the
-- actual image bytes still require a signed URL, since the bucket stays
-- private), only admins can manage which images belong to a project.

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

-- ----------------------------------------------------------------------------
-- 4. POLICIES — contact_messages
-- ----------------------------------------------------------------------------
-- Visitors can SUBMIT a message but can NEVER read the inbox (not even
-- their own submission) — this prevents one visitor from scraping every
-- other visitor's contact details via the public anon key.

create policy "Anyone can submit a contact message"
  on public.contact_messages
  for insert
  to anon, authenticated
  with check (true);

create policy "Admins can view contact messages"
  on public.contact_messages
  for select
  to authenticated
  using (true);

create policy "Admins can delete contact messages"
  on public.contact_messages
  for delete
  to authenticated
  using (true);

-- ----------------------------------------------------------------------------
-- 4b. POLICIES — news_posts
-- ----------------------------------------------------------------------------
-- Same public-read / admin-write split as projects.

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

-- ----------------------------------------------------------------------------
-- 5. STORAGE — private bucket + policies
-- ----------------------------------------------------------------------------
-- Create the bucket itself via the Dashboard UI instead of SQL:
--   Storage > New Bucket > name: "company-assets" > Public: OFF (leave unchecked)
-- Leaving "Public" OFF is what makes this a private bucket — public
-- buckets serve files from a stable, guessable URL with NO auth check at
-- all, which is exactly what this spec explicitly rules out.
--
-- Once the bucket exists, run the policies below (Storage policies live
-- on the storage.objects table, scoped to this bucket via bucket_id).

create policy "Public can view files in company-assets (via signed URL only)"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'company-assets');
  -- NOTE: this SELECT policy is what createSignedUrl() relies on internally
  -- to verify the object exists and issue a token — it does NOT mean raw
  -- public URLs work. A direct request to the object's path with no
  -- signed token still returns 400, because the bucket's "Public" flag
  -- (set at the bucket level, not via policy) stays OFF.

create policy "Admins can upload to company-assets"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'company-assets');

create policy "Admins can update files in company-assets"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'company-assets');

create policy "Admins can delete files in company-assets"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'company-assets');

-- ----------------------------------------------------------------------------
-- 6. SEED DATA
-- ----------------------------------------------------------------------------
-- Note: no rows are seeded for `projects` or `news_posts` here, since each
-- requires a real image already uploaded to the company-assets bucket
-- (image_path must point to a file that actually exists). Add your first
-- projects and news posts through the Admin Dashboard once it's running.
