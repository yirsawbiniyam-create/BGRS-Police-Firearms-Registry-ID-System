// Pure TypeScript ISO/IEC 15417 Code 128B Barcode Encoder
// Generates crisp, scannable vector barcode bar widths for firearm serial numbers.

const CODE128_PATTERNS: string[] = [
  '212222', '222122', '222221', '121223', '121322', '131222', '122213', '122312', '132212', '221213',
  '221312', '231212', '112232', '122132', '122231', '113222', '123122', '123221', '223211', '221132',
  '221231', '213212', '223112', '312131', '311222', '321122', '321221', '312212', '322112', '322211',
  '212123', '212321', '232121', '111323', '131123', '131321', '112313', '132113', '132311', '211313',
  '231113', '231311', '112133', '112331', '132131', '113123', '113321', '133121', '313121', '211331',
  '231131', '213113', '213311', '213131', '311123', '311321', '331121', '312113', '312311', '332111',
  '314111', '221411', '431111', '111224', '111422', '121124', '121421', '141122', '141221', '112214',
  '112412', '122114', '122411', '142112', '142211', '241211', '221114', '413111', '241112', '134111',
  '111242', '121142', '121241', '114212', '124112', '124211', '411212', '421112', '421211', '212141',
  '214121', '412121', '111143', '111341', '131141', '114113', '114311', '411113', '411311', '113141',
  '114131', '311141', '411131', '211412', '211214', '211232', '2331112'
];

export interface BarcodeBar {
  x: number;
  width: number;
}

export function encodeCode128B(rawText: string): { bars: BarcodeBar[]; totalWidth: number } {
  const sanitized = (rawText || 'SN-0000')
    .trim()
    .split('')
    .map((ch) => {
      const code = ch.charCodeAt(0);
      if (code >= 32 && code <= 126) return ch;
      // Deterministic fallback for non-ASCII characters
      return String.fromCharCode(48 + (code % 42));
    })
    .join('') || 'SN-0000';

  const values: number[] = [104]; // Start Code B
  let checksum = 104;

  for (let i = 0; i < sanitized.length; i++) {
    const val = sanitized.charCodeAt(i) - 32;
    values.push(val);
    checksum += val * (i + 1);
  }

  values.push(checksum % 103); // Checksum digit
  values.push(106); // Stop pattern

  const bars: BarcodeBar[] = [];
  let cursor = 0;

  for (const v of values) {
    const pattern = CODE128_PATTERNS[v] || CODE128_PATTERNS[0];
    for (let j = 0; j < pattern.length; j++) {
      const w = parseInt(pattern[j], 10);
      const isBar = j % 2 === 0;
      if (isBar) {
        bars.push({ x: cursor, width: w });
      }
      cursor += w;
    }
  }

  return { bars, totalWidth: cursor };
}
