import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function generateWhatsAppLink(
  productName: string,
  price: number,
  customPhone?: string
): string {
  const phone = customPhone || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '6281234567890';
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  
  const formattedPrice = formatRupiah(price);
  const message = `Halo Warung Amonk, saya mau pesan ${productName} (${formattedPrice}). Apakah masih ada?`;
  
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}
