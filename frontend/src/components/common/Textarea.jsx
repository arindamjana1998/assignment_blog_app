import React, { forwardRef } from 'react';

export const Textarea = forwardRef(
  (
    {
      label,
      name,
      rows = 4,
      placeholder,
      error,
      helperText,
      disabled = false,
      required = false,
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <div className={`w-full ${className}`}>
        {label && (
          <label
            htmlFor={name}
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            {label}
            {required && <span className="text-rose-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative rounded-lg shadow-sm">
          <textarea
            ref={ref}
            id={name}
            name={name}
            rows={rows}
            placeholder={placeholder}
            disabled={disabled}
            className={`
              w-full rounded-lg text-sm bg-white border transition-colors duration-150
              placeholder:text-slate-400 text-slate-900 px-3.5 py-2.5
              focus:outline-none focus:ring-2 focus:ring-offset-0
              disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed
              ${
                error
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200'
                  : 'border-slate-300 focus:border-brand-500 focus:ring-brand-200'
              }
            `}
            {...props}
          />
        </div>

        {error && (
          <p className="mt-1.5 text-xs text-rose-600">{error}</p>
        )}

        {helperText && !error && (
          <p className="mt-1.5 text-xs text-slate-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;
