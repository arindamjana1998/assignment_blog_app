import React from 'react';
import Card from '../common/Card';
import Skeleton from '../common/Skeleton';

export const StatCard = ({
  title,
  value,
  icon: Icon,
  description,
  color = 'brand',
  isLoading = false,
}) => {
  const colorStyles = {
    brand: {
      bg: 'bg-brand-50 text-brand-600',
      border: 'border-brand-100',
    },
    emerald: {
      bg: 'bg-emerald-50 text-emerald-600',
      border: 'border-emerald-100',
    },
    amber: {
      bg: 'bg-amber-50 text-amber-600',
      border: 'border-amber-100',
    },
    sky: {
      bg: 'bg-sky-50 text-sky-600',
      border: 'border-sky-100',
    },
    rose: {
      bg: 'bg-rose-50 text-rose-600',
      border: 'border-rose-100',
    },
  };

  const activeColor = colorStyles[color] || colorStyles.brand;

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0 pr-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
            {title}
          </p>
          <div className="mt-2">
            {isLoading ? (
              <Skeleton className="h-9 w-24" />
            ) : (
              <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {typeof value === 'number' ? value.toLocaleString() : value ?? '0'}
              </h3>
            )}
          </div>
          {description && (
            <p className="mt-1 text-xs text-slate-400 truncate">
              {description}
            </p>
          )}
        </div>

        {Icon && (
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${activeColor.bg} ${activeColor.border}`}
          >
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </Card>
  );
};

export default StatCard;
