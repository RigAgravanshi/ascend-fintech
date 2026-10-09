import fs from 'fs';

export const MAX_PDF_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Validates that a buffer or file begins with the PDF magic header `%PDF-`
 */
export function isPdfMagicBytes(buffer: Buffer): boolean {
  if (!buffer || buffer.length < 5) return false;
  // %PDF- in ASCII: 0x25, 0x50, 0x44, 0x46, 0x2D
  return (
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46 &&
    buffer[4] === 0x2d
  );
}

export function validatePdfFile(filePath: string): { isValid: boolean; error?: string } {
  try {
    const stats = fs.statSync(filePath);
    if (stats.size > MAX_PDF_SIZE_BYTES) {
      return { isValid: false, error: 'File size exceeds 5 MB limit' };
    }
    if (stats.size < 5) {
      return { isValid: false, error: 'File is empty or corrupted' };
    }

    const fd = fs.openSync(filePath, 'r');
    const headerBuffer = Buffer.alloc(5);
    fs.readSync(fd, headerBuffer, 0, 5, 0);
    fs.closeSync(fd);

    if (!isPdfMagicBytes(headerBuffer)) {
      return { isValid: false, error: 'File is not a valid PDF document (magic bytes verification failed)' };
    }

    return { isValid: true };
  } catch (err) {
    return { isValid: false, error: 'Failed to read file for validation' };
  }
}
