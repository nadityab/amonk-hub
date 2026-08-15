export const IMAGE_MAX_DIMENSION = 800;
export const IMAGE_QUALITY = 0.8;
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Gagal membaca file gambar'));
    reader.readAsDataURL(file);
  });
}

export async function compressImageToWebP(
  file: File,
  opts?: { maxDimension?: number; quality?: number }
): Promise<Blob> {
  const { maxDimension = IMAGE_MAX_DIMENSION, quality = IMAGE_QUALITY } = opts ?? {};

  if (!file.type.startsWith('image/')) {
    throw new Error('File harus berupa gambar.');
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('Ukuran file terlalu besar. Maksimal 10 MB.');
  }

  const dataUrl = await readFileAsDataURL(file);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        const ratio = Math.min(maxDimension / width, maxDimension / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Browser tidak mendukung kompresi gambar.'));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Gagal mengompresi gambar ke WebP.'));
        },
        'image/webp',
        quality
      );
    };
    img.onerror = () =>
      reject(new Error('Format gambar tidak didukung (mis. HEIC iPhone).'));
    img.src = dataUrl;
  });
}
