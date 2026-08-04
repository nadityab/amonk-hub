'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Product, ProductFormData } from '@/types/product';
import { Header } from '@/components/Header';
import { ProductGrid } from '@/components/ProductGrid';
import { AdminModal } from '@/components/AdminModal';
import { AdminDashboard } from '@/components/AdminDashboard';
import { Store, Heart, RefreshCw } from 'lucide-react';

const INITIAL_MOCK_PRODUCTS: Product[] = [
  {
    id: 'mock-1',
    name: '(Contoh) Nasi Goreng Santri Special',
    price: 13000,
    image_url: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&auto=format&fit=crop&q=80',
    is_available: true,
  },
  {
    id: 'mock-2',
    name: '(Contoh) Es Teh Solo Jumbo',
    price: 3000,
    image_url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&auto=format&fit=crop&q=80',
    is_available: true,
  },
  {
    id: 'mock-3',
    name: '(Contoh) Ayam Geprek Sambal Korek',
    price: 15000,
    image_url: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80',
    is_available: true,
  },
  {
    id: 'mock-4',
    name: '(Contoh) Roti Bakar Coklat Keju',
    price: 10000,
    image_url: 'https://images.unsplash.com/photo-1584776296944-ab6fb57b0bff?w=600&auto=format&fit=crop&q=80',
    is_available: false,
  },
  {
    id: 'mock-5',
    name: '(Contoh) Tempe Mendoan Panas (Isi 5)',
    price: 8000,
    image_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
    is_available: true,
  },
  {
    id: 'mock-6',
    name: '(Contoh) Mie Instan Telur Kornet',
    price: 10000,
    image_url: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=600&auto=format&fit=crop&q=80',
    is_available: true,
  },
];

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isDbConnected, setIsDbConnected] = useState(false);

  // Fetch initial products
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        setProducts(INITIAL_MOCK_PRODUCTS);
        setIsDbConnected(false);
      } else if (data.length === 0) {
        setProducts(INITIAL_MOCK_PRODUCTS);
        setIsDbConnected(true);
      } else {
        setProducts(data);
        setIsDbConnected(true);
      }
    } catch {
      setProducts(INITIAL_MOCK_PRODUCTS);
      setIsDbConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();

    // Setup Supabase Realtime Subscription
    const channel = supabase
      .channel('products-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newProduct = payload.new as Product;
            setProducts((prev) => [
              newProduct,
              ...prev.filter((p) => p.id !== newProduct.id),
            ]);
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as Product;
            setProducts((prev) =>
              prev.map((p) => (p.id === updated.id ? updated : p))
            );
          } else if (payload.eventType === 'DELETE') {
            const oldId = payload.old.id;
            setProducts((prev) => prev.filter((p) => p.id !== oldId));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchProducts]);

  // Handler: Toggle Stok Ketersediaan (1-Klik)
  const handleToggleAvailability = async (id: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;

    // Optimistic UI update
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, is_available: nextStatus } : p))
    );

    if (isDbConnected && !id.startsWith('mock-')) {
      const { error } = await supabase
        .from('products')
        .update({ is_available: nextStatus })
        .eq('id', id);

      if (error) {
        console.error('Gagal memperbarui stok di Supabase:', error);
        // Rollback
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, is_available: currentStatus } : p))
        );
      }
    }
  };

  // Handler: Hapus Produk
  const handleDeleteProduct = async (id: string) => {
    // Optimistic UI delete
    setProducts((prev) => prev.filter((p) => p.id !== id));

    if (isDbConnected && !id.startsWith('mock-')) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) {
        console.error('Gagal menghapus produk dari Supabase:', error);
        fetchProducts();
      }
    }
  };

  // Handler: Tambah Produk Baru
  const handleAddProduct = async (data: ProductFormData) => {
    if (isDbConnected) {
      const { data: newProd, error } = await supabase
        .from('products')
        .insert([data])
        .select()
        .single();

      if (error) {
        console.error('Gagal menambah produk ke Supabase:', error);
        alert('Gagal menambah produk ke Supabase. Menggunakan mode lokal.');
        // Fallback local insert
        const mockNew: Product = {
          ...data,
          id: `local-${Date.now()}`,
        };
        setProducts((prev) => [mockNew, ...prev]);
      } else if (newProd) {
        setProducts((prev) => [
          newProd,
          ...prev.filter((p) => p.id !== newProd.id),
        ]);
      }
    } else {
      // Local insert when DB not connected
      const mockNew: Product = {
        ...data,
        id: `local-${Date.now()}`,
      };
      setProducts((prev) => [mockNew, ...prev]);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Header Navigation */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isAdmin={isAdmin}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
        onLogoutAdmin={() => setIsAdmin(false)}
      />

      {/* Main Container */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
        {/* Banner Selamat Datang */}
        <div className="mb-8 rounded-3xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-block rounded-full bg-emerald-500/30 px-3 py-1 text-xs font-semibold tracking-wide text-emerald-100 backdrop-blur-md mb-3">
              Katalog Digital UMKM Pesantren
            </span>
            <h2 className="text-2xl font-extrabold sm:text-3xl tracking-tight">
              Selamat Datang di Warung Amonk 👋
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              Nikmati kemudahan pesan jajanan, makanan, dan minuman khas santri Pesantren Manbaul Ulum.
              Pilih produk dan pesan langsung secara praktis via WhatsApp!
            </p>
          </div>

          <div className="absolute right-[-20px] bottom-[-20px] opacity-10 pointer-events-none">
            <Store className="h-64 w-64 text-white" />
          </div>
        </div>

        {/* Dashboard Admin (Tampil hanya ketika Admin Login) */}
        {isAdmin && (
          <AdminDashboard
            products={products}
            onAddProduct={handleAddProduct}
            onLogout={() => setIsAdmin(false)}
          />
        )}

        {/* Grid Katalog Produk */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">
              Daftar Jajanan & Makanan
            </h3>
            <button
              onClick={() => fetchProducts()}
              className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 hover:text-emerald-800 transition"
              title="Refresh Data"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Muat Ulang</span>
            </button>
          </div>

          <ProductGrid
            products={products}
            isLoading={isLoading}
            searchQuery={searchQuery}
            isAdmin={isAdmin}
            onToggleAvailability={handleToggleAvailability}
            onDeleteProduct={handleDeleteProduct}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1">
            <span>© 2026 Warung Amonk</span>
            <span>•</span>
            <span>Pesantren Manbaul Ulum</span>
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Dibuat dengan</span>
            <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500" />
            <span>untuk UMKM Pesantren</span>
          </div>
        </div>
      </footer>

      {/* Admin Auth Modal */}
      <AdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onSuccessLogin={() => setIsAdmin(true)}
      />
    </div>
  );
}
