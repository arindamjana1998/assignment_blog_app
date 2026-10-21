import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { MessageSquare } from 'lucide-react';
import commentService from '../../services/commentService';
import CommentForm from './CommentForm';
import CommentCard from './CommentCard';
import Spinner from '../common/Spinner';
import { getErrorMessage } from '../../utils/errorHandler';

export const CommentSection = ({ postId, user }) => {
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pagination, setPagination] = useState(null);

  const fetchComments = useCallback(async () => {
    if (!postId) return;
    try {
      setIsLoading(true);
      const res = await commentService.getCommentsByPost(postId, { page: 1, limit: 50 });
      setComments(res.data || []);
      setPagination(res.pagination || null);
    } catch (err) {
      // Post might be new or empty
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleCreateComment = async (content) => {
    try {
      setIsSubmitting(true);
      const res = await commentService.createComment(postId, { content });
      toast.success('Comment posted successfully');
      // Append new comment or refetch
      if (res.data?.comment) {
        setComments((prev) => [res.data.comment, ...prev]);
      } else {
        await fetchComments();
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateComment = async (commentId, newContent) => {
    try {
      await commentService.updateComment(commentId, { content: newContent });
      toast.success('Comment updated');
      setComments((prev) =>
        prev.map((c) => (c._id === commentId ? { ...c, content: newContent } : c))
      );
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err;
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await commentService.deleteComment(commentId);
      toast.success('Comment deleted');
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err;
    }
  };

  return (
    <section className="space-y-6 pt-10 border-t border-slate-200" id="comments">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-brand-600" />
          <span>Discussion ({comments.length})</span>
        </h3>
      </div>

      {/* Comment Submission Form */}
      <CommentForm
        isAuthenticated={!!user}
        onSubmit={handleCreateComment}
        isSubmitting={isSubmitting}
      />

      {/* Comments Listing */}
      {isLoading ? (
        <div className="py-12 flex justify-center">
          <Spinner size="md" />
        </div>
      ) : comments.length === 0 ? (
        <div className="py-8 text-center text-slate-400 text-sm italic">
          No comments yet. Start the conversation!
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentCard
              key={comment._id}
              comment={comment}
              currentUserId={user?._id}
              isAdmin={user?.role === 'admin'}
              onUpdate={handleUpdateComment}
              onDelete={handleDeleteComment}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default CommentSection;
