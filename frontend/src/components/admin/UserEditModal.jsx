import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Alert from '../common/Alert';
import Badge from '../common/Badge';
import { useAuth } from '../../hooks/useAuth';
import { Shield, UserCheck, AlertTriangle } from 'lucide-react';

export const UserEditModal = ({
  isOpen,
  onClose,
  user,
  onSave,
  isLoading = false,
}) => {
  const { user: currentAdmin } = useAuth();
  const [role, setRole] = useState('user');
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState(null);

  const isSelf = currentAdmin?._id === user?._id;

  useEffect(() => {
    if (user) {
      setRole(user.role || 'user');
      setIsActive(user.isActive !== false);
      setError(null);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (isSelf && !isActive) {
      setError('You cannot deactivate your own administrator account.');
      return;
    }

    if (isSelf && role !== 'admin') {
      setError('You cannot demote your own administrator role.');
      return;
    }

    try {
      await onSave(user._id, { role, isActive });
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to update user.');
    }
  };

  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit User Account" maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <Alert variant="danger" dismissible onDismiss={() => setError(null)}>
            {error}
          </Alert>
        )}

        {isSelf && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 text-amber-800 text-xs rounded-lg border border-amber-200">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>This is your active administrator account. Self-demotion and self-deactivation are protected.</span>
          </div>
        )}

        {/* User Summary */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
          </div>
          <Badge variant={user.role === 'admin' ? 'warning' : 'default'} size="sm">
            {user.role}
          </Badge>
        </div>

        {/* Role Selection */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            System Role
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label
              className={`
                flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-medium cursor-pointer transition-all
                ${
                  role === 'user'
                    ? 'border-brand-500 bg-brand-50/50 text-brand-900 ring-1 ring-brand-500'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }
                ${isSelf ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <input
                type="radio"
                name="role"
                value="user"
                checked={role === 'user'}
                disabled={isSelf}
                onChange={() => setRole('user')}
                className="sr-only"
              />
              <UserCheck className="w-4 h-4 text-slate-500" />
              <span>Standard User</span>
            </label>

            <label
              className={`
                flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-medium cursor-pointer transition-all
                ${
                  role === 'admin'
                    ? 'border-brand-500 bg-brand-50/50 text-brand-900 ring-1 ring-brand-500'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }
              `}
            >
              <input
                type="radio"
                name="role"
                value="admin"
                checked={role === 'admin'}
                onChange={() => setRole('admin')}
                className="sr-only"
              />
              <Shield className="w-4 h-4 text-amber-500" />
              <span>Administrator</span>
            </label>
          </div>
        </div>

        {/* Status Selection */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            Account Status
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label
              className={`
                flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-medium cursor-pointer transition-all
                ${
                  isActive
                    ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900 ring-1 ring-emerald-500'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }
              `}
            >
              <input
                type="radio"
                name="status"
                value="active"
                checked={isActive}
                onChange={() => setIsActive(true)}
                className="sr-only"
              />
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Active</span>
            </label>

            <label
              className={`
                flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-medium cursor-pointer transition-all
                ${
                  !isActive
                    ? 'border-rose-500 bg-rose-50/50 text-rose-900 ring-1 ring-rose-500'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }
                ${isSelf ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <input
                type="radio"
                name="status"
                value="inactive"
                checked={!isActive}
                disabled={isSelf}
                onChange={() => setIsActive(false)}
                className="sr-only"
              />
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>Suspended</span>
            </label>
          </div>
          {!isActive && (
            <p className="mt-1.5 text-xs text-rose-600">
              Deactivating a user immediately revokes all their active refresh tokens and prevents login.
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="secondary" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default UserEditModal;
