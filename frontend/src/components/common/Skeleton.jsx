import React from 'react';

export const Skeleton = ({
  className = '',
  variant = 'rectangular', // 'text' | 'circular' | 'rectangular'
  ...props
}) => {
  const variantStyles = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  return (
    <div
      className={`animate-pulse bg-slate-200/80 ${variantStyles[variant] || variantStyles.rectangular} ${className}`}
      {...props}
    />
  );
};

export const PostCardSkeleton = () => (
  <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm space-y-4">
    <div className="flex items-center gap-3">
      <Skeleton variant="circular" className="w-10 h-10" />
      <div className="space-y-1.5 flex-1">
        <Skeleton variant="text" className="w-1/3 h-3.5" />
        <Skeleton variant="text" className="w-1/4 h-3" />
      </div>
    </div>
    <Skeleton variant="text" className="w-3/4 h-6" />
    <Skeleton variant="text" className="w-full h-4" />
    <Skeleton variant="text" className="w-5/6 h-4" />
    <div className="pt-2 flex justify-between items-center">
      <Skeleton variant="text" className="w-20 h-4" />
      <Skeleton variant="text" className="w-16 h-4" />
    </div>
  </div>
);

export default Skeleton;
