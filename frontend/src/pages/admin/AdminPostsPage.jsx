import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FileText,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  RotateCcw,
  ExternalLink,
  Eye,
  EyeOff,
} from 'lucide-react';
import adminService from '../../services/adminService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import Skeleton from '../../components/common/Skeleton';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import PostEditModal from '../../components/admin/PostEditModal';
import { formatDate } from '../../utils/dateFormatter';
import { truncate } from '../../utils/stringHelpers';

export const AdminPostsPage = () => {
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1,
  });

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [selectedPost, setSelectedPost] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const fetchPosts = useCallback(
    async (page = 1) => {
      setIsLoading(true);
      try {
        const params = {
          page,
          limit: pagination.limit,
        };
        if (search.trim()) params.search = search.trim();
        if (statusFilter !== '') params.isDeleted = statusFilter === 'deleted';

        const response = await adminService.getPosts(params);
        if (response?.data) {
          setPosts(response.data);
          if (response.pagination) {
            setPagination(response.pagination);
          }
        }
      } catch (err) {
        toast.error(err?.response?.data?.message || 'Failed to retrieve posts');
      } finally {
        setIsLoading(false);
      }
    },
    [search, statusFilter, pagination.limit]
  );

  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPosts(1);
  };

  const handleEditClick = (post) => {
    setSelectedPost(post);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (post) => {
    setSelectedPost(post);
    setIsDeleteModalOpen(true);
  };

  const handleQuickRestore = async (post) => {
    setIsActionLoading(true);
    try {
      await adminService.updatePost(post._id, { isDeleted: false });
      toast.success(`Post "${post.title}" restored successfully`);
      fetchPosts(pagination.page);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to restore post');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleSavePost = async (postId, payload) => {
    setIsActionLoading(true);
    try {
      await adminService.updatePost(postId, payload);
      toast.success('Post updated successfully');
      fetchPosts(pagination.page);
    } catch (err) {
      throw err;
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedPost) return;
    setIsActionLoading(true);
    try {
      await adminService.deletePost(selectedPost._id);
      toast.success(`Post permanently deleted`);
      setIsDeleteModalOpen(false);
      setSelectedPost(null);
      fetchPosts(pagination.page);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete post');
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Post Moderation
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Review, edit, restore soft-deleted posts, or permanently purge offending articles.
          </p>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => fetchPosts(pagination.page)}
          disabled={isLoading}
          className="flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card padding="p-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search post title or content..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
            />
          </div>

          <div className="w-full md:w-52">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
            >
              <option value="">All Posts (Live & Hidden)</option>
              <option value="live">Live Only</option>
              <option value="deleted">Soft-Deleted Only</option>
            </select>
          </div>

          <Button type="submit" variant="primary" size="sm" className="whitespace-nowrap">
            Search Posts
          </Button>
        </form>
      </Card>

      {/* Posts Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-6">Article</th>
                <th className="py-3.5 px-4">Author</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 hidden md:table-cell">Created</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={`skeleton-${index}`}>
                    <td className="py-4 px-4 sm:px-6">
                      <div className="space-y-1.5">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-64" />
                      </div>
                    </td>
                    <td className="py-4 px-4"><Skeleton className="h-4 w-28" /></td>
                    <td className="py-4 px-4"><Skeleton className="h-5 w-20 rounded-full" /></td>
                    <td className="py-4 px-4 hidden md:table-cell"><Skeleton className="h-4 w-20" /></td>
                    <td className="py-4 px-4 sm:px-6 text-right"><Skeleton className="h-8 w-24 ml-auto rounded-lg" /></td>
                  </tr>
                ))
              ) : posts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12">
                    <EmptyState
                      icon={FileText}
                      title="No posts found"
                      description="No articles found matching the current search criteria."
                    />
                  </td>
                </tr>
              ) : (
                posts.map((post) => {
                  return (
                    <tr
                      key={post._id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {/* Post Title & Snippet */}
                      <td className="py-3.5 px-4 sm:px-6 max-w-xs md:max-w-md">
                        <div className="flex items-start gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 font-semibold text-slate-900 group">
                              <span className="truncate">{post.title}</span>
                              {!post.isDeleted && post.slug && (
                                <Link
                                  to={`/posts/${post.slug}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  title="View on Public Site"
                                  className="text-slate-400 hover:text-brand-600 transition-colors shrink-0"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </Link>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 truncate mt-0.5">
                              {truncate(post.content, 90)}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Author */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-medium text-slate-800 block text-xs">
                          {post.author?.name || 'Unknown'}
                        </span>
                        <span className="text-[11px] text-slate-400 block truncate max-w-[150px]">
                          {post.author?.email || 'No email'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <Badge
                          variant={post.isDeleted ? 'danger' : 'success'}
                          size="sm"
                          className="gap-1 inline-flex"
                        >
                          {post.isDeleted ? (
                            <>
                              <EyeOff className="w-3 h-3" />
                              <span>Soft-Deleted</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-3 h-3" />
                              <span>Live</span>
                            </>
                          )}
                        </Badge>
                      </td>

                      {/* Created Date */}
                      <td className="py-3.5 px-4 text-xs text-slate-500 hidden md:table-cell whitespace-nowrap">
                        {formatDate(post.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {post.isDeleted ? (
                            <button
                              type="button"
                              onClick={() => handleQuickRestore(post)}
                              disabled={isActionLoading}
                              title="Restore Post to Public Site"
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          ) : null}

                          <button
                            type="button"
                            onClick={() => handleEditClick(post)}
                            title="Edit or Moderate Post"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteClick(post)}
                            title="Permanently Delete Post & Comments"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Showing page {pagination.page} of {pagination.totalPages} ({pagination.totalItems} total posts)
            </span>
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={(newPage) => fetchPosts(newPage)}
            />
          </div>
        )}
      </div>

      {/* Edit Post Modal */}
      <PostEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        post={selectedPost}
        onSave={handleSavePost}
        isLoading={isActionLoading}
      />

      {/* Delete Post Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Permanently Delete Post"
        message={`Are you sure you want to permanently delete "${selectedPost?.title}"? This will permanently remove the article and cascade delete all associated comments from the database.`}
        confirmText="Hard Delete"
        confirmVariant="danger"
        isLoading={isActionLoading}
      />
    </div>
  );
};

export default AdminPostsPage;
