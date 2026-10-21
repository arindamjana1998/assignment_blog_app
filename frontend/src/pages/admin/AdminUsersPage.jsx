import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  Users,
  Search,
  Filter,
  Edit2,
  Trash2,
  Shield,
  ShieldAlert,
  UserCheck,
  UserX,
  RefreshCw,
} from 'lucide-react';
import adminService from '../../services/adminService';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import Skeleton from '../../components/common/Skeleton';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import UserEditModal from '../../components/admin/UserEditModal';
import { formatDate } from '../../utils/dateFormatter';

export const AdminUsersPage = () => {
  const { user: currentAdmin } = useAuth();

  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1,
  });

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const fetchUsers = useCallback(
    async (page = 1) => {
      setIsLoading(true);
      try {
        const params = {
          page,
          limit: pagination.limit,
        };
        if (search.trim()) params.search = search.trim();
        if (roleFilter) params.role = roleFilter;
        if (statusFilter !== '') params.isActive = statusFilter === 'active';

        const response = await adminService.getUsers(params);
        if (response?.data) {
          setUsers(response.data);
          if (response.pagination) {
            setPagination(response.pagination);
          }
        }
      } catch (err) {
        toast.error(err?.response?.data?.message || 'Failed to retrieve users');
      } finally {
        setIsLoading(false);
      }
    },
    [search, roleFilter, statusFilter, pagination.limit]
  );

  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers(1);
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleSaveUser = async (userId, payload) => {
    setIsActionLoading(true);
    try {
      await adminService.updateUser(userId, payload);
      toast.success('User updated successfully');
      fetchUsers(pagination.page);
    } catch (err) {
      throw err;
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;
    setIsActionLoading(true);
    try {
      await adminService.deleteUser(selectedUser._id);
      toast.success(`User ${selectedUser.name} deleted successfully`);
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
      fetchUsers(pagination.page);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete user');
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            User Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            View, moderate, and administer user privileges across the platform.
          </p>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => fetchUsers(pagination.page)}
          disabled={isLoading}
          className="flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card padding="p-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by user name or email..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
            />
          </div>

          {/* Role Filter */}
          <div className="w-full md:w-44">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
            >
              <option value="">All Roles</option>
              <option value="user">Standard Users</option>
              <option value="admin">Administrators</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="w-full md:w-44">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
            >
              <option value="">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Suspended Only</option>
            </select>
          </div>

          <Button type="submit" variant="primary" size="sm" className="whitespace-nowrap">
            Apply Filters
          </Button>
        </form>
      </Card>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-6">User</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 hidden md:table-cell">Joined</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                // Skeletons
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={`skeleton-${index}`}>
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-9 h-9 rounded-full shrink-0" />
                        <div className="space-y-1.5">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-44" />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4"><Skeleton className="h-5 w-16 rounded-full" /></td>
                    <td className="py-4 px-4"><Skeleton className="h-5 w-16 rounded-full" /></td>
                    <td className="py-4 px-4 hidden md:table-cell"><Skeleton className="h-4 w-20" /></td>
                    <td className="py-4 px-4 sm:px-6 text-right"><Skeleton className="h-8 w-20 ml-auto rounded-lg" /></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12">
                    <EmptyState
                      icon={Users}
                      title="No users found"
                      description="No accounts match your current search query or filter parameters."
                    />
                  </td>
                </tr>
              ) : (
                users.map((item) => {
                  const isCurrentAdmin = currentAdmin?._id === item._id;
                  const initials = item.name
                    ? item.name
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase()
                    : 'U';

                  return (
                    <tr
                      key={item._id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {/* User Info */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          {item.avatar ? (
                            <img
                              src={item.avatar}
                              alt={item.name}
                              className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-200 shrink-0">
                              {initials}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-900 truncate">
                                {item.name}
                              </span>
                              {isCurrentAdmin && (
                                <span className="text-[10px] bg-brand-50 text-brand-700 font-semibold px-1.5 py-0.5 rounded border border-brand-200">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-slate-500 block truncate">
                              {item.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <Badge
                          variant={item.role === 'admin' ? 'warning' : 'default'}
                          size="sm"
                          className="gap-1 inline-flex"
                        >
                          {item.role === 'admin' ? (
                            <Shield className="w-3 h-3 text-amber-600" />
                          ) : (
                            <UserCheck className="w-3 h-3 text-slate-500" />
                          )}
                          <span>{item.role}</span>
                        </Badge>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <Badge
                          variant={item.isActive !== false ? 'success' : 'danger'}
                          size="sm"
                        >
                          {item.isActive !== false ? 'Active' : 'Suspended'}
                        </Badge>
                      </td>

                      {/* Joined Date */}
                      <td className="py-3.5 px-4 text-xs text-slate-500 hidden md:table-cell whitespace-nowrap">
                        {formatDate(item.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleEditClick(item)}
                            title="Edit User Role & Status"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteClick(item)}
                            disabled={isCurrentAdmin}
                            title={isCurrentAdmin ? 'You cannot delete yourself' : 'Delete User Permanently'}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Showing page {pagination.page} of {pagination.totalPages} ({pagination.totalItems} total users)
            </span>
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={(newPage) => fetchUsers(newPage)}
            />
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      <UserEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={selectedUser}
        onSave={handleSaveUser}
        isLoading={isActionLoading}
      />

      {/* Delete User Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete User Account"
        message={`Are you sure you want to permanently delete "${selectedUser?.name}" (${selectedUser?.email})? All associated refresh tokens will be revoked immediately.`}
        confirmText="Delete Account"
        confirmVariant="danger"
        isLoading={isActionLoading}
      />
    </div>
  );
};

export default AdminUsersPage;
