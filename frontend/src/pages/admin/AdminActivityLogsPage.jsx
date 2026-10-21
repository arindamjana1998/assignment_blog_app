import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  RefreshCw,
  Search,
  Filter,
  User,
  Clock,
  Shield,
  Zap,
} from 'lucide-react';
import adminService from '../../services/adminService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import Skeleton from '../../components/common/Skeleton';
import { formatDate, formatRelativeTime } from '../../utils/dateFormatter';

export const AdminActivityLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    totalItems: 0,
    totalPages: 1,
  });

  const [search, setSearch] = useState('');
  const [eventFilter, setEventFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = useCallback(
    async (page = 1) => {
      setIsLoading(true);
      try {
        const params = {
          page,
          limit: pagination.limit,
        };
        if (search.trim()) params.search = search.trim();
        if (eventFilter) params.event = eventFilter;

        const response = await adminService.getActivityLogs(params);
        if (response?.data) {
          setLogs(response.data);
          if (response.pagination) {
            setPagination(response.pagination);
          }
        }
      } catch (err) {
        console.error('Failed to fetch activity logs:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [search, eventFilter, pagination.limit]
  );

  useEffect(() => {
    fetchLogs(1);
  }, [fetchLogs]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchLogs(1);
  };

  const getEventBadgeVariant = (event) => {
    if (!event) return 'default';
    if (event.includes('DELETE')) return 'danger';
    if (event.includes('UPDATE')) return 'warning';
    if (event.includes('CREATE') || event.includes('REGISTRATION')) return 'success';
    if (event.includes('LOGIN')) return 'primary';
    return 'default';
  };

  const getStatusBadgeVariant = (statusCode) => {
    if (statusCode >= 200 && statusCode < 300) return 'success';
    if (statusCode >= 300 && statusCode < 400) return 'default';
    if (statusCode >= 400 && statusCode < 500) return 'warning';
    return 'danger';
  };

  const getMethodBadgeVariant = (method) => {
    switch (method) {
      case 'GET':
        return 'default';
      case 'POST':
        return 'success';
      case 'PATCH':
      case 'PUT':
        return 'warning';
      case 'DELETE':
        return 'danger';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Activity className="w-7 h-7 text-brand-600" />
            <span>User Activity Audit Logs</span>
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Real-time security audit trail capturing user logins, content mutations, and administrative operations.
          </p>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => fetchLogs(pagination.page)}
          disabled={isLoading}
          className="flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Logs</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card padding="p-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by user, email, path, or event keyword..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-2 min-w-[200px]">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
              className="w-full py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-700"
            >
              <option value="">All Activity Types</option>
              <option value="USER_LOGIN">User Logins</option>
              <option value="USER_LOGOUT">User Logouts</option>
              <option value="USER_REGISTRATION">Registrations</option>
              <option value="POST_CREATE">Post Creations</option>
              <option value="POST_UPDATE">Post Updates</option>
              <option value="POST_DELETE">Post Deletions</option>
              <option value="COMMENT_CREATE">Comment Creations</option>
              <option value="COMMENT_UPDATE">Comment Updates</option>
              <option value="COMMENT_DELETE">Comment Deletions</option>
              <option value="ADMIN_USER_UPDATE">Admin User Updates</option>
              <option value="ADMIN_USER_DELETE">Admin User Deletions</option>
            </select>
          </div>

          <Button type="submit" variant="primary" size="sm" className="whitespace-nowrap">
            Filter Logs
          </Button>
        </form>
      </Card>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-6">Event</th>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Request Path</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center hidden sm:table-cell">Latency</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <tr key={`skeleton-${index}`}>
                    <td className="py-4 px-4 sm:px-6"><Skeleton className="h-5 w-28 rounded-full" /></td>
                    <td className="py-4 px-4"><Skeleton className="h-4 w-36" /></td>
                    <td className="py-4 px-4"><Skeleton className="h-4 w-44" /></td>
                    <td className="py-4 px-4 text-center"><Skeleton className="h-5 w-12 mx-auto rounded-full" /></td>
                    <td className="py-4 px-4 text-center hidden sm:table-cell"><Skeleton className="h-4 w-12 mx-auto" /></td>
                    <td className="py-4 px-4 sm:px-6 text-right"><Skeleton className="h-4 w-20 ml-auto" /></td>
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12">
                    <EmptyState
                      icon={Activity}
                      title="No activity records found"
                      description="User operations and audit events will appear here in real time as actions occur."
                    />
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Event Badge */}
                    <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                      <Badge variant={getEventBadgeVariant(log.event)} size="sm">
                        {log.event}
                      </Badge>
                    </td>

                    {/* User Identity */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-[10px] font-bold">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-800 text-xs">
                              {log.userName || 'Anonymous'}
                            </span>
                            {log.userRole === 'admin' && (
                              <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1 rounded">
                                ADMIN
                              </span>
                            )}
                          </div>
                          {log.userEmail && (
                            <span className="text-[11px] text-slate-400 block truncate max-w-[160px]">
                              {log.userEmail}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Method & Path */}
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-700 max-w-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                            log.method === 'POST'
                              ? 'bg-emerald-100 text-emerald-800'
                              : log.method === 'PATCH' || log.method === 'PUT'
                              ? 'bg-amber-100 text-amber-800'
                              : log.method === 'DELETE'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {log.method}
                        </span>
                        <span className="truncate text-slate-600" title={log.path}>
                          {log.path}
                        </span>
                      </div>
                    </td>

                    {/* HTTP Status Code */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <Badge variant={getStatusBadgeVariant(log.statusCode)} size="sm">
                        {log.statusCode}
                      </Badge>
                    </td>

                    {/* Latency */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap hidden sm:table-cell text-xs text-slate-400">
                      {log.latencyMs ? `${log.latencyMs}ms` : '—'}
                    </td>

                    {/* Timestamp */}
                    <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap text-xs text-slate-500">
                      <span title={formatDate(log.createdAt)}>
                        {formatRelativeTime(log.createdAt)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Showing page {pagination.page} of {pagination.totalPages} ({pagination.totalItems} total logs)
            </span>
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={(newPage) => fetchLogs(newPage)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminActivityLogsPage;
