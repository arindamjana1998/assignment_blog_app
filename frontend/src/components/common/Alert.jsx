import React from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export const Alert = ({
  variant = 'info',
  title,
  children,
  onClose,
  className = '',
}) => {
  const configs = {
    info: {
      bg: 'bg-sky-50 text-sky-800 border-sky-200',
      icon: Info,
      iconColor: 'text-sky-500',
    },
    success: {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      icon: CheckCircle2,
      iconColor: 'text-emerald-500',
    },
    warning: {
      bg: 'bg-amber-50 text-amber-800 border-amber-200',
      icon: AlertTriangle,
      iconColor: 'text-amber-500',
    },
    error: {
      bg: 'bg-rose-50 text-rose-800 border-rose-200',
      icon: AlertCircle,
      iconColor: 'text-rose-500',
    },
  };

  const config = configs[variant] || configs.info;
  const Icon = config.icon;

  return (
    <div
      role="alert"
      className={`rounded-xl border p-4 ${config.bg} ${className}`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${config.iconColor}`} />
        <div className="flex-1 text-sm">
          {title && <h5 className="font-semibold mb-1">{title}</h5>}
          <div className="leading-relaxed">{children}</div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 -mr-1 -mt-1 rounded focus:outline-none"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;
