import React, { useState, useEffect } from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';

export const PostSearchBar = ({
  initialSearch = '',
  initialSort = 'createdAt',
  initialOrder = 'desc',
  onFilterChange,
}) => {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [sortOrder, setSortOrder] = useState(`${initialSort}:${initialOrder}`);

  // Debounced search trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      const [sort, order] = sortOrder.split(':');
      onFilterChange({
        search: searchTerm.trim(),
        sort,
        order,
      });
    }, 350);

    return () => clearTimeout(timer);
  }, [searchTerm, sortOrder, onFilterChange]);

  const handleClear = () => {
    setSearchTerm('');
  };

  return (
    <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center gap-3">
      {/* Search Input */}
      <div className="relative flex-1 w-full">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search articles by title or keywords..."
          className="w-full pl-10 pr-9 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl placeholder:text-slate-400 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
            aria-label="Clear search query"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Sort Dropdown */}
      <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
        <div className="relative w-full sm:w-48">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </div>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="w-full pl-8 pr-8 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 appearance-none cursor-pointer"
          >
            <option value="createdAt:desc">Newest First</option>
            <option value="createdAt:asc">Oldest First</option>
            <option value="title:asc">Title (A - Z)</option>
            <option value="title:desc">Title (Z - A)</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default PostSearchBar;
