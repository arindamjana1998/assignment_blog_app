import React from 'react';
import { Navigate, Outlet, Link } from 'react-router-dom';
import { ShieldX, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../components/common/Spinner';
import Button from '../components/common/Button';

export const AdminRoute = () => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center space-y-3">
          <Spinner size="lg" />
          <p className="text-xs uppercase tracking-widest text-slate-400 font-medium">
            Verifying Admin Privileges...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-8 text-center space-y-5">
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
            <ShieldX className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900">Access Restricted</h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              This area requires administrator privileges. Your current account does not have authorization to view this resource.
            </p>
          </div>
          <Link to="/">
            <Button variant="primary" size="sm" leftIcon={ArrowLeft} className="w-full">
              Return to Public Feed
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return <Outlet />;
};

export default AdminRoute;
