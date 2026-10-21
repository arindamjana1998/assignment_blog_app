import React, { forwardRef } from 'react';

export const Input = forwardRef(
  (
    {
      label,
      name,
      type = 'text',
      placeholder,
      error,
      helperText,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      onRightIconClick,
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
          {LeftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <LeftIcon className="w-4 h-4" />
            </div>
          )}

          <input
            ref={ref}
            id={name}
            name={name}
            type={type}
            placeholder={placeholder}
            disabled={disabled}
            className={`
              w-full rounded-lg text-sm bg-white border transition-colors duration-150
              placeholder:text-slate-400 text-slate-900
              focus:outline-none focus:ring-2 focus:ring-offset-0
              disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed
              ${LeftIcon ? 'pl-9' : 'pl-3.5'}
              ${RightIcon ? 'pr-10' : 'pr-3.5'}
              py-2
              ${
                error
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200'
                  : 'border-slate-300 focus:border-brand-500 focus:ring-brand-200'
              }
            `}
            {...props}
          />

          {RightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {onRightIconClick ? (
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={onRightIconClick}
                  className="text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  <RightIcon className="w-4 h-4" />
                </button>
              ) : (
                <RightIcon className="w-4 h-4 text-slate-400 pointer-events-none" />
              )}
            </div>
          )}
        </div>

        {error && (
          <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
            <span>{error}</span>
          </p>
        )}

        {helperText && !error && (
          <p className="mt-1.5 text-xs text-slate-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
