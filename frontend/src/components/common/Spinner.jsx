import React from 'react';
import { Loader2 } from 'lucide-react';

export const Spinner = ({
  size = 'md',
  className = '',
  label = 'Loading...',
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  return (
    <div className={`flex items-center justify-center gap-2 text-brand-600 ${className}`} role="status">
      <Loader2 className={`${sizes[size] || sizes.md} animate-spin`} />
      <span className="sr-only">{label}</span>
    </div>
  );
};

export default Spinner;
