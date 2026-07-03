import { useEffect, useState, useCallback } from 'react';
import { fetchNewsPosts, getSignedImageUrls } from '../services/supabase.js';

/**
 * useNews
 * ----------------------------------------------------------------------
 * Fetches all news posts and resolves each post's optional `image_path`
 * into a signed URL, mirroring the useProjects pattern. A news post with
 * no image (image_path is null) simply gets imageUrl: null, and
 * <NewsCard> renders a text-only layout in that case.
 * ----------------------------------------------------------------------
 */
export function useNews() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPosts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const rows = await fetchNewsPosts();
      const paths = rows.map((row) => row.image_path).filter(Boolean);
      const urlMap = await getSignedImageUrls(paths);

      const withSignedUrls = rows.map((row) => ({
        ...row,
        imageUrl: row.image_path ? urlMap[row.image_path] ?? null : null,
      }));

      setPosts(withSignedUrls);
    } catch (err) {
      console.error('[useNews] Failed to load news posts:', err.message);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  return { posts, isLoading, error, refetch: loadPosts };
}
