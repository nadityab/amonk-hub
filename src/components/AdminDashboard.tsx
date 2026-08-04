'use client';

import React, { useState } from 'react';
import { Product, ProductFormData } from '@/types/product';
import { ProductForm } from './ProductForm';
import { Plus, ShieldCheck, PackageCheck, PackageX, Sparkles } from 'lucide-react';

interface AdminDashboardProps {
  products: Product[];
  onAddProduct: (data: ProductFormData) => Promise<void>;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  onAddProduct,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const totalProducts = products.length;
  const availableProducts = products.filter((p) => p.is_available).length;
  const outOfStockProducts = totalProducts - availableProducts;

  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 sm:p-6 mb-8 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-emerald-200/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                Dashboard Lite POS Admin
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-200/80 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                <Sparkles className="h-3 w-3" /> Live
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Ubah stok dengan 1-klik & tambah katalog produk Warung Amonk
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-emerald-600/30 hover:bg-emerald-700 active:scale-95 transition"
          >
            <Plus className="h-4 w-4" />
            Tambah Produk
          </button>
        </div>
      </div>

      {/* Ringkasan Statistik */}
      <div className="grid grid-cols-3 gap-3 mt-4">
        <div className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-2xs">
          <p className="text-[11px] font-medium text-slate-500">Total Produk</p>
          <p className="text-lg font-bold text-slate-900 mt-0.5">{totalProducts}</p>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-white p-3 shadow-2xs">
          <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-700">
            <PackageCheck className="h-3.5 w-3.5" />
            <span>Tersedia</span>
          </div>
          <p className="text-lg font-bold text-emerald-800 mt-0.5">{availableProducts}</p>
        </div>

        <div className="rounded-xl border border-red-200 bg-white p-3 shadow-2xs">
          <div className="flex items-center gap-1 text-[11px] font-medium text-red-700">
            <PackageX className="h-3.5 w-3.5" />
            <span>Stok Habis</span>
          </div>
          <p className="text-lg font-bold text-red-800 mt-0.5">{outOfStockProducts}</p>
        </div>
      </div>

      {/* Form Tambah Produk Modal */}
      <ProductForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={onAddProduct}
      />
    </div>
  );
};
