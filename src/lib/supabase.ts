import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  (process.env.NEXT_PUBLIC_SUPABASE_URL || '')
    .trim()
    .replace(/\/rest\/v1\/?$/, '') || 'https://placeholder.supabase.co';
const supabaseAnonKey =
  (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim() || 'placeholder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const PRODUCT_IMAGES_BUCKET = 'product-images';

export async function uploadProductImageBlob(blob: Blob): Promise<string> {
  const fileName = `${crypto.randomUUID?.() ?? `img-${Date.now()}`}.webp`;

  const { error } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(fileName, blob, {
      contentType: 'image/webp',
      cacheControl: '31536000',
      upsert: false,
    });

  if (error) {
    throw new Error(`Gagal mengunggah gambar: ${error.message}`);
  }

  const { data } = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(fileName);
  return data.publicUrl;
}
