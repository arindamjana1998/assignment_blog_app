import React from 'react';
import { Menu, LogOut, Shield } from 'lucide-react';
import Badge from '../common/Badge';

export const AdminHeader = ({ user, onToggleSidebar, onLogout }) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Mobile Sidebar Toggle Button */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 md:hidden focus:outline-none"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="text-xs uppercase tracking-widest font-semibold text-slate-400">
          Platform Overview
        </span>
      </div>

      {/* Admin Profile & Actions */}
      <div className="flex items-center gap-4">
        <Badge variant="warning" size="sm" className="hidden sm:inline-flex gap-1">
          <Shield className="w-3 h-3" />
          <span>Administrator</span>
        </Badge>

        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-slate-900 leading-none">
              {user?.name || 'Administrator'}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">{user?.email || 'admin@blog.local'}</p>
          </div>

          <button
            type="button"
            onClick={onLogout}
            title="Log Out"
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors focus:outline-none"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
