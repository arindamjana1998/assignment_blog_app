import React from 'react';

export const Card = ({
  children,
  className = '',
  hover = false,
  padding = 'p-6',
  ...props
}) => {
  return (
    <div
      className={`
        bg-white rounded-xl border border-slate-200/80 shadow-sm
        ${hover ? 'transition-all duration-200 hover:shadow-md hover:border-slate-300' : ''}
        ${padding}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
