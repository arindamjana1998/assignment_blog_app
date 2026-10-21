import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { PenSquare, Edit3, Trash2, BookOpen } from 'lucide-react';
import postService from '../services/postService';
import PostGrid from '../components/posts/PostGrid';
import PostSearchBar from '../components/posts/PostSearchBar';
import Pagination from '../components/common/Pagination';
import Button from '../components/common/Button';
import ConfirmationModal from '../components/common/ConfirmationModal';
import { useAuth } from '../hooks/useAuth';
import { getErrorMessage } from '../utils/errorHandler';

export const MyPostsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Deletion state
  const [postToDelete, setPostToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const currentSearch = searchParams.get('search') || '';
  const currentSort = searchParams.get('sort') || 'createdAt';
  const currentOrder = searchParams.get('order') || 'desc';

  const fetchMyPosts = useCallback(async () => {
    if (!user?._id) return;
    try {
      setIsLoading(true);
      setError(null);

      const params = {
        author: user._id,
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
  }, [user?._id, currentPage, currentSearch, currentSort, currentOrder]);

  useEffect(() => {
    fetchMyPosts();
  }, [fetchMyPosts]);

  const handleFilterChange = ({ search, sort, order }) => {
    const newParams = new URLSearchParams();
    if (search) newParams.set('search', search);
    if (sort) newParams.set('sort', sort);
    if (order) newParams.set('order', order);
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeletePost = async () => {
    if (!postToDelete) return;
    try {
      setIsDeleting(true);
      await postService.deletePost(postToDelete._id);
      toast.success('Article deleted successfully');
      setPosts((prev) => prev.filter((p) => p._id !== postToDelete._id));
      setPostToDelete(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Articles
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage, edit, or remove your published articles
          </p>
        </div>

        <Link to="/posts/create">
          <Button variant="primary" leftIcon={PenSquare}>
            New Article
          </Button>
        </Link>
      </div>

      {/* Filter Bar */}
      <PostSearchBar
        initialSearch={currentSearch}
        initialSort={currentSort}
        initialOrder={currentOrder}
        onFilterChange={handleFilterChange}
      />

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Posts Grid with Edit & Delete Action Buttons */}
      <PostGrid
        posts={posts}
        isLoading={isLoading}
        emptyTitle={currentSearch ? 'No matching articles' : 'You haven’t written any articles yet'}
        emptyDescription={
          currentSearch
            ? `No articles match "${currentSearch}".`
            : 'Ready to share your voice? Create your first blog post now.'
        }
        emptyActionLabel="Write an Article"
        onEmptyAction={() => navigate('/posts/create')}
        renderActions={(post) => (
          <div className="flex items-center gap-1">
            <Link to={`/posts/${post._id}/edit`}>
              <button
                type="button"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title="Edit Article"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </Link>
            <button
              type="button"
              onClick={() => setPostToDelete(post)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Delete Article"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      />

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="pt-8 flex justify-center">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!postToDelete}
        onClose={() => setPostToDelete(null)}
        onConfirm={handleDeletePost}
        title="Delete Article"
        message={`Are you sure you want to delete "${postToDelete?.title}"? It will be removed from your public feed.`}
        confirmText="Delete"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default MyPostsPage;
