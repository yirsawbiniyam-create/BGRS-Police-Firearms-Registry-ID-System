// Utility to compress and resize images before saving to Firestore to respect the 1MB document limit
export async function compressImage(
  fileOrDataUrl: File | string,
  maxWidth = 600,
  maxHeight = 600,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      if (height > maxHeight) {
        width = Math.round((width * maxHeight) / height);
        height = maxHeight;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        resolve(typeof fileOrDataUrl === 'string' ? fileOrDataUrl : '');
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // SVG or Data URL with alpha: use PNG if transparent, else JPEG
      const isPng =
        (fileOrDataUrl instanceof File && fileOrDataUrl.type === 'image/png') ||
        (typeof fileOrDataUrl === 'string' && fileOrDataUrl.startsWith('data:image/png'));

      const outputFormat = isPng ? 'image/png' : 'image/jpeg';
      const result = canvas.toDataURL(outputFormat, quality);
      resolve(result);
    };

    img.onerror = () => {
      // Fallback
      if (typeof fileOrDataUrl === 'string') {
        resolve(fileOrDataUrl);
      } else {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(fileOrDataUrl);
      }
    };

    if (typeof fileOrDataUrl === 'string') {
      img.src = fileOrDataUrl;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(fileOrDataUrl);
    }
  });
}
