import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import Textarea from '../common/Textarea';
import Alert from '../common/Alert';
import Badge from '../common/Badge';
import { Eye, EyeOff } from 'lucide-react';

export const PostEditModal = ({
  isOpen,
  onClose,
  post,
  onSave,
  isLoading = false,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isDeleted, setIsDeleted] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (post) {
      setTitle(post.title || '');
      setContent(post.content || '');
      setIsDeleted(post.isDeleted || false);
      setError(null);
    }
  }, [post]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Post title cannot be empty.');
      return;
    }

    if (!content.trim()) {
      setError('Post content cannot be empty.');
      return;
    }

    try {
      await onSave(post._id, {
        title: title.trim(),
        content: content.trim(),
        isDeleted,
      });
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to update post.');
    }
  };

  if (!post) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Moderate & Edit Post" maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Alert variant="danger" dismissible onDismiss={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Post Metadata Overview */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs text-slate-500">Author</p>
            <p className="text-sm font-semibold text-slate-900">
              {post.author?.name || 'Unknown'} <span className="text-xs font-normal text-slate-500">({post.author?.email || 'No email'})</span>
            </p>
          </div>
          <div>
            <Badge variant={isDeleted ? 'danger' : 'success'} size="sm">
              {isDeleted ? 'Soft-Deleted / Hidden' : 'Published / Live'}
            </Badge>
          </div>
        </div>

        {/* Title */}
        <Input
          label="Post Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter post title"
          required
        />

        {/* Content */}
        <Textarea
          label="Post Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          placeholder="Enter full post content"
          required
        />

        {/* Visibility / Soft Delete Toggle */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            Publication Status
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setIsDeleted(false)}
              className={`
                flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all
                ${
                  !isDeleted
                    ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900 ring-1 ring-emerald-500'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }
              `}
            >
              <Eye className="w-4 h-4 text-emerald-600" />
              <span>Published / Visible</span>
            </button>

            <button
              type="button"
              onClick={() => setIsDeleted(true)}
              className={`
                flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all
                ${
                  isDeleted
                    ? 'border-rose-500 bg-rose-50/50 text-rose-900 ring-1 ring-rose-500'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }
              `}
            >
              <EyeOff className="w-4 h-4 text-rose-600" />
              <span>Soft-Deleted / Hidden</span>
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="secondary" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default PostEditModal;
