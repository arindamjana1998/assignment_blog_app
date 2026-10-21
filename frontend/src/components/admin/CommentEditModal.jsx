import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Textarea from '../common/Textarea';
import Alert from '../common/Alert';
import Badge from '../common/Badge';

export const CommentEditModal = ({
  isOpen,
  onClose,
  comment,
  onSave,
  isLoading = false,
}) => {
  const [content, setContent] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (comment) {
      setContent(comment.content || '');
      setError(null);
    }
  }, [comment]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!content.trim()) {
      setError('Comment content cannot be empty.');
      return;
    }

    try {
      await onSave(comment._id, {
        content: content.trim(),
      });
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to update comment.');
    }
  };

  if (!comment) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Moderate & Edit Comment" maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Alert variant="danger" dismissible onDismiss={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Comment Metadata Overview */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs text-slate-500">Author</p>
            <p className="text-sm font-semibold text-slate-900">
              {comment.author?.name || 'Anonymous'}{' '}
              <span className="text-xs font-normal text-slate-500">
                ({comment.author?.email || 'No email'})
              </span>
            </p>
          </div>
          <div>
            <Badge variant="default" size="sm">
              Article: {comment.post?.title || 'Unknown Post'}
            </Badge>
          </div>
        </div>

        {/* Content Textarea */}
        <Textarea
          label="Comment Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={5}
          placeholder="Enter comment content..."
          required
        />

        {/* Action Buttons */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
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

export default CommentEditModal;
