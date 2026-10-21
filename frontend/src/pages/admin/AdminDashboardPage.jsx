import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserCheck,
  FileText,
  MessageSquare,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Lock,
  Layers,
} from 'lucide-react';
import adminService from '../../services/adminService';
import StatCard from '../../components/admin/StatCard';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Alert from '../../components/common/Alert';
import { useAuth } from '../../hooks/useAuth';

export const AdminDashboardPage = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalPosts: 0,
    totalComments: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMetrics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await adminService.getDashboardMetrics();
      if (response?.data) {
        setMetrics(response.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
      setError(err?.response?.data?.message || 'Failed to load system metrics. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            System Overview
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Real-time platform metrics, moderation status, and administration controls.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={fetchMetrics}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-brand-600' : ''}`} />
            <span>Refresh Metrics</span>
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" dismissible onDismiss={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* 4 Platform Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Users"
          value={metrics.totalUsers}
          icon={Users}
          color="brand"
          description="Registered platform accounts"
          isLoading={isLoading}
        />
        <StatCard
          title="Active Users"
          value={metrics.activeUsers}
          icon={UserCheck}
          color="emerald"
          description="Accounts in active standing"
          isLoading={isLoading}
        />
        <StatCard
          title="Published Posts"
          value={metrics.totalPosts}
          icon={FileText}
          color="sky"
          description="Live visible articles"
          isLoading={isLoading}
        />
        <StatCard
          title="Platform Comments"
          value={metrics.totalComments}
          icon={MessageSquare}
          color="amber"
          description="Live user discussions"
          isLoading={isLoading}
        />
      </div>

      {/* Quick Navigation Panels */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Management Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Users Panel */}
          <Card className="hover:border-brand-300 transition-colors p-6 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">User Management</h3>
              <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                Inspect registered users, promote users to administrators, or suspend unauthorized accounts.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100">
              <Link
                to="/admin/users"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
              >
                <span>Manage Users</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </Card>

          {/* Posts Panel */}
          <Card className="hover:border-sky-300 transition-colors p-6 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center mb-4">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">Post Moderation</h3>
              <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                Review all articles, edit post content, restore soft-deleted submissions, or permanently delete spam.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100">
              <Link
                to="/admin/posts"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 hover:text-sky-700 transition-colors"
              >
                <span>Moderate Posts</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </Card>

          {/* Comments Panel */}
          <Card className="hover:border-amber-300 transition-colors p-6 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">Comment Moderation</h3>
              <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                Monitor discussions across all posts, enforce community guidelines, and remove inappropriate replies.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100">
              <Link
                to="/admin/comments"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors"
              >
                <span>Moderate Comments</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* System Status & Admin Audit Note */}
      <Card className="bg-slate-900 text-slate-200 border-slate-800 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Platform Security Active</span>
            </div>
            <h4 className="text-lg font-bold text-white">
              Authenticated Administrator: {user?.name || 'Administrator'}
            </h4>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              All administrative operations are authenticated via rotated JWT credentials and verified against server-side Role-Based Access Control (RBAC). Permanent deletions trigger strict database cascades.
            </p>
          </div>

          <div className="flex flex-wrap md:flex-col gap-2 shrink-0 text-xs">
            <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-2 rounded-lg text-slate-300">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>JWT Rotation Enabled</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-2 rounded-lg text-slate-300">
              <Layers className="w-3.5 h-3.5 text-sky-400" />
              <span>Cascade Pruning Protected</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboardPage;
