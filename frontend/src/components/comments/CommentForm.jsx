import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, MessageSquare } from 'lucide-react';
import Button from '../common/Button';

export const CommentForm = ({
  isAuthenticated = false,
  onSubmit,
  isSubmitting = false,
}) => {
  const [content, setContent] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    await onSubmit(content.trim());
    setContent('');
  };

  if (!isAuthenticated) {
    return (
      <div className="p-6 bg-slate-50 border border-slate-200/80 rounded-xl text-center space-y-3">
        <MessageSquare className="w-8 h-8 text-slate-400 mx-auto" />
        <h4 className="text-sm font-semibold text-slate-800">
          Join the Discussion
        </h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Please sign in or create an account to share your thoughts and join the conversation.
        </p>
        <div className="flex items-center justify-center gap-3 pt-1">
          <Link to="/login">
            <Button variant="primary" size="sm">
              Sign In
            </Button>
          </Link>
          <Link to="/register">
            <Button variant="secondary" size="sm">
              Register
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="relative">
        <textarea
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your perspective or ask a question..."
          maxLength={1500}
          className="w-full text-sm p-4 rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors shadow-xs"
        />
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] text-slate-400">
            {content.length} / 1500 characters
          </span>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={!content.trim()}
            isLoading={isSubmitting}
            rightIcon={Send}
          >
            Post Comment
          </Button>
        </div>
      </div>
    </form>
  );
};

export default CommentForm;
