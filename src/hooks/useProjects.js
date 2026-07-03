import { useEffect, useState, useCallback } from 'react';
import {
  fetchProjects,
  fetchProjectImagesForMany,
  getSignedImageUrls,
} from '../services/supabase.js';

/**
 * useProjects
 * ----------------------------------------------------------------------
 * Fetches all project rows AND their full image gallery, resolving every
 * `image_path` (cover image + every gallery row) into a temporary signed
 * URL. Consuming components only ever see a ready-to-render `imageUrls`
 * array per project — they never touch the storage or project_images
 * tables directly.
 *
 * Each returned project has:
 *   - imageUrl:  string | null        (cover image — kept for places that
 *                                       only show one preview, e.g. admin table)
 *   - imageUrls: string[]             (full carousel, cover image first,
 *                                       then gallery rows in sort_order;
 *                                       always at least length 1 if any
 *                                       image resolved successfully)
 *
 * Returns: { projects, isLoading, error, refetch }
 * ----------------------------------------------------------------------
 */
export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Get the raw project rows (image_path is the cover image's path).
      const rows = await fetchProjects();

      // 2. Get every gallery row for every project in ONE query, grouped
      //    by project_id, rather than N queries (one per card).
      const galleryByProject = await fetchProjectImagesForMany(rows.map((row) => row.id));

      // 3. Build the full list of distinct paths that need signing: every
      //    cover image + every gallery image, across all projects.
      const allPaths = rows.flatMap((row) => {
        const galleryPaths = (galleryByProject[row.id] ?? []).map((img) => img.image_path);
        return [row.image_path, ...galleryPaths];
      });
      const urlMap = await getSignedImageUrls(allPaths);

      // 4. Merge everything onto each row: imageUrl (cover) + imageUrls
      //    (cover first, then gallery, in order — skipping any path that
      //    failed to sign rather than leaving a hole in the carousel).
      const withSignedUrls = rows.map((row) => {
        const gallery = galleryByProject[row.id] ?? [];
        const orderedPaths = [row.image_path, ...gallery.map((img) => img.image_path)];
        const imageUrls = orderedPaths.map((path) => urlMap[path]).filter(Boolean);

        return {
          ...row, // includes `status` from fetchProjects's select
          imageUrl: urlMap[row.image_path] ?? null,
          imageUrls,
        };
      });

      setProjects(withSignedUrls);
    } catch (err) {
      console.error('[useProjects] Failed to load projects:', err.message);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  return { projects, isLoading, error, refetch: loadProjects };
}

