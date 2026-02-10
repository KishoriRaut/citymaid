import { useState, useEffect, useCallback } from 'react';
import { PostWithMaskedContact } from '@/lib/types';
import { getPublicPostsClient } from '@/lib/posts-client';

interface UsePostsOptions {
  initialPage?: number;
  pageSize?: number;
  postType?: 'all' | 'employer' | 'employee';
  postedTimeFilter?: string;
}

export function usePosts({
  initialPage = 1,
  pageSize = 12,
  postType = 'all',
  postedTimeFilter = 'all',
}: UsePostsOptions = {}) {
  const [posts, setPosts] = useState<PostWithMaskedContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: initialPage,
    totalPages: 1,
    totalItems: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const loadPosts = useCallback(async (page: number = initialPage) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await getPublicPostsClient(
        page,
        pageSize,
        postType,
        postedTimeFilter
      );

      if (result.error) {
        throw new Error(result.error);
      }

      setPosts(result.posts);
      setPagination({
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        totalItems: result.total,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage,
      });
    } catch (err) {
      console.error('Failed to load posts:', err);
      setError(err instanceof Error ? err.message : 'Failed to load posts');
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  }, [initialPage, pageSize, postType, postedTimeFilter]);

  // Load initial data
  useEffect(() => {
    loadPosts(initialPage);
  }, [loadPosts, initialPage]);

  return {
    posts,
    isLoading,
    error,
    pagination,
    loadPosts,
    setPosts,
  };
}
