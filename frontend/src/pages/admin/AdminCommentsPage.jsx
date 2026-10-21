import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  MessageSquare,
  Trash2,
  Edit2,
  RefreshCw,
  ExternalLink,
  User,
  FileText,
} from "lucide-react";
import adminService from "../../services/adminService";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Pagination from "../../components/common/Pagination";
import EmptyState from "../../components/common/EmptyState";
import Skeleton from "../../components/common/Skeleton";
import ConfirmationModal from "../../components/common/ConfirmationModal";
import CommentEditModal from "../../components/admin/CommentEditModal";
import { formatDate, formatRelativeTime } from "../../utils/dateFormatter";

export const AdminCommentsPage = () => {
  const [comments, setComments] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1,
  });

  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [selectedComment, setSelectedComment] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const fetchComments = useCallback(
    async (page = 1) => {
      setIsLoading(true);
      try {
        const response = await adminService.getComments({
          page,
          limit: pagination.limit,
        });
        if (response?.data) {
          setComments(response.data);
          if (response.pagination) {
            setPagination(response.pagination);
          }
        }
      } catch (err) {
        toast.error(
          err?.response?.data?.message || "Failed to retrieve comments",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [pagination.limit],
  );

  useEffect(() => {
    fetchComments(1);
  }, [fetchComments]);

  const handleDeleteClick = (comment) => {
    setSelectedComment(comment);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedComment) return;
    setIsActionLoading(true);
    try {
      await adminService.deleteComment(selectedComment._id);
      toast.success("Comment deleted successfully");
      setIsDeleteModalOpen(false);
      setSelectedComment(null);
      fetchComments(pagination.page);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete comment");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleEditClick = (comment) => {
    setSelectedComment(comment);
    setIsEditModalOpen(true);
  };

  const handleSaveComment = async (commentId, updateData) => {
    setIsActionLoading(true);
    try {
      await adminService.updateComment(commentId, updateData);
      toast.success("Comment updated successfully");
      setIsEditModalOpen(false);
      setSelectedComment(null);
      fetchComments(pagination.page);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update comment");
      throw err;
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
            Comment Moderation
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Oversee community responses, ensure civil discussion, and purge spam
            comments.
          </p>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => fetchComments(pagination.page)}
          disabled={isLoading}
          className="flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Comments List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-6">Comment</th>
                <th className="py-3.5 px-4">Author</th>
                <th className="py-3.5 px-4">Associated Article</th>
                <th className="py-3.5 px-4 hidden md:table-cell">Posted</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={`skeleton-${index}`}>
                    <td className="py-4 px-4 sm:px-6">
                      <Skeleton className="h-4 w-64" />
                    </td>
                    <td className="py-4 px-4">
                      <Skeleton className="h-4 w-28" />
                    </td>
                    <td className="py-4 px-4">
                      <Skeleton className="h-4 w-36" />
                    </td>
                    <td className="py-4 px-4 hidden md:table-cell">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-right">
                      <Skeleton className="h-8 w-12 ml-auto rounded-lg" />
                    </td>
                  </tr>
                ))
              ) : comments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12">
                    <EmptyState
                      icon={MessageSquare}
                      title="No comments found"
                      description="There are currently no user comments across the platform."
                    />
                  </td>
                </tr>
              ) : (
                comments.map((comment) => {
                  return (
                    <tr
                      key={comment._id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {/* Content */}
                      <td className="py-3.5 px-4 sm:px-6 max-w-sm">
                        <p className="text-slate-900 font-medium line-clamp-2 leading-relaxed">
                          {comment.content}
                        </p>
                      </td>

                      {/* Author */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-[10px] font-bold">
                            <User className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="font-semibold text-slate-800 block text-xs">
                              {comment.author?.name || "Anonymous"}
                            </span>
                            <span className="text-[11px] text-slate-400 block truncate max-w-[140px]">
                              {comment.author?.email || "No email"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Associated Post */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {comment.post ? (
                          <div className="flex items-center gap-1.5 text-xs text-brand-600 font-medium">
                            <FileText className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                            {comment.post.slug ? (
                              <Link
                                to={`/posts/${comment.post.slug}`}
                                rel="noreferrer"
                                className="hover:underline truncate max-w-[180px] inline-flex items-center gap-1"
                              >
                                <span className="truncate">
                                  {comment.post.title || "Untitled Post"}
                                </span>
                                <ExternalLink className="w-3 h-3 shrink-0" />
                              </Link>
                            ) : (
                              <span className="truncate max-w-[180px] text-slate-700">
                                {comment.post.title || "Untitled Post"}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">
                            Deleted Article
                          </span>
                        )}
                      </td>

                      {/* Posted Date */}
                      <td className="py-3.5 px-4 text-xs text-slate-500 hidden md:table-cell whitespace-nowrap">
                        <span title={formatDate(comment.createdAt)}>
                          {formatRelativeTime(comment.createdAt)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleEditClick(comment)}
                            title="Edit Comment"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(comment)}
                            title="Permanently Delete Comment"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
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
              Showing page {pagination.page} of {pagination.totalPages} (
              {pagination.totalItems} total comments)
            </span>
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={(newPage) => fetchComments(newPage)}
            />
          </div>
        )}
      </div>

      {/* Edit Comment Modal */}
      <CommentEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedComment(null);
        }}
        comment={selectedComment}
        onSave={handleSaveComment}
        isLoading={isActionLoading}
      />

      {/* Delete Comment Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Comment"
        message={`Are you sure you want to permanently delete this comment by "${selectedComment?.author?.name || "Anonymous"}"? This action cannot be undone.`}
        confirmText="Delete Comment"
        confirmVariant="danger"
        isLoading={isActionLoading}
      />
    </div>
  );
};

export default AdminCommentsPage;
