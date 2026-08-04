'use client';

import React from 'react';
import { Search, Store, ShieldCheck, X, LogOut } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isAdmin: boolean;
  onOpenAdminModal: () => void;
  onLogoutAdmin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  setSearchQuery,
  isAdmin,
  onOpenAdminModal,
  onLogoutAdmin,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md transition-all">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Logo & Title */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
                <Store className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  Warung Amonk
                </h1>
                <p className="text-xs font-medium text-emerald-700">
                  Pesantren Manbaul Ulum
                </p>
              </div>
            </div>

            {/* Admin Action Button on Mobile */}
            <div className="sm:hidden">
              {isAdmin ? (
                <button
                  onClick={onLogoutAdmin}
                  className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 active:scale-95"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Keluar Admin
                </button>
              ) : (
                <button
                  onClick={onOpenAdminModal}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 active:scale-95"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  Admin
                </button>
              )}
            </div>
          </div>

          {/* Search Bar & Desktop Admin Button */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-80">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Search className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari jajanan / produk..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-8 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Admin Action Button on Desktop */}
            <div className="hidden sm:block">
              {isAdmin ? (
                <button
                  onClick={onLogoutAdmin}
                  className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 hover:shadow-sm active:scale-95"
                >
                  <LogOut className="h-4 w-4" />
                  Keluar Mode Admin
                </button>
              ) : (
                <button
                  onClick={onOpenAdminModal}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:shadow-sm active:scale-95"
                >
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  Admin Login
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
