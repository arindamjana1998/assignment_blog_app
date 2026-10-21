import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Calendar, ArrowRight, User as UserIcon } from 'lucide-react';
import Card from '../common/Card';
import { formatDate } from '../../utils/dateFormatter';
import { estimateReadingTime, truncate } from '../../utils/stringHelpers';

export const PostCard = ({ post, actions = null }) => {
  const readingTime = estimateReadingTime(post.content);
  const formattedDate = formatDate(post.createdAt);
  const authorName = post.author?.name || 'Anonymous Author';
  const authorAvatar = post.author?.avatar;

  return (
    <Card hover className="flex flex-col justify-between h-full group">
      <div className="space-y-4">
        {/* Author Metadata Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {authorAvatar ? (
              <img
                src={authorAvatar}
                alt={authorName}
                className="w-9 h-9 rounded-full object-cover border border-slate-200"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-brand-50 text-brand-700 font-semibold text-xs flex items-center justify-center border border-brand-200">
                {authorName.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-xs font-semibold text-slate-800 leading-none">
                {authorName}
              </p>
              <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formattedDate}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {readingTime} min read
                </span>
              </div>
            </div>
          </div>

          {actions && <div className="flex items-center gap-1">{actions}</div>}
        </div>

        {/* Title & Slug Link */}
        <div className="space-y-2">
          <Link to={`/posts/${post.slug}`}>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-2 leading-snug">
              {post.title}
            </h3>
          </Link>
          <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
            {truncate(post.content, 140)}
          </p>
        </div>
      </div>

      {/* Footer Read More Link */}
      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
        <Link
          to={`/posts/${post.slug}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 group-hover:text-brand-700 group-hover:translate-x-0.5 transition-all"
        >
          <span>Read Article</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </Card>
  );
};

export default PostCard;
