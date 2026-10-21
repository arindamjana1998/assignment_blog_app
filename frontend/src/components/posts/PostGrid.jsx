import React from 'react';
import PostCard from './PostCard';
import { PostCardSkeleton } from '../common/Skeleton';
import EmptyState from '../common/EmptyState';
import { BookOpen } from 'lucide-react';

export const PostGrid = ({
  posts = [],
  isLoading = false,
  emptyTitle = 'No stories published yet',
  emptyDescription = 'Be the first to share an article with our community.',
  emptyActionLabel,
  onEmptyAction,
  renderActions,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((idx) => (
          <PostCardSkeleton key={idx} />
        ))}
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={emptyActionLabel}
        onAction={onEmptyAction}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post) => (
        <PostCard
          key={post._id}
          post={post}
          actions={renderActions ? renderActions(post) : null}
        />
      ))}
    </div>
  );
};

export default PostGrid;
