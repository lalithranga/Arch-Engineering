import { useEffect, useState, useCallback } from 'react';
import { fetchProjectById, fetchProjectImages, getSignedImageUrls } from '../services/supabase.js';

/**
 * useProject(projectId)
 * ----------------------------------------------------------------------
 * Fetches ONE project by id plus its full image gallery, resolving every
 * path (cover + gallery) into a signed URL — the single-project version
 * of useProjects, used by the project detail page (ProjectDetail.jsx)
 * instead of the homepage grid.
 *
 * Returns: { project, isLoading, error }
 *   - project.imageUrls: string[]  (cover first, then gallery, in order)
 * ----------------------------------------------------------------------
 */
export function useProject(projectId) {
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);
    setError(null);

    try {
      const row = await fetchProjectById(projectId);
      const gallery = await fetchProjectImages(projectId);

      const orderedPaths = [row.image_path, ...gallery.map((img) => img.image_path)];
      const urlMap = await getSignedImageUrls(orderedPaths);
      const imageUrls = orderedPaths.map((path) => urlMap[path]).filter(Boolean);

      setProject({ ...row, imageUrls });
    } catch (err) {
      console.error('[useProject] Failed to load project:', err.message);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  return { project, isLoading, error, refetch: load };
}
