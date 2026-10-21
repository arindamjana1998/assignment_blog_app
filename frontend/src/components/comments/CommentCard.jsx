import React, { useState } from 'react';
import { Edit2, Trash2, Check, X, CornerDownRight } from 'lucide-react';
import { formatRelativeTime } from '../../utils/dateFormatter';
import ConfirmationModal from '../common/ConfirmationModal';
import Button from '../common/Button';

export const CommentCard = ({
  comment,
  currentUserId,
  isAdmin = false,
  onUpdate,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const authorId = comment.author?._id || comment.author;
  const isOwner = currentUserId && authorId?.toString() === currentUserId?.toString();
  const canModify = isOwner || isAdmin;

  const authorName = comment.author?.name || 'Anonymous User';
  const authorAvatar = comment.author?.avatar;
  const relativeDate = formatRelativeTime(comment.createdAt);

  const handleSaveEdit = async () => {
    if (!editedContent.trim()) return;
    try {
      setIsUpdating(true);
      await onUpdate(comment._id, editedContent.trim());
      setIsEditing(false);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      await onDelete(comment._id);
      setIsDeleteModalOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3 transition-colors">
      {/* Comment Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {authorAvatar ? (
            <img
              src={authorAvatar}
              alt={authorName}
              className="w-8 h-8 rounded-full object-cover border border-slate-200"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
              {authorName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">{authorName}</span>
              {isOwner && (
                <span className="text-[10px] font-semibold bg-brand-100 text-brand-700 px-1.5 py-0.2 rounded">
                  You
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-400">{relativeDate}</span>
          </div>
        </div>

        {canModify && !isEditing && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
              title="Edit Comment"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Delete Comment"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Comment Body / Inline Editor */}
      {isEditing ? (
        <div className="space-y-3 pt-1">
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            rows={3}
            className="w-full text-sm p-3 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                setIsEditing(false);
                setEditedContent(comment.content);
              }}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleSaveEdit}
              isLoading={isUpdating}
            >
              Save
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line pl-11">
          {comment.content}
        </p>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Comment"
        message="Are you sure you want to delete this comment? This action cannot be undone."
        confirmText="Delete Comment"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default CommentCard;
