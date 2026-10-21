import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PenSquare, Sparkles } from 'lucide-react';
import postService from '../services/postService';
import PostSearchBar from '../components/posts/PostSearchBar';
import PostGrid from '../components/posts/PostGrid';
import Pagination from '../components/common/Pagination';
import Button from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';
import { getErrorMessage } from '../utils/errorHandler';

export const HomePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Read search & pagination from URL query
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const currentSearch = searchParams.get('search') || '';
  const currentSort = searchParams.get('sort') || 'createdAt';
  const currentOrder = searchParams.get('order') || 'desc';

  const fetchPosts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        limit: 9,
        search: currentSearch || undefined,
        sort: currentSort,
        order: currentOrder,
      };

      const res = await postService.getPosts(params);
      setPosts(res.data || []);
      setPagination(res.pagination || null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, currentSearch, currentSort, currentOrder]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleFilterChange = ({ search, sort, order }) => {
    const newParams = new URLSearchParams();
    if (search) newParams.set('search', search);
    if (sort) newParams.set('sort', sort);
    if (order) newParams.set('order', order);
    newParams.set('page', '1'); // Reset to page 1 on search change
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-10">
      {/* Editorial Hero Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto pt-4 sm:pt-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold tracking-wide border border-brand-200">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Ideas, Stories & Engineering Deep Dives</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Explore Perspectives & Learnings
        </h1>
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          A publication exploring modern software engineering, system architecture, and technology insights.
        </p>

        {user && (
          <div className="pt-2">
            <Link to="/posts/create">
              <Button variant="primary" leftIcon={PenSquare}>
                Publish an Article
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Search & Sort Filter Bar */}
      <div className="max-w-4xl mx-auto">
        <PostSearchBar
          initialSearch={currentSearch}
          initialSort={currentSort}
          initialOrder={currentOrder}
          onFilterChange={handleFilterChange}
        />
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-center text-sm">
          {error}
        </div>
      )}

      {/* Main Post Feed Grid */}
      <PostGrid
        posts={posts}
        isLoading={isLoading}
        emptyTitle={currentSearch ? 'No articles match your search' : 'No articles published yet'}
        emptyDescription={
          currentSearch
            ? `We couldn't find any articles matching "${currentSearch}". Try a different keyword.`
            : 'Be the first writer to share an article with our community.'
        }
        emptyActionLabel={user ? 'Write First Article' : 'Sign In to Write'}
        onEmptyAction={() => {
          if (currentSearch) {
            handleFilterChange({ search: '', sort: 'createdAt', order: 'desc' });
          }
        }}
      />

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="pt-8 flex justify-center">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default HomePage;
