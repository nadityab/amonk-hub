'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Product } from '@/types/product';
import { formatRupiah, generateWhatsAppLink } from '@/lib/utils';
import { MessageSquare, CheckCircle2, XCircle, Trash2, RefreshCw } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  isAdmin?: boolean;
  onToggleAvailability?: (id: string, currentStatus: boolean) => Promise<void>;
  onDeleteProduct?: (id: string, name: string) => Promise<void>;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isAdmin = false,
  onToggleAvailability,
  onDeleteProduct,
}) => {
  const [imgError, setImgError] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const fallbackImage = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80';

  const handleToggle = async () => {
    if (!onToggleAvailability || isUpdating) return;
    setIsUpdating(true);
    try {
      await onToggleAvailability(product.id, product.is_available);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!onDeleteProduct) return;
    if (confirm(`Apakah Anda yakin ingin menghapus produk "${product.name}"?`)) {
      await onDeleteProduct(product.id, product.name);
    }
  };

  const waLink = generateWhatsAppLink(product.name, product.price);

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-sm transition-all duration-300 hover:border-slate-300 hover:shadow-md">
      <div>
        {/* Product Image & Stock Badge */}
        <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-slate-100">
          <Image
            src={imgError || !product.image_url ? fallbackImage : product.image_url}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgError(true)}
            unoptimized
          />
          
          {/* Badge Stok Realtime */}
          <div className="absolute top-2.5 left-2.5 z-10">
            {product.is_available ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50/95 backdrop-blur-sm px-2.5 py-1 text-xs font-semibold text-emerald-800 shadow-sm">
                <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                Tersedia
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full border border-red-300 bg-red-50/95 backdrop-blur-sm px-2.5 py-1 text-xs font-semibold text-red-800 shadow-sm">
                <XCircle className="h-3 w-3 text-red-600" />
                Habis
              </span>
            )}
          </div>
        </div>

        {/* Product Information */}
        <div className="mt-3 space-y-1">
          <h3 className="line-clamp-2 text-sm font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors">
            {product.name}
          </h3>
          <p className="text-base font-bold text-emerald-700">
            {formatRupiah(product.price)}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 pt-2">
        {isAdmin ? (
          <div className="flex flex-col gap-2">
            <button
              onClick={handleToggle}
              disabled={isUpdating}
              className={`flex w-full items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-xs font-semibold transition active:scale-95 ${
                product.is_available
                  ? 'border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100'
                  : 'border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              {isUpdating ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <>Ubah ke {product.is_available ? 'Habis' : 'Tersedia'}</>
              )}
            </button>

            <button
              onClick={handleDelete}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-white py-1.5 px-3 text-xs font-semibold text-red-600 hover:bg-red-50 transition active:scale-95"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Hapus Produk
            </button>
          </div>
        ) : (
          product.is_available ? (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 px-4 text-xs font-bold text-white shadow-sm shadow-emerald-600/30 hover:bg-emerald-700 active:scale-95 transition-all"
            >
              <MessageSquare className="h-4 w-4 fill-white" />
              Pesan via WA
            </a>
          ) : (
            <button
              disabled
              className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-100 py-2.5 px-4 text-xs font-semibold text-slate-400"
            >
              Stok Habis
            </button>
          )
        )}
      </div>
    </div>
  );
};
