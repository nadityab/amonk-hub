'use client';

import React, { useState, useMemo } from 'react';
import { Product } from '@/types/product';
import { ProductCard } from './ProductCard';
import { PackageX, SlidersHorizontal } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
  searchQuery: string;
  isAdmin?: boolean;
  onToggleAvailability?: (id: string, currentStatus: boolean) => Promise<void>;
  onDeleteProduct?: (id: string, name: string) => Promise<void>;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  isLoading,
  searchQuery,
  isAdmin = false,
  onToggleAvailability,
  onDeleteProduct,
}) => {
  const [filter, setFilter] = useState<'all' | 'available' | 'unavailable'>('all');

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Filter by Search Query
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase().trim());

      // Filter by Availability Status
      if (filter === 'available') return matchesSearch && product.is_available;
      if (filter === 'unavailable') return matchesSearch && !product.is_available;
      return matchesSearch;
    });
  }, [products, searchQuery, filter]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm animate-pulse"
          >
            <div className="aspect-square w-full rounded-xl bg-slate-200" />
            <div className="mt-3 space-y-2">
              <div className="h-4 w-3/4 rounded bg-slate-200" />
              <div className="h-4 w-1/2 rounded bg-slate-200" />
            </div>
            <div className="mt-4 h-9 w-full rounded-xl bg-slate-200" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-1.5 rounded-xl bg-slate-100 p-1">
          <button
            onClick={() => setFilter('all')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              filter === 'all'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua ({products.length})
          </button>
          <button
            onClick={() => setFilter('available')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              filter === 'available'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tersedia ({products.filter((p) => p.is_available).length})
          </button>
          <button
            onClick={() => setFilter('unavailable')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              filter === 'unavailable'
                ? 'bg-white text-red-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Habis ({products.filter((p) => !p.is_available).length})
          </button>
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-1">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>Menampilkan {filteredProducts.length} produk</span>
        </div>
      </div>

      {/* Grid Container */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filteredProducts.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              isAdmin={isAdmin}
              priority={index === 0}
              onToggleAvailability={onToggleAvailability}
              onDeleteProduct={onDeleteProduct}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-3">
            <PackageX className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">
            Produk Tidak Ditemukan
          </h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm">
            {searchQuery
              ? `Tidak ada produk yang cocok dengan pencarian "${searchQuery}".`
              : 'Belum ada produk yang terdaftar dalam kategori ini.'}
          </p>
        </div>
      )}
    </div>
  );
};
