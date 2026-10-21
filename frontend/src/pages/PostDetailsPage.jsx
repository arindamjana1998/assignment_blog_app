import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Edit3,
  Trash2,
  Share2,
  User as UserIcon,
} from 'lucide-react';
import postService from '../services/postService';
import CommentSection from '../components/comments/CommentSection';
import ConfirmationModal from '../components/common/ConfirmationModal';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import { useAuth } from '../hooks/useAuth';
import { formatDate } from '../utils/dateFormatter';
import { estimateReadingTime } from '../utils/stringHelpers';
import { getErrorMessage } from '../utils/errorHandler';

export const PostDetailsPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await postService.getPostBySlug(slug);
        setPost(res.data?.post || null);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchPost();
    }
  }, [slug]);

  const authorId = post?.author?._id || post?.author;
  const isOwner = user && authorId?.toString() === user._id?.toString();
  const canModify = isOwner || user?.role === 'admin';

  const handleDeletePost = async () => {
    try {
      setIsDeleting(true);
      await postService.deletePost(post._id);
      toast.success('Post deleted successfully');
      navigate('/', { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.title,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Article Not Found</h2>
        <p className="text-slate-500 text-sm">
          {error || 'The requested article could not be located or may have been deleted.'}
        </p>
        <Link to="/">
          <Button variant="secondary" size="sm" leftIcon={ArrowLeft}>
            Back to Articles
          </Button>
        </Link>
      </div>
    );
  }

  const readingTime = estimateReadingTime(post.content);
  const formattedDate = formatDate(post.createdAt);
  const authorName = post.author?.name || 'Anonymous Author';
  const authorAvatar = post.author?.avatar;

  return (
    <article className="max-w-3xl mx-auto space-y-10">
      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Articles</span>
        </Link>

        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          title="Share Article"
        >
          <Share2 className="w-4 h-4" />
          <span className="hidden sm:inline">Share</span>
        </button>
      </div>

      {/* Article Header */}
      <header className="space-y-6">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          {post.title}
        </h1>

        {/* Author & Publishing Details */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-slate-200/80">
          <div className="flex items-center gap-3.5">
            {authorAvatar ? (
              <img
                src={authorAvatar}
                alt={authorName}
                className="w-11 h-11 rounded-full object-cover border border-slate-200"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-brand-100 text-brand-700 font-bold text-sm flex items-center justify-center">
                {authorName.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-sm font-bold text-slate-900 leading-none">
                {authorName}
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {formattedDate}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {readingTime} min read
                </span>
              </div>
            </div>
          </div>

          {/* Author/Admin Actions */}
          {canModify && (
            <div className="flex items-center gap-2">
              <Link to={`/posts/${post._id}/edit`}>
                <Button variant="secondary" size="sm" leftIcon={Edit3}>
                  Edit
                </Button>
              </Link>
              <Button
                variant="danger"
                size="sm"
                leftIcon={Trash2}
                onClick={() => setIsDeleteModalOpen(true)}
              >
                Delete
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Article Full Content */}
      <div className="prose prose-slate max-w-none">
        <div className="text-base sm:text-lg text-slate-800 leading-relaxed font-normal whitespace-pre-line tracking-normal">
          {post.content}
        </div>
      </div>

      {/* Discussion & Comments Section */}
      <CommentSection postId={post._id} user={user} />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeletePost}
        title="Delete Article"
        message="Are you sure you want to delete this article? It will be removed from the public blog feed."
        confirmText="Delete Article"
        isLoading={isDeleting}
      />
    </article>
  );
};

export default PostDetailsPage;
