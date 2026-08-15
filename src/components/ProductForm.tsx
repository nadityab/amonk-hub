'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { ProductFormData } from '@/types/product';
import { uploadProductImageBlob } from '@/lib/supabase';
import { compressImageToWebP, MAX_FILE_SIZE } from '@/lib/imageCompression';
import {
  PlusCircle,
  X,
  Loader2,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormData) => Promise<void>;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);
  const [fileError, setFileError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const resetForm = () => {
    setName('');
    setPrice('');
    setIsAvailable(true);
    setSelectedFile(null);
    setCompressedBlob(null);
    setCompressedSize(null);
    setFileError('');
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileSelect = async (file: File | undefined | null) => {
    setFileError('');
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFileError('File harus berupa gambar.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setFileError('Ukuran file terlalu besar. Maksimal 10 MB.');
      return;
    }

    try {
      const blob = await compressImageToWebP(file);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const newPreviewUrl = URL.createObjectURL(blob);

      setSelectedFile(file);
      setCompressedBlob(blob);
      setCompressedSize(blob.size);
      setPreviewUrl(newPreviewUrl);
    } catch (err) {
      setFileError(err instanceof Error ? err.message : 'Gagal memproses gambar.');
      setSelectedFile(null);
      setCompressedBlob(null);
      setCompressedSize(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) return;
    if (!selectedFile || !compressedBlob) {
      setFileError('Silakan pilih gambar produk terlebih dahulu.');
      return;
    }

    setIsSubmitting(true);
    try {
      const imageUrl = await uploadProductImageBlob(compressedBlob);
      await onSubmit({
        name: name.trim(),
        price: parseInt(price, 10),
        image_url: imageUrl,
        is_available: isAvailable,
      });
      resetForm();
      onClose();
    } catch (err) {
      console.error(err);
      setFileError(err instanceof Error ? err.message : 'Gagal menyimpan produk.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <PlusCircle className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Tambah Produk Baru
            </h2>
            <p className="text-xs text-slate-500">
              Isi detail produk jajanan / makanan Warung Amonk
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nama Produk */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Produk *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Es Teh Solo / Nasi Goreng Santri"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* Harga Produk */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Harga (Rp) *
            </label>
            <input
              type="number"
              required
              min="0"
              step="500"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Contoh: 5000"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* Upload Gambar Produk */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Gambar Produk *
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files?.[0])}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`w-full rounded-xl border-2 border-dashed p-3 transition flex flex-col items-center gap-2 ${
                previewUrl
                  ? 'border-emerald-300 bg-emerald-50/50'
                  : 'border-slate-300 bg-slate-50 hover:border-emerald-400 hover:bg-emerald-50/50'
              }`}
            >
              {previewUrl ? (
                <>
                  <div className="relative h-40 w-full overflow-hidden rounded-lg">
                    <Image
                      src={previewUrl}
                      alt="Preview Terkompresi"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Gambar siap — otomatis dikompresi ke WebP
                  </div>
                </>
              ) : (
                <>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-emerald-600 shadow-sm">
                    <UploadCloud className="h-5 w-5" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold text-slate-700">
                      Klik untuk pilih gambar
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Format: JPG, PNG, WebP (maks 10 MB)
                    </p>
                  </div>
                </>
              )}
            </button>

            {/* Info ukuran sebelum / sesudah */}
            {selectedFile && compressedSize !== null && (
              <div className="mt-2 flex items-center justify-between rounded-lg bg-slate-100 px-3 py-2 text-[11px]">
                <span className="text-slate-600">
                  Sebelum:{' '}
                  <b className="text-slate-800">{formatBytes(selectedFile.size)}</b>
                </span>
                <span className="text-slate-400">→</span>
                <span className="text-emerald-700">
                  Sesudah: <b>{formatBytes(compressedSize)}</b>
                </span>
              </div>
            )}

            {fileError && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-red-600 font-medium">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{fileError}</span>
              </div>
            )}
          </div>

          {/* Status Awal Stok */}
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div>
              <span className="block text-xs font-semibold text-slate-800">
                Status Stok Awal
              </span>
              <span className="text-[11px] text-slate-500">
                {isAvailable ? 'Langsung dapat dipesan santri' : 'Ditandai Stok Habis'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsAvailable(!isAvailable)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isAvailable ? 'bg-emerald-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isAvailable ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-1/2 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-sm shadow-emerald-600/30 hover:bg-emerald-700 transition disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                'Simpan Produk'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
