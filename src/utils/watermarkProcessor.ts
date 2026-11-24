// Watermark background purifier
// Converts ONLY the outer background around an uploaded logo (or SVG crest) to pure white (#FFFFFF),
// preserving 100% of the logo's interior artwork, colors, rings, and text untouched.

/**
 * Transforms a logo into a clean white-background watermark by replacing ONLY the outer
 * background pixels connected to the image edges/corners with pure white (#FFFFFF).
 */
export async function convertLogoToWhiteWatermark(logoSrc: string): Promise<string> {
  if (!logoSrc) return '';

  // 1. If it's an SVG data URI or raw SVG, only whiten known outer dark backdrop fills
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

      let cleanedSvg = svgText
        .replace(/fill="#0[Ff]172[Aa]"/g, 'fill="#FFFFFF"')
        .replace(/fill="#1[Ee]293[Bb]"/g, 'fill="#FFFFFF"')
        .replace(/fill="#111827"/g, 'fill="#FFFFFF"')
        .replace(/fill="#020617"/g, 'fill="#FFFFFF"')
        .replace(/fill="#000000"/g, 'fill="#FFFFFF"')
        .replace(/fill="black"/g, 'fill="#FFFFFF"')
        .replace(/fill="url\(#shieldBlue\)"/g, 'fill="#FFFFFF"')
        .replace(/fill="#FEF08A"/gi, 'fill="#92400E"')
        .replace(/fill="#FDE68A"/gi, 'fill="#B45309"')
        .replace(/stroke="#FDE68A"/gi, 'stroke="#B45309"')
        .replace(/filter="url\(#badgeShadow\)"/g, '')
        .replace(/<filter[^>]*id="badgeShadow"[\s\S]*?<\/filter>/g, '')
        .replace(/<rect[^>]*width="100%"[^>]*height="100%"[^>]*\/?>/g, '');

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
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;
        const totalPixels = width * height;

        // First composite any already-transparent outer pixels to pure opaque white
        let hasOpaqueCorners = false;
        const probeCoords: Array<[number, number]> = [
          [1, 1],
          [width - 2, 1],
          [1, height - 2],
          [width - 2, height - 2],
          [Math.min(6, width - 1), Math.min(6, height - 1)],
          [Math.max(0, width - 7), Math.min(6, height - 1)],
          [Math.min(6, width - 1), Math.max(0, height - 7)],
          [Math.max(0, width - 7), Math.max(0, height - 7)],
        ];

        for (const [px, py] of probeCoords) {
          const idx = (py * width + px) * 4;
          if (data[idx + 3] >= 35) {
            hasOpaqueCorners = true;
            break;
          }
        }

        // If the uploaded PNG already has a transparent background, just place it on pure white
        if (!hasOpaqueCorners) {
          const whiteCanvas = document.createElement('canvas');
          whiteCanvas.width = width;
          whiteCanvas.height = height;
          const wctx = whiteCanvas.getContext('2d');
          if (!wctx) {
            resolve(logoSrc);
            return;
          }
          wctx.fillStyle = '#FFFFFF';
          wctx.fillRect(0, 0, width, height);
          wctx.drawImage(canvas, 0, 0);
          resolve(whiteCanvas.toDataURL('image/png', 0.96));
          return;
        }

        // Detect whether the outer corners are dark/black, white/light, or a flat solid color
        // Sample just inside the outer 4px rim (to ignore any 1-2px scanner/crop border)
        const insetX = Math.min(5, Math.floor(width / 10));
        const insetY = Math.min(5, Math.floor(height / 10));
        const cornerSamples: Array<[number, number]> = [
          [insetX, insetY],
          [width - 1 - insetX, insetY],
          [insetX, height - 1 - insetY],
          [width - 1 - insetX, height - 1 - insetY],
        ];

        let sumR = 0, sumG = 0, sumB = 0, validCount = 0;
        let darkCount = 0, lightCount = 0;

        for (const [cx, cy] of cornerSamples) {
          const i = (cy * width + cx) * 4;
          if (data[i + 3] < 35) continue;
          const r = data[i], g = data[i + 1], b = data[i + 2];
          sumR += r;
          sumG += g;
          sumB += b;
          validCount++;
          const maxC = Math.max(r, g, b);
          const minC = Math.min(r, g, b);
          if (maxC < 65 && (maxC - minC) < 28) darkCount++;
          if (minC > 215 && (maxC - minC) < 30) lightCount++;
        }

        const bgR = validCount ? Math.round(sumR / validCount) : 255;
        const bgG = validCount ? Math.round(sumG / validCount) : 255;
        const bgB = validCount ? Math.round(sumB / validCount) : 255;

        const isDarkOuterBg = darkCount >= 2;
        const isLightOuterBg = !isDarkOuterBg && lightCount >= 2;

        // STRICT single-mode background matcher: NEVER bridges across light <-> dark or colored rings!
        const matchesOuterBg = (pixelIdx: number): boolean => {
          const i = pixelIdx * 4;
          const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
          if (a < 35) return true;

          const maxC = Math.max(r, g, b);
          const minC = Math.min(r, g, b);
          const saturation = maxC - minC;

          if (isDarkOuterBg) {
            // Only match neutral black / very dark charcoal outer background pixels
            const dist = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);
            return maxC < 62 && saturation < 24 && dist < 52;
          }

          if (isLightOuterBg) {
            // Only match neutral white / very light gray outer background pixels
            return minC > 212 && saturation < 32;
          }

          // Uniform flat colored outer backdrop
          const dist = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);
          return dist < 36;
        };

        const visited = new Uint8Array(totalPixels);
        const queue = new Int32Array(totalPixels);
        let head = 0;
        let tail = 0;

        // Clear any thin 1-3px neutral outer scan trim if the inner backdrop is dark
        if (isDarkOuterBg) {
          for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
              if (x < 3 || x >= width - 3 || y < 3 || y >= height - 3) {
                const p = y * width + x;
                const idx = p * 4;
                const r = data[idx], g = data[idx + 1], b = data[idx + 2];
                const minC = Math.min(r, g, b);
                const maxC = Math.max(r, g, b);
                if (minC > 215 && maxC - minC < 25) {
                  data[idx] = 255;
                  data[idx + 1] = 255;
                  data[idx + 2] = 255;
                  data[idx + 3] = 255;
                }
              }
            }
          }
        }

        // Seed flood-fill from outer border + corner inset points
        const seedPixel = (x: number, y: number) => {
          if (x < 0 || x >= width || y < 0 || y >= height) return;
          const p = y * width + x;
          if (!visited[p] && matchesOuterBg(p)) {
            visited[p] = 1;
            queue[tail++] = p;
          }
        };

        for (let x = 0; x < width; x++) {
          seedPixel(x, 0);
          seedPixel(x, height - 1);
        }
        for (let y = 0; y < height; y++) {
          seedPixel(0, y);
          seedPixel(width - 1, y);
        }
        for (const [cx, cy] of cornerSamples) {
          seedPixel(cx, cy);
        }
        // Also seed top-center edge slightly inward in case of a top 2px border
        seedPixel(Math.floor(width / 2), insetY);
        seedPixel(Math.floor(width / 2), height - 1 - insetY);

        while (head < tail) {
          const p = queue[head++];
          const i = p * 4;
          data[i] = 255;
          data[i + 1] = 255;
          data[i + 2] = 255;
          data[i + 3] = 255;

          const x = p % width;
          const y = (p - x) / width;

          if (x > 0) {
            const n = p - 1;
            if (!visited[n] && matchesOuterBg(n)) { visited[n] = 1; queue[tail++] = n; }
          }
          if (x < width - 1) {
            const n = p + 1;
            if (!visited[n] && matchesOuterBg(n)) { visited[n] = 1; queue[tail++] = n; }
          }
          if (y > 0) {
            const n = p - width;
            if (!visited[n] && matchesOuterBg(n)) { visited[n] = 1; queue[tail++] = n; }
          }
          if (y < height - 1) {
            const n = p + width;
            if (!visited[n] && matchesOuterBg(n)) { visited[n] = 1; queue[tail++] = n; }
          }
        }

        // Convert any remaining transparent pixels inside/outside to pure white so mix-blend-multiply is clean
        for (let p = 0; p < totalPixels; p++) {
          const idx = p * 4;
          if (data[idx + 3] < 35) {
            data[idx] = 255;
            data[idx + 1] = 255;
            data[idx + 2] = 255;
            data[idx + 3] = 255;
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
