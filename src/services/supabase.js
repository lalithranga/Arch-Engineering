import { createClient } from '@supabase/supabase-js';

// ============================================================================
// SUPABASE CLIENT
// ============================================================================
// Single shared client instance. Every service/hook/component imports THIS
// file rather than calling createClient() again — one client per app.
//
// VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY come from `.env` (see .env.example).
// The anon key is safe to expose in client bundles: it has almost no power
// on its own — Row Level Security (RLS) policies on each table/bucket decide
// what an anon-authenticated request is actually allowed to do.
// ============================================================================
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Fail loudly in dev rather than silently shipping a broken client.
  // PLACEHOLDER: replace with your real Supabase project values in .env
  console.error(
    '[supabase.js] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. ' +
      'Copy .env.example to .env and fill in your Supabase project credentials.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================================================
// CONSTANTS
// ============================================================================
// Centralizing table/bucket names here means a rename only happens in ONE
// place instead of being a string scattered across a dozen files.
const TABLES = {
  PROJECTS: 'projects',
  PROJECT_IMAGES: 'project_images',
  MESSAGES: 'contact_messages',
  NEWS: 'news_posts',
};

// Admin upload cap per project — keeps the carousel readable and keeps a
// single "add project" submission from firing off a huge parallel upload batch.
const MAX_GALLERY_IMAGES = 5;

const PRIVATE_BUCKET = 'company-assets';

// How long a signed image URL stays valid before it expires (seconds).
// 3600 = 1 hour. Long enough for a normal page visit + some tab-hoarding,
// short enough that a leaked URL doesn't stay useful for long.
const SIGNED_URL_EXPIRY_SECONDS = 60 * 60;

// ============================================================================
// AUTH — used by context/AuthContext.jsx
// ============================================================================

/**
 * Sign in an admin user with email + password.
 * PLACEHOLDER: Admin accounts are created manually (or via Supabase Admin API)
 * in the Supabase Dashboard > Authentication > Users — there is intentionally
 * NO public sign-up form anywhere in this app.
 */
export async function signInAdmin(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOutAdmin() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/** Returns the current session (or null) — used to hydrate auth state on load. */
export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

// ============================================================================
// PROJECTS — public read, admin-only write (enforced by RLS, see README)
// ============================================================================

/**
 * Fetch all published projects, newest first.
 * Returns rows containing an `image_path` (the path INSIDE the private
 * bucket, e.g. "projects/riverside-tower.jpg") — NOT a usable URL yet.
 * Callers must run each row through getSignedImageUrl() before rendering.
 */
export async function fetchProjects() {
  const { data, error } = await supabase
    .from(TABLES.PROJECTS)
    .select(
      'id, title, category, location, description, status, is_featured, client, completion_date, project_manager, image_path, created_at'
    )
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

/** Fetch a single project by id — used by the project detail page. */
export async function fetchProjectById(id) {
  const { data, error } = await supabase
    .from(TABLES.PROJECTS)
    .select(
      'id, title, category, location, description, status, is_featured, client, completion_date, project_manager, image_path, created_at'
    )
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

/** Admin-only: insert a new project row. Blocked by RLS for anon users. */
export async function createProject(project) {
  const { data, error } = await supabase
    .from(TABLES.PROJECTS)
    .insert([project])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Admin-only: update an existing project row. Blocked by RLS for anon users. */
export async function updateProject(id, updates) {
  const { data, error } = await supabase
    .from(TABLES.PROJECTS)
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Admin-only: delete a project row. Blocked by RLS for anon users. */
export async function deleteProject(id) {
  const { error } = await supabase.from(TABLES.PROJECTS).delete().eq('id', id);
  if (error) throw error;
}

// ============================================================================
// PROJECT IMAGES — the gallery/carousel behind each project card
// ============================================================================
// One project -> many rows here, each pointing at one file in the private
// bucket. `sort_order` decides slide sequence. Deleting the parent project
// cascades to these rows automatically (see schema.sql), but the actual
// STORAGE FILES are not auto-deleted by Postgres — callers must explicitly
// remove them via deleteCompanyAsset() when cleaning up (see deleteProject
// usage pattern in AdminDashboard.jsx).

/** Fetch all gallery rows for one project, in slide order. */
export async function fetchProjectImages(projectId) {
  const { data, error } = await supabase
    .from(TABLES.PROJECT_IMAGES)
    .select('id, project_id, image_path, sort_order')
    .eq('project_id', projectId)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data;
}

/**
 * Batch-fetch gallery rows for MANY projects in one query (used by
 * useProjects so the public grid doesn't run one request per card).
 * Returns a map of project_id -> ordered array of rows.
 */
export async function fetchProjectImagesForMany(projectIds) {
  if (!projectIds.length) return {};

  const { data, error } = await supabase
    .from(TABLES.PROJECT_IMAGES)
    .select('id, project_id, image_path, sort_order')
    .in('project_id', projectIds)
    .order('sort_order', { ascending: true });

  if (error) throw error;

  const grouped = {};
  for (const row of data) {
    if (!grouped[row.project_id]) grouped[row.project_id] = [];
    grouped[row.project_id].push(row);
  }
  return grouped;
}

/** Admin-only: add one gallery image row for a project. */
export async function addProjectImage(projectId, imagePath, sortOrder = 0) {
  const { data, error } = await supabase
    .from(TABLES.PROJECT_IMAGES)
    .insert([{ project_id: projectId, image_path: imagePath, sort_order: sortOrder }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Admin-only: remove one gallery image row (does NOT delete the storage file — call deleteCompanyAsset separately). */
export async function deleteProjectImage(imageRowId) {
  const { error } = await supabase.from(TABLES.PROJECT_IMAGES).delete().eq('id', imageRowId);
  if (error) throw error;
}

// ============================================================================
// CONTACT FORM — public insert only (visitors can submit, nobody can read others')
// ============================================================================

export async function submitContactMessage({ name, email, phone, message }) {
  const { error } = await supabase
    .from(TABLES.MESSAGES)
    .insert([{ name, email, phone, message }]);
  if (error) throw error;
}

// ============================================================================
// NEWS & MEDIA — public read, admin-only write
// ============================================================================

/** Fetch published news posts, newest first. Used by the public News section. */
export async function fetchNewsPosts() {
  const { data, error } = await supabase
    .from(TABLES.NEWS)
    .select('id, title, summary, body, image_path, published_at')
    .order('published_at', { ascending: false });

  if (error) throw error;
  return data;
}

/** Admin-only: insert a new news post. */
export async function createNewsPost(post) {
  const { data, error } = await supabase.from(TABLES.NEWS).insert([post]).select().single();
  if (error) throw error;
  return data;
}

/** Admin-only: update an existing news post. */
export async function updateNewsPost(id, updates) {
  const { data, error } = await supabase
    .from(TABLES.NEWS)
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Admin-only: delete a news post. */
export async function deleteNewsPost(id) {
  const { error } = await supabase.from(TABLES.NEWS).delete().eq('id', id);
  if (error) throw error;
}

// ============================================================================
// PRIVATE STORAGE — the core security mechanism the spec asks for
// ============================================================================

/**
 * Generate a temporary, signed URL for an image stored in the PRIVATE
 * `company-assets` bucket. This is what makes private-bucket images
 * viewable on a public page at all: a raw public URL to a private bucket
 * object returns 400/403, so every <img> on the site must use a URL
 * produced by this function instead of a static path.
 *
 * @param {string} path - path of the file INSIDE the bucket,
 *   e.g. "projects/riverside-tower.jpg" (this is what's stored in
 *   the `image_path` column on the `projects` table — NOT a full URL).
 * @returns {Promise<string|null>} a temporary signed URL, or null on failure.
 */
export async function getSignedImageUrl(path) {
  if (!path) return null;

  const { data, error } = await supabase.storage
    .from(PRIVATE_BUCKET)
    .createSignedUrl(path, SIGNED_URL_EXPIRY_SECONDS);

  if (error) {
    console.error(`[supabase.js] Failed to sign URL for "${path}":`, error.message);
    return null;
  }

  return data.signedUrl;
}

/**
 * Batch version of getSignedImageUrl — signs many paths in parallel.
 * Used by useProjects so a grid of 12 project cards doesn't wait on
 * 12 sequential round-trips.
 *
 * @param {string[]} paths
 * @returns {Promise<Record<string, string|null>>} map of path -> signed URL
 */
export async function getSignedImageUrls(paths) {
  const uniquePaths = [...new Set(paths.filter(Boolean))];

  const results = await Promise.all(
    uniquePaths.map(async (path) => [path, await getSignedImageUrl(path)])
  );

  return Object.fromEntries(results);
}

/**
 * Admin-only: upload a project or news cover image into the private bucket.
 * Blocked by RLS/Storage policy for any non-authenticated request — see
 * the storage policies in the README at the bottom of this blueprint.
 *
 * @param {File} file - the raw File object from an <input type="file">
 * @param {string} folder - logical sub-folder, e.g. "projects" or "news"
 * @returns {Promise<string>} the storage path to persist in the DB row
 *   (e.g. "projects/1719300000-riverside-tower.jpg")
 */
export async function uploadCompanyAsset(file, folder = 'projects') {
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '-');
  const path = `${folder}/${Date.now()}-${safeName}`;

  const { error } = await supabase.storage.from(PRIVATE_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (error) throw error;
  return path; // store THIS string in the DB, never a raw URL
}

/** Admin-only: remove an asset from the private bucket (e.g. on project delete). */
export async function deleteCompanyAsset(path) {
  if (!path) return;
  const { error } = await supabase.storage.from(PRIVATE_BUCKET).remove([path]);
  if (error) throw error;
}

/**
 * Admin-only: upload several files in parallel (used by the multi-image
 * gallery field in ProjectForm). Returns the storage paths in the SAME
 * order as the input files, so callers can zip them with sort_order.
 *
 * @param {File[]} files
 * @param {string} folder
 * @returns {Promise<string[]>}
 */
export async function uploadCompanyAssets(files, folder = 'projects') {
  const limited = files.slice(0, MAX_GALLERY_IMAGES);
  return Promise.all(limited.map((file) => uploadCompanyAsset(file, folder)));
}

export { MAX_GALLERY_IMAGES };