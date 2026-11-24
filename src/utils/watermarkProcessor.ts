// Watermark background purification and enlargement processor
// Automatically converts any logo (SVG or raster PNG/JPEG) into a clean, white-background,
// high-contrast, large watermark suitable for official certificates and ID cards.

/**
 * Transforms an image (data URL or URL) into a watermark with a pure white/transparent background.
 * If the input image has a dark or colored background, it automatically detects and converts
 * that background to pure white/transparent so no dark box or smudge appears on white documents.
 */
export async function convertLogoToWhiteWatermark(logoSrc: string): Promise<string> {
  if (!logoSrc) return '';

  // 1. If it's an SVG data URI or raw SVG
  if (logoSrc.startsWith('data:image/svg+xml') || logoSrc.includes('<svg')) {
    try {
      let svgText = '';
      if (logoSrc.startsWith('data:image/svg+xml;utf8,')) {
        svgText = decodeURIComponent(logoSrc.replace('data:image/svg+xml;utf8,', ''));
      } else if (logoSrc.startsWith('data:image/svg+xml;base64,')) {
        svgText = atob(logoSrc.replace('data:image/svg+xml;base64,', ''));
      } else if (logoSrc.startsWith('data:image/svg+xml,')) {
        svgText = decodeURIComponent(logoSrc.replace('data:image/svg+xml,', ''));
      } else {
        svgText = logoSrc;
      }

      // Convert any dark fills and backgrounds to pure white or transparent
      let cleanedSvg = svgText
        // Replace dark circle/rect/path fills with pure white
        .replace(/fill="#0[Ff]172[Aa]"/g, 'fill="#FFFFFF"')
        .replace(/fill="#1[Ee]293[Bb]"/g, 'fill="#FFFFFF"')
        .replace(/fill="#111827"/g, 'fill="#FFFFFF"')
        .replace(/fill="#020617"/g, 'fill="#FFFFFF"')
        .replace(/fill="#000000"/g, 'fill="#FFFFFF"')
        .replace(/fill="black"/g, 'fill="#FFFFFF"')
        .replace(/fill="url\(#shieldBlue\)"/g, 'fill="#FFFFFF"')
        .replace(/fill="#1[Ee]3[Aa]8[Aa]"/g, 'fill="#FFFFFF"')
        .replace(/fill="#172554"/g, 'fill="#FFFFFF"')
        .replace(/fill="#1[Ee]40[Aa][Ff]"/g, 'fill="#FFFFFF"')
        .replace(/fill="#0[Bb]0[Ff]19"/g, 'fill="#FFFFFF"');

      // Ensure background rects or svg backgrounds are transparent/white
      cleanedSvg = cleanedSvg.replace(/<rect width="100%" height="100%" fill="[^"]*"\/>/g, '');

      return `data:image/svg+xml;utf8,` + encodeURIComponent(cleanedSvg);
    } catch (e) {
      console.warn('SVG watermark parsing error, falling back to canvas processor', e);
    }
  }

  // 2. Raster image processing via HTML5 Canvas
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const width = Math.min(img.width, 900);
        const height = Math.min(img.height, 900);

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (!ctx) {
          resolve(logoSrc);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;

        // Sample corner pixels to detect the outer background color
        const corners = [
          [0, 0],
          [width - 1, 0],
          [0, height - 1],
          [width - 1, height - 1],
        ];

        let bgR = 0, bgG = 0, bgB = 0;
        corners.forEach(([x, y]) => {
          const idx = (y * width + x) * 4;
          bgR += data[idx];
          bgG += data[idx + 1];
          bgB += data[idx + 2];
        });
        bgR = Math.round(bgR / 4);
        bgG = Math.round(bgG / 4);
        bgB = Math.round(bgB / 4);

        // Flood-fill ONLY from outer edges so interior logo text and details are 100% preserved!
        const totalPixels = width * height;
        const visited = new Uint8Array(totalPixels);
        const queue = new Int32Array(totalPixels);
        let head = 0;
        let tail = 0;

        const isOuterBgPixel = (pixelIdx: number): boolean => {
          const i = pixelIdx * 4;
          const a = data[i + 3];
          if (a < 25) return true;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const dist = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);
          return dist < 52;
        };

        for (let x = 0; x < width; x++) {
          const topIdx = x;
          const botIdx = (height - 1) * width + x;
          if (!visited[topIdx] && isOuterBgPixel(topIdx)) {
            visited[topIdx] = 1;
            queue[tail++] = topIdx;
          }
          if (!visited[botIdx] && isOuterBgPixel(botIdx)) {
            visited[botIdx] = 1;
            queue[tail++] = botIdx;
          }
        }
        for (let y = 0; y < height; y++) {
          const leftIdx = y * width;
          const rightIdx = y * width + (width - 1);
          if (!visited[leftIdx] && isOuterBgPixel(leftIdx)) {
            visited[leftIdx] = 1;
            queue[tail++] = leftIdx;
          }
          if (!visited[rightIdx] && isOuterBgPixel(rightIdx)) {
            visited[rightIdx] = 1;
            queue[tail++] = rightIdx;
          }
        }

        while (head < tail) {
          const p = queue[head++];
          const i = p * 4;
          data[i] = 255;
          data[i + 1] = 255;
          data[i + 2] = 255;
          data[i + 3] = 0;

          const x = p % width;
          const y = (p - x) / width;

          if (x > 0) {
            const n = p - 1;
            if (!visited[n] && isOuterBgPixel(n)) { visited[n] = 1; queue[tail++] = n; }
          }
          if (x < width - 1) {
            const n = p + 1;
            if (!visited[n] && isOuterBgPixel(n)) { visited[n] = 1; queue[tail++] = n; }
          }
          if (y > 0) {
            const n = p - width;
            if (!visited[n] && isOuterBgPixel(n)) { visited[n] = 1; queue[tail++] = n; }
          }
          if (y < height - 1) {
            const n = p + width;
            if (!visited[n] && isOuterBgPixel(n)) { visited[n] = 1; queue[tail++] = n; }
          }
        }

        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL('image/png', 0.96));
      } catch (err) {
        console.warn('Canvas watermark transformation error:', err);
        resolve(logoSrc);
      }
    };

    img.onerror = () => {
      resolve(logoSrc);
    };

    img.src = logoSrc;
  });
}
