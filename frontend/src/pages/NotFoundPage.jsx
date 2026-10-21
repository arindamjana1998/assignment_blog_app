import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-3xl flex items-center justify-center mb-6 shadow-xs">
        <Compass className="w-8 h-8 text-brand-600 animate-spin-slow" />
      </div>
      <span className="text-xs uppercase tracking-widest font-bold text-brand-600 mb-2">
        404 — Page Not Found
      </span>
      <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
        Lost in the Archives?
      </h1>
      <p className="text-sm text-slate-500 max-w-md mb-8 leading-relaxed">
        The story, article, or resource you are seeking might have been renamed, archived, or is temporarily unavailable.
      </p>
      <Link to="/">
        <Button variant="primary" leftIcon={ArrowLeft}>
          Return to Home Feed
        </Button>
      </Link>
    </div>
  );
};

export default NotFoundPage;
